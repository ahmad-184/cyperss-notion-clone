"use client";

import { Context } from "@/contexts/local-context";
import { useAppSelector } from "@/store";
import { useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const { current_workspace } = useAppSelector((store) => store.workspace);
  const {
    REALTIMNE_SERVER_DEVELOPMENT,
    REALTIMNE_SERVER_PRODUCTION,
    APP_MODE,
  } = useContext(Context);
  const { data: session } = useSession();

  const [connection, setConnection] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const handleReconnect = () => {
    if (socket && socket?.disconnected) {
      socket.connect();
    }
  };

  const server_url =
    APP_MODE === "production"
      ? REALTIMNE_SERVER_PRODUCTION
      : REALTIMNE_SERVER_DEVELOPMENT;
  console.log(REALTIMNE_SERVER_PRODUCTION);
  useEffect(() => {
    if (!session?.user.id) return;
    if (!current_workspace) return;
    if (!current_workspace?.id) return;

    if (current_workspace.type === "shared") {
      const s = io(REALTIMNE_SERVER_PRODUCTION, {
        auth: {
          userId: session.user.id,
        },
      });

      s.emit("join_room", current_workspace.id);

      s.on("connect", () => {
        setConnection(true);
      });

      s.on("disconnect", () => {
        setConnection(false);
      });

      s.io.on("reconnect", () => {
        s.emit("join_room", current_workspace.id);
        setConnection(true);
      });

      s.io.on("error", (data) => {
        //
      });

      s.on("connect_error", (error) => {
        if (s.active) {
          // temporary failure, the socket will automatically try to reconnect
        } else {
          // the connection was denied by the server
          // in that case, `socket.connect()` must be manually called in order to reconnect
          console.log(error.message);
        }
      });

      setSocket(s);
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [current_workspace?.id, session, current_workspace?.type]);

  return {
    socket,
    connection,
    reconnect: handleReconnect,
  };
};
