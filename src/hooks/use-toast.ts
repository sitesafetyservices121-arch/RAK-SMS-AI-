"use client";

import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

// -------------------- Config --------------------
const TOAST_LIMIT = 3; // how many toasts can show at once
const TOAST_REMOVE_DELAY = 5000; // default 5s auto-dismiss

// -------------------- Types --------------------
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  duration?: number; // optional per-toast override
};

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> & { id: string } }
  | { type: "DISMISS_TOAST"; toastId?: ToasterToast["id"] }
  | { type: "REMOVE_TOAST"; toastId?: ToasterToast["id"] };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string, duration?: number) => {
  if (toastTimeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, duration ?? TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

// -------------------- Reducer --------------------
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        // push new toast at the end, drop oldest if above limit
        toasts: [...state.toasts, action.toast].slice(-TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((t) => addToRemoveQueue(t.id, t.duration));
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          toastId === undefined || t.id === toastId ? { ...t, open: false } : t
        ),
      };
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return { ...state, toasts: [] };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
};

// -------------------- Store --------------------
const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

type Toast = Omit<ToasterToast, "id">;

// -------------------- Toast API --------------------
function toast(props: Toast) {
  const id = genId();

  const update = (toast: Partial<ToasterToast>) =>
    dispatch({ type: "UPDATE_TOAST", toast: { ...toast, id } });

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      duration: props.duration ?? TOAST_REMOVE_DELAY,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  if (props.duration !== 0) {
    addToRemoveQueue(id, props.duration);
  }

  return { id, dismiss, update };
}

// 🔥 Convenience helpers
toast.success = (message: string, options: Partial<Toast> = {}) =>
  toast({
    title: "✅ Success",
    description: message,
    ...options,
  });

toast.error = (message: string, options: Partial<Toast> = {}) =>
  toast({
    title: "❌ Error",
    description: message,
    variant: "destructive",
    ...options,
  });

toast.info = (message: string, options: Partial<Toast> = {}) =>
  toast({
    title: "ℹ️ Info",
    description: message,
    ...options,
  });

toast.warning = (message: string, options: Partial<Toast> = {}) =>
  toast({
    title: "⚠️ Warning",
    description: message,
    ...options,
  });

// -------------------- Hook --------------------
function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };
