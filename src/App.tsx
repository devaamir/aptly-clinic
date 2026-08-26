import type { FC } from "react";
import { useState, useEffect } from "react";
import Auth from "./pages/Auth";
import SelectProfile from "./pages/SelectProfile";
import Dashboard from "./pages/Dashboard";
import DeleteAccount from "./pages/DeleteAccount";
import SetPassword from "./pages/SetPassword";
import CreateClinic from "./pages/CreateClinic";
import Toast from "./components/Toast";
import { getContexts, switchContext } from "./services/api";
import { useAppContext } from "./context/AppContext";
import type { UserContext } from "./services/types";

type AppScreen =
  | "auth"
  | "select-profile"
  | "dashboard"
  | "delete-account"
  | "set-password"
  | "create-clinic";

const App: FC = () => {
  const { setTokens, setContexts, setActiveContext, setActiveDoctor } =
    useAppContext();
  const [screen, setScreen] = useState<AppScreen>(() => {
    if (window.location.pathname === "/delete-account") return "delete-account";
    if (window.location.pathname === "/set-password") return "set-password";
    if (localStorage.getItem("pendingClinicSetup") === "true")
      return "create-clinic";
    return localStorage.getItem("accessToken") ? "dashboard" : "auth";
  });
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === "/delete-account") {
        setScreen("delete-account");
      } else if (window.location.pathname === "/set-password") {
        setScreen("set-password");
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
          } else {
            setActiveContext(ctx);
          }
        } catch {
          setActiveContext(ctx);
        }
        setToast(`Only one clinic profile found. Switched to "${ctx.medicalCenter.name}" automatically.`)
        setTimeout(() => setScreen("dashboard"), 2000);
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
    setScreen("dashboard");
  };

  if (screen === "delete-account") return <DeleteAccount />;
  if (screen === "set-password") return <SetPassword />;
  if (screen === "create-clinic")
    return (
      <CreateClinic
        onCreated={handleClinicCreated}
        onBack={() => {
          localStorage.removeItem("pendingClinicSetup");
          setScreen("auth");
        }}
      />
    );
  if (screen === "dashboard") return <Dashboard />;
  if (screen === "select-profile")
    return <SelectProfile onSelect={handleSelectProfile} />;
  return (
    <>
      <Auth onLogin={handleLogin} />
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
};

export default App;
