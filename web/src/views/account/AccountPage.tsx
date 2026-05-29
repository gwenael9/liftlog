import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCurrentUser, useUpdateMe, useDeleteMe } from "@/shared/hooks/useAuth";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "sonner";

export function AccountPage() {
  const { t } = useTranslation();
  const { data: user, isLoading } = useCurrentUser();
  const updateMe = useUpdateMe();
  const deleteMe = useDeleteMe();

  const [displayName, setDisplayName] = useState<string>("");
  const [editingName, setEditingName] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  return (
    <PageContainer>
      <h2 className="text-2xl font-bold">{t("account.title")}</h2>

      <Card>
        <CardHeader>
          <CardTitle>{t("account.infoTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-5 w-32" />
            </>
          ) : (
            <>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">{t("account.email")}</Label>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">{t("account.displayName")}</Label>
                {editingName ? (
                  <div className="flex gap-2 items-center">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      maxLength={100}
                      className="max-w-xs"
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
                    <p className="text-sm font-medium">
                      {user?.display_name ?? (
                        <span className="text-muted-foreground italic">
                          {t("account.noDisplayName")}
                        </span>
                      )}
                    </p>
                    <Button size="sm" variant="ghost" onClick={startEdit}>
                      {t("common.edit")}
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">{t("account.role")}</Label>
                <p className="text-sm font-medium capitalize">{user?.role}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">{t("account.memberSince")}</Label>
                <p className="text-sm font-medium">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">{t("account.dangerZone")}</CardTitle>
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
