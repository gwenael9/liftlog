import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useCurrentUser,
  useUpdateMe,
  useDeleteMe,
} from "@/shared/hooks/useAuth";
import { usePreferences } from "@/shared/hooks/usePreferences";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "sonner";
import { SUPPORTED_LANGUAGES } from "@/shared/i18n";
import { Edit } from "lucide-react";
import Avatar from "@/shared/components/Avatar";

export function AccountPage() {
  const { t } = useTranslation();
  const { data: user, isLoading } = useCurrentUser();
  const updateMe = useUpdateMe();
  const deleteMe = useDeleteMe();
  const prefs = usePreferences();

  const [displayName, setDisplayName] = useState<string>("");
  const [editingName, setEditingName] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [localColor, setLocalColor] = useState<string>("");

  const currentPrimaryColor = localColor || prefs.couleur_primary;

  function startEdit() {
    setDisplayName(user?.display_name ?? "");
    setEditingName(true);
  }

  function cancelEdit() {
    setEditingName(false);
    setDisplayName("");
  }

  async function handleSaveName() {
    await updateMe.mutateAsync(
      { display_name: displayName || undefined },
      {
        onSuccess: () => {
          toast.success(t("account.nameSaved"));
          setEditingName(false);
        },
        onError: () => toast.error(t("account.saveError")),
      },
    );
  }

  async function handleDeleteAccount() {
    await deleteMe.mutateAsync(undefined, {
      onError: () => toast.error(t("account.deleteError")),
    });
  }

  function handleThemeChange(value: string | null) {
    if (!value || value === prefs.theme) return;
    prefs.setTheme(value as "light" | "dark");
  }

  function handleLanguageChange(value: string | null) {
    if (!value) return;
    prefs.setLanguage(value);
  }

  function handleSaveColor() {
    prefs.setCouleurPrimary(currentPrimaryColor);
  }

  function handleUnitChange(value: string | null) {
    if (!value) return;
    updateMe.mutate(
      { unit_system: value as "kg" | "lbs" },
      { onError: () => toast.error(t("account.saveError")) },
    );
  }

  return (
    <PageContainer>
      <h2 className="text-2xl font-bold">{t("account.title")}</h2>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Avatar />
            <CardTitle>{t("account.infoTitle")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  {t("account.email")}
                </Label>
                <p className="text-sm font-medium truncate">{user?.email}</p>
              </div>

              {user?.role === "admin" ? (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">
                    {t("account.role")}
                  </Label>
                  <p className="text-sm font-medium capitalize">{user?.role}</p>
                </div>
              ) : (
                <div className="space-y-1"></div>
              )}

              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  {t("account.displayName")}
                </Label>
                {editingName ? (
                  <div className="flex gap-2 items-center flex-wrap">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      maxLength={100}
                      className="w-full sm:max-w-xs"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      disabled={updateMe.isPending}
                    >
                      {t("common.save")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      {t("common.cancel")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <p className="text-sm font-medium truncate">
                      {user?.display_name ?? (
                        <span className="text-muted-foreground italic">
                          {t("account.noDisplayName")}
                        </span>
                      )}
                    </p>
                    <Button size="sm" variant="ghost" onClick={startEdit}>
                      <Edit />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  {t("account.sex")}
                </Label>
                <p className="text-sm font-medium">
                  {user?.sex === "male"
                    ? t("auth.register.sexMale")
                    : t("auth.register.sexFemale")}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  {t("account.memberSince")}
                </Label>
                <p className="text-sm font-medium">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("account.preference")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">{t("account.theme")}</Label>
            <Select value={prefs.theme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-40">
                {prefs.theme === "light"
                  ? t("account.themeLight")
                  : t("account.themeDark")}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t("account.themeLight")}</SelectItem>
                <SelectItem value="dark">{t("account.themeDark")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">{t("account.language")}</Label>
            <Select value={prefs.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-40">
                {prefs.language === "fr"
                  ? t("account.languageFr")
                  : t("account.languageEn")}
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {t(
                      `account.language${lang.charAt(0).toUpperCase() + lang.slice(1)}`,
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">{t("account.unitSystem")}</Label>
            {isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <Select
                value={user?.unit_system}
                onValueChange={handleUnitChange}
              >
                <SelectTrigger className="w-40">
                  {user?.unit_system === "kg"
                    ? t("account.unitKg")
                    : t("account.unitLbs")}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">{t("account.unitKg")}</SelectItem>
                  <SelectItem value="lbs">{t("account.unitLbs")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">{t("account.couleurPrimary")}</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentPrimaryColor}
                onChange={(e) => setLocalColor(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5"
              />
              <Button
                size="sm"
                onClick={handleSaveColor}
                disabled={prefs.isPending}
              >
                {t("common.save")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">
            {t("account.dangerZone")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t("account.deleteDescription")}
          </p>
          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={isLoading}
          >
            {t("account.deleteAccount")}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("account.deleteConfirm")}
        onConfirm={handleDeleteAccount}
        isPending={deleteMe.isPending}
      />
    </PageContainer>
  );
}
