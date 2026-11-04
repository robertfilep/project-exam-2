import { useEffect, useState } from "react";

export function notifySessionChange() {
  window.dispatchEvent(new Event("holidaze-session"));
}

export function clearSession() {
  ["token", "username", "avatarUrl"].forEach((key) =>
    localStorage.removeItem(key),
  );
  notifySessionChange();
}

export function useSession() {
  const [, refresh] = useState(0);
  useEffect(() => {
    const update = () => refresh((value) => value + 1);
    window.addEventListener("holidaze-session", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("holidaze-session", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return {
    token: localStorage.getItem("token"),
    username: localStorage.getItem("username"),
    avatarUrl: localStorage.getItem("avatarUrl"),
  };
}
