import { useMemo } from "react";
import { Avatar as DiceBearAvatar } from "@dicebear/core";
import loreleiStyle from "@dicebear/styles/lorelei.json";
import { useUserStore } from "../store/user.store";
import { usePreferencesStore } from "../store/preferences.store";

export default function Avatar({ size = 32 }: { size?: number }) {
  const user = useUserStore((s) => s.user);
  const couleur_primary = usePreferencesStore((s) => s.couleur_primary);

  const avatarUri = useMemo(
    () =>
      new DiceBearAvatar(loreleiStyle, {
        seed: user?.display_name ?? undefined,
        size,
        backgroundColor: [couleur_primary.replace("#", "")],
        borderRadius: 20,
      }).toDataUri(),
    [size, user?.display_name, couleur_primary],
  );

  return <img src={avatarUri} alt={user?.display_name ?? "avatar"} />;
}
