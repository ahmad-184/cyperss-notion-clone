"use client";

import { useSocket } from "@/hooks/useSocket";
import { createContext } from "react";
import type { Socket } from "socket.io-client";

type ContextType = {
  socket: Socket | null;
};

export const Context = createContext<ContextType>({
  socket: null,
});

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { socket } = useSocket();

  return <Context.Provider value={{ socket }}>{children}</Context.Provider>;
};

export default SocketProvider;
