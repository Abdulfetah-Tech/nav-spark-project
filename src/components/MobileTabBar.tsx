import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, CalendarCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const HIDDEN_ROUTES = ["/auth", "/reset-password", "/.lovable/oauth/consent"];

/** Bottom navigation for touch devices; hidden from md upwards. */
export function MobileTabBar() {
  const location = useLocation();
  const { status } = useAuth();

  if (HIDDEN_ROUTES.some((route) => location.pathname.startsWith(route))) return null;

  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/providers", label: "Services", icon: Search },
    { to: "/dashboard", label: "Bookings", icon: CalendarCheck },
    { to: status === "authenticated" ? "/profile" : "/auth", label: "Account", icon: User },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={label}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
