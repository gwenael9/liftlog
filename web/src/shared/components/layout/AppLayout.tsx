import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
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
import { useUserStore } from "@/shared/store/user.store";
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
import { LanguageToggle } from "../LanguageToggle";
import { ThemeToggle } from "../ThemeToggle";
import Avatar from "../Avatar";

export function AppLayout() {
  const { t } = useTranslation();
  const logout = useLogout();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const user = useUserStore((s) => s.user);
  useCurrentUser();

  const navLinks = [
    { to: "/sessions", label: t("nav.sessions"), icon: CalendarDays },
    { to: "/templates", label: t("nav.templates"), icon: LayoutTemplate },
    { to: "/stats", label: t("nav.stats"), icon: BarChart2 },
    { to: "/account", label: t("nav.account"), icon: UserRound },
    { to: "/admin", label: t("nav.admin"), icon: ShieldCheck, adminOnly: true },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link to="/sessions" className="font-bold tracking-tight">
            LiftLog
          </Link>
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
                      <Avatar />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="min-w-52">
                  <div className="flex flex-col items-center pt-2">
                    <Avatar size="16" />
                    {user?.display_name && (
                      <div className="px-2 py-1.5 text-sm font-medium">
                        {user.display_name}
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {navLinks.map(
                      ({ to, label, icon: Icon, adminOnly }) =>
                        (!adminOnly || role === "admin") && (
                          <DropdownMenuItem
                            key={to}
                            onClick={() => navigate(to)}
                            className="cursor-pointer"
                          >
                            <Icon className="size-4" />
                            {label}
                          </DropdownMenuItem>
                        ),
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={logout}
                    className="cursor-pointer"
                  >
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
