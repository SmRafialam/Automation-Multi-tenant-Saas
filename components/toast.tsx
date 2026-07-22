"use client";

import * as React from "react";
import {
  IconCheck,
  IconClose,
  IconHelp,
  IconSparkle,
} from "@/components/icons";

type ToastType = "success" | "error" | "info" | "ai";
interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  msg: string;
}

const ToastCtx = React.createContext<
  (type: ToastType, title: string, msg: string) => void
>(() => {});

export function useToast() {
  return React.useContext(ToastCtx);
}

const META: Record<
  ToastType,
  { tint: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }
> = {
  success: { tint: "tint-green", Icon: IconCheck },
  error: { tint: "tint-pink", Icon: IconClose },
  info: { tint: "tint-blue", Icon: IconHelp },
  ai: { tint: "tint-violet", Icon: IconSparkle },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);

  const push = React.useCallback(
    (type: ToastType, title: string, msg: string) => {
      const id = ++idRef.current;
      setItems((prev) => [...prev, { id, type, title, msg }]);
      setTimeout(
        () => setItems((prev) => prev.filter((t) => t.id !== id)),
        3400,
      );
    },
    [],
  );

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts">
        {items.map((t) => {
          const { tint, Icon } = META[t.type];
          return (
            <div className="toast" key={t.id}>
              <div className={`ti ${tint}`}>
                <Icon />
              </div>
              <div>
                <b className="bn">{t.title}</b>
                <small className="bn">{t.msg}</small>
              </div>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}
