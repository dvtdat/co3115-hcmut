import { useMutation } from "@tanstack/react-query";
import { userApi, type RegisterRequest } from "@/api/services/user.api";

export function useRegister() {
  return useMutation({
    mutationFn: (body: RegisterRequest) => userApi.register(body),
  });
}
