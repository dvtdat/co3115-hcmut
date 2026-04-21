import { useState } from "react";

export function useLogin() {
  const [isPending, setIsPending] = useState(false);
  async function mutateAsync(_body: { email: string; password: string }) {
    setIsPending(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsPending(false);
    return { token: "mock-token", refreshToken: "mock-refresh" };
  }
  return { mutateAsync, isPending };
}

export function useRegister() {
  const [isPending, setIsPending] = useState(false);
  async function mutateAsync(_body: unknown) {
    setIsPending(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsPending(false);
    return {};
  }
  return { mutateAsync, isPending };
}

export function useRefreshToken() {
  const [isPending, setIsPending] = useState(false);
  async function mutateAsync(_body: unknown) {
    setIsPending(true);
    await new Promise((r) => setTimeout(r, 200));
    setIsPending(false);
    return { token: "mock-token" };
  }
  return { mutateAsync, isPending };
}
