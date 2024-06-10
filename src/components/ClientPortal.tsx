import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type ClientPortalInterface = {
  children: React.ReactNode;
  show?: boolean;
  selector: string;
};

const ClientPortal = ({ children, selector, show }: ClientPortalInterface) => {
  const ref = useRef<Element | null>(null);
  useEffect(() => {
    if (document) {
      const wrapper = document.createElement("div");
      wrapper.id = selector;
      document.body.append(wrapper);
      ref.current = document.getElementById(selector);
    }
  }, [selector]);
  return show && ref.current ? createPortal(children, ref.current) : null;
};

export default ClientPortal;
