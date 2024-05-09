import { useCallback, useSyncExternalStore } from "react";
import { effect, ReadSignal } from "@maverick-js/signals";

export function useSignalValue<T>(signal: ReadSignal<T>): T {
  const subscribe = useCallback(
    (onChange: (v: T) => void) => effect(() => onChange(signal())),
    [],
  );
  return useSyncExternalStore(subscribe, signal, signal);
}
