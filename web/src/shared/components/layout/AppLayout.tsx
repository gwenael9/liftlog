import { Link, Outlet, useLocation } from "react-router-dom";
import {
  CalendarDays,
  LayoutTemplate,
  BarChart2,
  ShieldCheck,
  LogOut,
  UserRound,
} from "lucide-react";
import { useLogout, useCurrentUser } from "@/shared/hooks/useAuth";
import { useAuthStore } from "@/shared/store/auth.store";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "../ThemeToggle";
import ProfileButton from "../ProfileButton";

export interface NavLink {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

export function AppLayout() {
  const { t } = useTranslation();
  const logout = useLogout();
  const { pathname } = useLocation();
  const role = useAuthStore((s) => s.role);
  useCurrentUser();

  const navLinks: NavLink[] = [
    { to: "/sessions", label: t("nav.sessions"), icon: CalendarDays },
    { to: "/templates", label: t("nav.templates"), icon: LayoutTemplate },
    { to: "/stats", label: t("nav.stats"), icon: BarChart2 },
    { to: "/account", label: t("nav.account"), icon: UserRound },
    { to: "/admin", label: t("nav.admin"), icon: ShieldCheck, adminOnly: true },
  ];

  const headerLinks = navLinks.filter((link) =>
    ["/sessions", "/templates"].includes(link.to),
  );
  const profileLinks = navLinks.filter(
    (link) => !["/sessions", "/templates"].includes(link.to),
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/sessions" className="font-bold tracking-tight">
              LiftLog
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              {headerLinks.map(({ to, label }) => {
                const active = pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden md:flex">
              <ProfileButton navLinks={profileLinks} />
            </div>
            <Button
              variant="destructive"
              className="md:hidden"
              onClick={logout}
            >
              <LogOut />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-card">
        <div className="flex items-center justify-around h-16">
          {navLinks.map(({ to, label, icon: Icon, adminOnly }) => {
            const active = pathname.startsWith(to);
            if (adminOnly && role !== "admin") return null;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("size-5", active && "text-primary")} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
