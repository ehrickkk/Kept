import { Home, Info, User } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import type { NavBarProps } from "./PillNavBar";

function TabContent({
  icon,
  label,
  active,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <span
      className={`flex flex-col items-center gap-[2px] transition-colors duration-300 ease-out ${
        active ? "text-accent" : "text-text-muted"
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium leading-tight">{label}</span>
      <span
        aria-hidden="true"
        className={`h-1 w-1 rounded-full transition-opacity duration-300 ${
          active ? "bg-accent opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
}

function TabLink({
  to,
  end,
  label,
  icon,
}: {
  to: string;
  end?: boolean;
  label: string;
  icon: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className="flex min-h-11 min-w-11 items-center justify-center px-5 py-2"
    >
      {({ isActive }) => (
        <TabContent icon={icon} label={label} active={isActive} />
      )}
    </NavLink>
  );
}

/** Floating pill bottom navigation, tablet and mobile (below lg) only. */
export function BottomNavBar({
  onAccountClick,
  accountActive,
  hasSession,
}: NavBarProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="glass-panel fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 rounded-full border lg:hidden"
    >
      <div className="flex items-center gap-1 px-8 py-0.1">
        <TabLink
          to="/"
          end
          label="Kept"
          icon={
            <span
              aria-hidden="true"
              className="h-5 w-5 bg-current transition-colors duration-300 ease-out"
              style={{
                maskImage: "url(/kept-icon.png)",
                WebkitMaskImage: "url(/kept-icon.png)",
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
              }}
            />
          }
        />

        {/* <span aria-hidden="true" className="mx-1 h-6 w-px bg-white/10" /> */}

        <TabLink
          to="/home"
          end
          label="Home"
          icon={<Home size={20} strokeWidth={1.75} />}
        />
        <TabLink
          to="/about"
          label="About"
          icon={<Info size={20} strokeWidth={1.75} />}
        />
        <button
          type="button"
          onClick={onAccountClick}
          aria-label="Account"
          aria-haspopup={hasSession ? "dialog" : undefined}
          className="flex min-h-11 min-w-11 items-center justify-center px-3 py-1"
        >
          <TabContent
            icon={<User size={20} strokeWidth={1.75} />}
            label="Account"
            active={accountActive}
          />
        </button>
      </div>
    </nav>
  );
}
