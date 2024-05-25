"use client";

import { useAppSelector } from "@/store";
import { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { current_workspace } = useAppSelector((store) => store.workspace);

  const connect = useCallback(() => {
    if (!current_workspace) return;
    if (!current_workspace?.id) return;

    if (current_workspace.type === "shared") {
      setSocket(
        io("http://localhost:3001", {
          auth: {
            userId: current_workspace.workspaceOwnerId,
          },
        })
      );
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [current_workspace?.id]);

  useEffect(() => {
    connect();
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [current_workspace?.id]);

  return {
    socket,
  };
};
