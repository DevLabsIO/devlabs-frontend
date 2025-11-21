import { useState, useMemo, useCallback } from "react";
import { useUrlState } from "@/components/data-table/utils/url-state";

type SetStateWithPromise<T> = (
  value: T | ((prevValue: T) => T),
) => Promise<URLSearchParams> | undefined;

export function createConditionalStateHook(enableUrlState: boolean) {
  return function useConditionalState<T>(
    key: string,
    defaultValue: T,
    options = {},
  ): readonly [T, SetStateWithPromise<T>] {
    const [regularState, setRegularState] = useState<T>(defaultValue);
    const [urlState, setUrlState] = useUrlState<T>(key, defaultValue, options);

    const setRegularStateWrapper = useCallback(
      (valueOrUpdater: T | ((prevValue: T) => T)) => {
        setRegularState(valueOrUpdater);
        return undefined; // Return undefined instead of void to match the type
      },
      [],
    );

    return useMemo(() => {
      if (enableUrlState) {
        return [urlState, setUrlState] as const;
      }

      return [regularState, setRegularStateWrapper] as const;
    }, [regularState, urlState, setUrlState, setRegularStateWrapper]);
  };
}
