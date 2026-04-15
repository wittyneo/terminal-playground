import './Navbar.css'

interface Props {
  right?: React.ReactNode
}

export function Navbar({ right }: Props) {
  return (
    <nav className="navbar">
      <div className="navbar__brand">
        {/* Void logo — concentric rings with dark core */}
        <svg className="navbar__logo" width="31" height="31" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
          <circle cx="12" cy="12" r="7"  stroke="currentColor" strokeWidth="0.9" opacity="0.5" />
          <circle cx="12" cy="12" r="4"  stroke="currentColor" strokeWidth="1.1" opacity="0.8" />
          <circle cx="12" cy="12" r="2"  fill="currentColor" />
        </svg>
        Terminal Void
      </div>
      {right && <div className="navbar__right">{right}</div>}
    </nav>
  )
}
