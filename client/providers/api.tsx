"use client";

import { useSession } from "@/stores/auth";
import { createContext, useEffect, useState, type ReactNode } from "react";
import { Client } from "rpc";
import type { Routers } from "server";

type APIContextType = {
  client: Client<Routers>;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

export const APIContext = createContext<APIContextType | null>(null);

type APIProviderProps = {
  children: ReactNode;
};

export function APIProvider({ children }: APIProviderProps) {
  const [clientInstance] = useState<Client<Routers>>(
    new Client<Routers>(
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3500"
    )
  );

  const accessToken = useSession((state) => state.accessToken);
  const isAuthenticated = useSession((state) => !!state.user);
  const zustandLogin = useSession((state) => state.login);
  const zustandLogout = useSession((state) => state.logout);

  useEffect(() => {
    if (accessToken) {
      clientInstance.setAccessToken(accessToken);
    }
  }, [accessToken, clientInstance]);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = useSession.getState().checkAuthStatus;
    checkAuth();
  }, []);

  return (
    <APIContext.Provider
      value={{
        client: clientInstance,
        isAuthenticated,
        login: zustandLogin,
        logout: zustandLogout,
      }}
    >
      {children}
    </APIContext.Provider>
  );
}
