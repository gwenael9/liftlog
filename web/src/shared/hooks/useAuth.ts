import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi, type LoginDto, type RegisterDto } from "@/shared/api/auth";
import { usersApi, type UpdateUserDto } from "@/shared/api/users";
import { useAuthStore } from "@/shared/store/auth.store";
import { useUserStore } from "@/shared/store/user.store";
import { usePreferencesStore, type StoredPreferences } from "@/shared/store/preferences.store";

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useUserStore((s) => s.setUser);
  const hydrate = usePreferencesStore((s) => s.hydrate);

  const query = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data, error } = await usersApi.getMe();
      if (error) throw error;
      return data!;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!query.data) return;
    setUser(query.data);
    hydrate(query.data.preferences as StoredPreferences | null);
  }, [query.data, setUser, hydrate]);

  return query;
}

async function fetchAndStoreRole(setRole: (role: string) => void) {
  const { data } = await usersApi.getMe();
  if (data?.role) setRole(data.role);
}

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setRole = useAuthStore((s) => s.setRole);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: LoginDto) => {
      const { data, error } = await authApi.login(payload);
      if (error) throw error;
      return data!;
    },
    onSuccess: async (data) => {
      setTokens(data.access_token, data.refresh_token);
      await fetchAndStoreRole(setRole);
      navigate("/sessions");
    },
  });
}

export function useRegister() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setRole = useAuthStore((s) => s.setRole);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: RegisterDto) => {
      const { data, error } = await authApi.register(payload);
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      setTokens(data.access_token, data.refresh_token);
      await fetchAndStoreRole(setRole);
      navigate("/sessions");
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const clearUser = useUserStore((s) => s.clearUser);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return () => {
    logout();
    clearUser();
    queryClient.clear();
    navigate("/auth");
  };
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpdateUserDto) => {
      const { data, error } = await usersApi.updateMe(dto);
      if (error) throw error;
      return data!;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["currentUser"] }),
  });
}

export function useDeleteMe() {
  const logout = useAuthStore((s) => s.logout);
  const clearUser = useUserStore((s) => s.clearUser);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      const { error } = await usersApi.deleteMe();
      if (error) throw error;
    },
    onSuccess: () => {
      logout();
      clearUser();
      navigate("/auth");
    },
  });
}
