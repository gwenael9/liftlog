import { Link, Outlet, useLocation } from "react-router-dom";
import {
  CalendarDays,
  LayoutTemplate,
  BarChart2,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useLogout } from "@/shared/hooks/useAuth";
import { useAuthStore } from "@/shared/store/auth.store";
import { Button } from "@/shared/components/ui/button";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { LanguageToggle } from "@/shared/components/LanguageToggle";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "react-i18next";

export function AppLayout() {
  const { t } = useTranslation();
  const logout = useLogout();
  const { pathname } = useLocation();
  const role = useAuthStore((s) => s.role);

  const navLinks = [
    { to: "/sessions", label: t("nav.sessions"), icon: CalendarDays },
    { to: "/templates", label: t("nav.templates"), icon: LayoutTemplate },
    { to: "/stats", label: t("nav.stats"), icon: BarChart2 },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link to="/sessions" className="font-bold tracking-tight">
              LiftLog
            </Link>
            <nav className="hidden md:flex items-center gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "text-sm transition-colors",
                    pathname.startsWith(link.to)
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {role === "admin" && (
                <Link
                  to="/admin"
                  className={cn(
                    "text-sm transition-colors",
                    pathname.startsWith("/admin")
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t("nav.admin")}
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button
              variant="destructive"
              size="sm"
              onClick={logout}
              className="hidden md:flex"
            >
              {t("nav.logout")}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="md:hidden text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-card">
        <div className="flex items-center justify-around h-16">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = pathname.startsWith(to);
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
          {role === "admin" && (
            <Link
              to="/admin"
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors",
                pathname.startsWith("/admin")
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <ShieldCheck
                className={cn(
                  "size-5",
                  pathname.startsWith("/admin") && "text-primary",
                )}
              />
              <span>{t("nav.admin")}</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
