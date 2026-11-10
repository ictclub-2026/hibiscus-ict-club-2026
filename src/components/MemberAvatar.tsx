import { useState } from "react";
import { resolveMemberAvatar } from "../mockData";

interface Props {
  user: {
    avatar?: string;
    id?: string;
    fullName?: string;
    email?: string;
    username?: string;
  };
  fullName?: string;
  className?: string;
  imgClassName?: string;
  ringClassName?: string;
}

// Always renders a real portrait photo for a member, falling back to initials
// only if the remote photo fails to load. Guarantees no broken-image icons.
export default function MemberAvatar({
  user,
  fullName,
  className = "h-12 w-12 rounded-2xl",
  imgClassName = "h-full w-full object-cover",
  ringClassName = "",
}: Props) {
  const name = fullName || user.fullName || user.username || "Member";
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const [failed, setFailed] = useState(false);
  const src = resolveMemberAvatar(user);

  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden bg-gradient-to-br from-rose-500 via-fuchsia-600 to-indigo-600 text-sm font-black text-white shadow-lg shadow-rose-500/20 ${className} ${ringClassName}`}
    >
      {failed ? (
        <span className="select-none">{initials}</span>
      ) : (
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className={imgClassName}
        />
      )}
    </span>
  );
}
