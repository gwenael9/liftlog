import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthForm } from "./components/AuthForm";
import { LanguageToggle } from "@/shared/components/LanguageToggle";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export function AuthPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const mode = params.get("tab") === "register" ? "register" : "login";

  function showLogin() {
    setParams({}, { replace: true });
  }
  function showRegister() {
    setParams({ tab: "register" }, { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <div className="flex gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {mode === "register"
              ? t("auth.register.title")
              : t("auth.login.title")}
          </CardTitle>
          <CardDescription>
            {mode === "register"
              ? t("auth.register.description")
              : t("auth.login.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm
            mode={mode}
            onSwitch={mode === "register" ? showLogin : showRegister}
          />
        </CardContent>
      </Card>
    </div>
  );
}
