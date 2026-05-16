import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi, type LoginDto, type RegisterDto } from "@/shared/api/auth";
import { usersApi } from "@/shared/api/users";
import { useAuthStore } from "@/shared/store/auth.store";

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data, error } = await usersApi.getMe();
      if (error) throw error;
      return data!;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
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
  const navigate = useNavigate();

  return () => {
    logout();
    navigate("/auth");
  };
}
