"use client";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "@/store";
import { getAllWorkspacesThunk } from "@/store/slices/workspace/thunk-actions";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (storeRef.current) {
      storeRef.current.dispatch(getAllWorkspacesThunk());
    }
  }, [storeRef.current]);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
