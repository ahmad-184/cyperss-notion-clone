"use client";

import { Context } from "@/contexts/local-context";
import { useAppSelector } from "@/store";
import { useSession } from "next-auth/react";
import { useContext, useEffect, useRef, useState } from "react";
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
  const [ping, setPing] = useState(0);
  const [pingChanged, setPingChange] = useState(false);
  const timeOut = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reconnecting, setReconnecting] = useState(false);

  const handleReconnect = () => {
    if (socket && socket?.disconnected) {
      socket.connect();
    }
  };

  const server_url =
    APP_MODE === "production"
      ? REALTIMNE_SERVER_PRODUCTION
      : REALTIMNE_SERVER_DEVELOPMENT;

  useEffect(() => {
    if (
      !current_workspace ||
      current_workspace.type !== "shared" ||
      !socket ||
      !socket.connected ||
      !session?.user.id
    )
      return;

    timeOut.current = setTimeout(() => {
      const newDate = Date.now();
      socket.emit("ping", newDate, (date: number) => {
        const t = Date.now() - date;
        setPing(t);
        setPingChange((prev) => !prev);
      });
    }, 1000);

    return () => {
      if (timeOut.current) clearTimeout(timeOut.current);
    };
  }, [
    ping,
    socket,
    socket?.disconnected,
    socket?.connected,
    current_workspace?.id,
    current_workspace?.type,
    pingChanged,
    session,
  ]);

  useEffect(() => {
    if (
      !session?.user.id ||
      !current_workspace ||
      current_workspace?.type !== "shared" ||
      !current_workspace?.id
    ) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

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
        console.log("disconnect");
        setConnection(false);
      });

      s.io.on("reconnect", () => {
        s.emit("join_room", current_workspace.id);
        setConnection(true);
        setReconnecting(false);
      });

      s.io.on("reconnect_attempt", (attempt) => {
        console.log(attempt);
        setReconnecting(true);
        // ...
      });

      s.io.on("error", (data) => {
        console.log("error");
        //
      });

      s.on("connect_error", (error) => {
        console.log("connect_error");
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
    ping,
    reconnecting,
  };
};
