import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  LayoutTemplate,
  BarChart2,
  ShieldCheck,
  LogOut,
  UserRound,
} from "lucide-react";
import { useLogout } from "@/shared/hooks/useAuth";
import { useAuthStore } from "@/shared/store/auth.store";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage } from "../ui/avatar";
import { LanguageToggle } from "../LanguageToggle";
import { ThemeToggle } from "../ThemeToggle";

export function AppLayout() {
  const { t } = useTranslation();
  const logout = useLogout();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);

  const navLinks = [
    { to: "/sessions", label: t("nav.sessions"), icon: CalendarDays },
    { to: "/templates", label: t("nav.templates"), icon: LayoutTemplate },
    { to: "/stats", label: t("nav.stats"), icon: BarChart2 },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
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
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <div className="hidden md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <Avatar>
                        <AvatarImage
                          src="https://api.dicebear.com/10.x/lorelei/svg?flip=none"
                          alt="shadcn"
                        />
                      </Avatar>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="min-w-40">
                  <DropdownMenuGroup>
                    {role === "admin" && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <ShieldCheck />
                        {t("nav.admin")}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate("/account")}>
                      <UserRound />
                      {t("nav.account")}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={logout}>
                    <LogOut />
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          <Link
            to="/account"
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors",
              pathname.startsWith("/account")
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            <UserRound
              className={cn(
                "size-5",
                pathname.startsWith("/account") && "text-primary",
              )}
            />
            <span>{t("nav.account")}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
