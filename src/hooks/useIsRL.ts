import { useAuth } from "../context/AuthContext";

const RL_EMAILS = ["thiagolima1400@gmail.com", "outroemail@gmail.com"];

export function useIsRL() {
  const { user } = useAuth();
  return {
    isRL: !!user && RL_EMAILS.includes(user.email ?? ""),
    user,
  };
}
