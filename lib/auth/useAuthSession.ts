"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAuthMe, getUserDisplayName, type AuthUser } from "@/lib/auth/client";

export function useAuthSession() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetchAuthMe();
    if (!res.ok) {
      setAvailable(res.reason !== "disabled");
      setUser(null);
      setLoading(false);
      return;
    }
    setAvailable(true);
    setUser(res.user);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      user,
      loading,
      available,
      isLoggedIn: Boolean(user),
      displayName: getUserDisplayName(user),
      isAdmin: user?.role === "admin" || user?.role === "super_admin",
      refresh,
    }),
    [available, loading, refresh, user]
  );
}
