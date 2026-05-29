import { useMemo } from "react";
import { Avatar as DiceBearAvatar } from "@dicebear/core";
import loreleiStyle from "@dicebear/styles/lorelei.json";
import { useUserStore } from "../store/user.store";

export default function Avatar({ size = "8" }: { size?: string }) {
  const user = useUserStore((s) => s.user);

  console.log("user in avatar", user);

  const avatarUri = useMemo(
    () =>
      new DiceBearAvatar(loreleiStyle, {
        seed: user?.display_name ?? "default",
      }).toDataUri(),
    [user?.display_name],
  );

  return (
    <img
      src={avatarUri}
      alt={user?.display_name ?? "avatar"}
      className={`size-${size} rounded-full`}
    />
  );
}
