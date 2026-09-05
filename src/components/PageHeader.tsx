import type { FC, ReactNode } from 'react'
import './PageHeader.css'

interface PageHeaderProps {
  title: string
  actions?: ReactNode
  hideTitle?: boolean
}

const PageHeader: FC<PageHeaderProps> = ({ title, actions, hideTitle }) => (
  <div className="page-header">
    {!hideTitle && <h1 className="page-title">{title}</h1>}
    {actions && <div className="page-header-actions">{actions}</div>}
  </div>
)

export default PageHeader
