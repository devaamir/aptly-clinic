import type { FC } from "react";
import { useState, useEffect } from "react";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import SelectProfile from "./pages/SelectProfile";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import DeleteAccount from "./pages/DeleteAccount";
import SetPassword from "./pages/SetPassword";
import CreateClinic from "./pages/CreateClinic";
import Toast from "./components/Toast";
import { getContexts, switchContext } from "./services/api";
import { useAppContext } from "./context/AppContext";
import type { UserContext } from "./services/types";

type AppScreen =
  | "auth"
  | "register"
  | "select-profile"
  | "dashboard"
  | "delete-account"
  | "set-password"
  | "create-clinic";

const App: FC = () => {
  const { setTokens, setContexts, setActiveContext, setActiveDoctor, logout } =
    useAppContext();
  const [screen, setScreen] = useState<AppScreen>(() => {
    if (window.location.pathname === "/delete-account") return "delete-account";
    if (window.location.pathname === "/set-password") return "set-password";
    if (window.location.pathname === "/register") return "register";
    if (localStorage.getItem("pendingClinicSetup") === "true")
      return "create-clinic";
    // Only go straight to dashboard if we have a token AND a stored active clinic context
    return localStorage.getItem("accessToken")
      ? (localStorage.getItem("selectedContextId") && localStorage.getItem("selectedClinic"))
        ? "dashboard"
        : "select-profile"
      : "auth";
  });
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === "/delete-account") {
        setScreen("delete-account");
      } else if (window.location.pathname === "/set-password") {
        setScreen("set-password");
      } else if (window.location.pathname === "/register") {
        setScreen("register");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const autoSelectOrShowProfiles = async () => {
    try {
      const res = await getContexts();
      if (!res.success) {
        setScreen("select-profile");
        return;
      }

      setContexts(res.data);

      if (res.data.length === 1) {
        // Single profile — auto switch and go straight to dashboard
        const ctx = res.data[0];
        try {
          const switched = await switchContext(ctx.role, ctx.medicalCenter.id);
          if (switched.success) {
            setTokens(switched.data.accessToken, switched.data.refreshToken);
            setActiveContext({
              role: ctx.role,
              medicalCenter: switched.data.medicalCenter,
            });
            setActiveDoctor(switched.data.doctor);
            localStorage.setItem("selectedContextId", ctx.medicalCenter.id);
            setToast(`Only one clinic profile found. Switched to "${ctx.medicalCenter.name}" automatically.`)
            setTimeout(() => setScreen("dashboard"), 2000);
          } else {
            // Switch failed (e.g. doctor-only profile) — show profile selection so user can pick manually
            setScreen("select-profile");
          }
        } catch {
          // Switch threw an error — fall back to profile selection
          setScreen("select-profile");
        }
      } else {
        setScreen("select-profile");
      }
    } catch {
      setScreen("select-profile");
    }
  };

  const handleLogin = (isNewAccount: boolean) => {
    if (isNewAccount) {
      localStorage.setItem("pendingClinicSetup", "true");
      setScreen("create-clinic");
      return;
    }
    autoSelectOrShowProfiles();
  };

  const handleClinicCreated = () => {
    localStorage.removeItem("pendingClinicSetup");
    autoSelectOrShowProfiles();
  };

  const handleSelectProfile = (_ctx: UserContext) => {
    localStorage.setItem("selectedContextId", _ctx.medicalCenter.id);
    setScreen("dashboard");
  };

  if (screen === "delete-account") return <DeleteAccount />;
  if (screen === "set-password") return <SetPassword />;
  if (screen === "register") return <Register />;
  if (screen === "create-clinic")
    return (
      <CreateClinic
        onCreated={handleClinicCreated}
        onBack={() => {
          localStorage.removeItem("pendingClinicSetup");
          localStorage.removeItem("selectedContextId");
          setScreen("auth");
        }}
      />
    );
  if (screen === "dashboard") {
    const selectedRole = localStorage.getItem("selectedRole");
    if (selectedRole === "doctor") {
      return <DoctorDashboard onSwitchProfile={() => setScreen("select-profile")} onSwitchToDashboard={() => setScreen("dashboard")} />;
    }
    return <Dashboard />;
  }
  if (screen === "select-profile")
    return <SelectProfile onSelect={handleSelectProfile} onBack={() => { logout(); setScreen("auth"); }} />;
  return (
    <>
      <Auth onLogin={handleLogin} />
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
};

export default App;
