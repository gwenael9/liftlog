import { useMemo } from "react";
import { Avatar as DiceBearAvatar } from "@dicebear/core";
import loreleiStyle from "@dicebear/styles/lorelei.json";
import { useUserStore } from "../store/user.store";

export default function Avatar({ size = 32 }: { size?: number }) {
  const user = useUserStore((s) => s.user);

  const avatarUri = useMemo(
    () =>
      new DiceBearAvatar(loreleiStyle, {
        seed: user?.display_name ?? undefined,
        size,
        borderRadius: 20,
      }).toDataUri(),
    [size, user?.display_name],
  );

  return <img src={avatarUri} alt={user?.display_name ?? "avatar"} />;
}
