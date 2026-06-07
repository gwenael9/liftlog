import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import Avatar from "./Avatar";
import { useUserStore } from "@/shared/store/user.store";
import type { NavLink } from "./layout/AppLayout";
import { useAuthStore } from "@/shared/store/auth.store";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/shared/hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function ProfileButton({ navLinks }: { navLinks: NavLink[] }) {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.role);
  const user = useUserStore((s) => s.user);
  const navigate = useNavigate();
  const logout = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-52">
        <div className="flex flex-col items-center pt-2">
          <Avatar size={64} />
          {user?.display_name && (
            <div className="w-full px-2 py-1.5 text-sm font-medium text-center overflow-hidden">
              <span className="truncate block">{user.display_name}</span>
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
  );
}
