import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { isDeepEqual } from "@/components/data-table/utils/deep-utils";

let isInBatchUpdate = false;

interface PendingUpdateEntry<T = unknown> {
  value: T;
  defaultValue: T;
  serialize: (value: T) => string;
  areEqual: (a: T, b: T) => boolean;
}
const pendingUpdates = new Map<string, PendingUpdateEntry>();

const lastUrlUpdate = {
  timestamp: 0,
  params: new URLSearchParams(),
};

export function useUrlState<T>(
  key: string,
  defaultValue: T,
  options: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  } = {},
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isUpdatingUrl = useRef(false);

  const lastSetValue = useRef<T>(defaultValue);

  const serialize = useMemo(
    () =>
      options.serialize ||
      ((value: T) =>
        typeof value === "object" ? JSON.stringify(value) : String(value)),
    [options.serialize],
  );

  const deserialize = useMemo(
    () =>
      options.deserialize ||
      ((value: string) => {
        try {
          if (typeof defaultValue === "number") {
            const num = Number(value);

            if (Number.isNaN(num)) return defaultValue;
            return num as unknown as T;
          }

          if (typeof defaultValue === "boolean") {
            return (value === "true") as unknown as T;
          }

          if (typeof defaultValue === "object") {
            try {
              const parsed = JSON.parse(value) as T;

              if (parsed && typeof parsed === "object") {
                if (key === "dateRange") {
                  const dateRange = parsed as {
                    from_date?: string;
                    to_date?: string;
                  };
                  if (!dateRange.from_date || !dateRange.to_date) {
                    console.warn(`Invalid dateRange format in URL: ${value}`);
                    return defaultValue;
                  }
                }
                return parsed;
              }
              return defaultValue;
            } catch (e) {
              console.warn(
                `Error parsing JSON from URL parameter ${key}: ${e}`,
              );
              return defaultValue;
            }
          }

          return value as unknown as T;
        } catch (e) {
          console.warn(`Error deserializing URL parameter ${key}: ${e}`);
          return defaultValue;
        }
      }),
    [options.deserialize, defaultValue, key],
  );

  const getValueFromUrl = useCallback(() => {
    if (pendingUpdates.has(key)) {
      return pendingUpdates.get(key)?.value as T;
    }

    const paramValue = searchParams.get(key);
    if (paramValue === null) {
      return defaultValue;
    }

    if (key === "search" && typeof defaultValue === "string") {
      return decodeURIComponent(paramValue) as unknown as T;
    }

    return deserialize(paramValue);
  }, [searchParams, key, deserialize, defaultValue]);

  const [value, setValue] = useState<T>(getValueFromUrl);

  const prevSearchParamsRef = useRef<URLSearchParams | null>(null);

  const areEqual = useMemo(() => {
    return (a: T, b: T): boolean => {
      if (typeof a === "object" && typeof b === "object") {
        return isDeepEqual(a, b);
      }
      return a === b;
    };
  }, []);

  const currentValueRef = useRef<T>(value);

  useEffect(() => {
    currentValueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (isUpdatingUrl.current) {
      isUpdatingUrl.current = false;
      return;
    }

    const searchParamsString = searchParams.toString();
    if (
      prevSearchParamsRef.current &&
      prevSearchParamsRef.current.toString() === searchParamsString
    ) {
      return;
    }

    const newParams = new URLSearchParams(searchParamsString);
    prevSearchParamsRef.current = newParams;

    const newValue = getValueFromUrl();

    if (
      !areEqual(lastSetValue.current, newValue) &&
      !areEqual(currentValueRef.current, newValue)
    ) {
      lastSetValue.current = newValue;
      setValue(newValue);
    } else if (
      pendingUpdates.has(key) &&
      areEqual(pendingUpdates.get(key)?.value as unknown as T, newValue)
    ) {
      pendingUpdates.delete(key);
    }
  }, [searchParams, getValueFromUrl, key, areEqual]);

  const updateUrlNow = useCallback(
    (params: URLSearchParams) => {
      const now = Date.now();
      lastUrlUpdate.timestamp = now;
      lastUrlUpdate.params = params;

      const newParamsString = params.toString();
      router.replace(
        `${pathname}${newParamsString ? `?${newParamsString}` : ""}`,
      );

      isUpdatingUrl.current = false;

      return Promise.resolve(params);
    },
    [router, pathname],
  );

  const updateValue = useCallback(
    (newValue: T | ((prevValue: T) => T)) => {
      const resolvedValue =
        typeof newValue === "function"
          ? (newValue as (prev: T) => T)(value)
          : newValue;

      if (areEqual(value, resolvedValue)) {
        return Promise.resolve(new URLSearchParams(searchParams.toString()));
      }

      lastSetValue.current = resolvedValue;

      pendingUpdates.set(key, {
        value: resolvedValue,
        defaultValue,
        serialize: serialize as (value: unknown) => string,
        areEqual: areEqual as (a: unknown, b: unknown) => boolean,
      });

      setValue(resolvedValue);

      isUpdatingUrl.current = true;

      if (key === "pageSize") {
        const pageEntry: PendingUpdateEntry<number> = (pendingUpdates.get(
          "page",
        ) as PendingUpdateEntry<number>) || {
          value: 1,
          defaultValue: 1,
          serialize: (v: number) => String(v),
          areEqual: (a: number, b: number) => a === b,
        };
        pendingUpdates.set("page", {
          ...pageEntry,
          value: 1,
        } as PendingUpdateEntry<unknown>);
      }

      if (isInBatchUpdate) {
        return Promise.resolve(new URLSearchParams(searchParams.toString()));
      }

      isInBatchUpdate = true;

      return new Promise<URLSearchParams>((resolve) => {
        queueMicrotask(() => {
          const params = new URLSearchParams(searchParams.toString());
          let pageSizeChangedInBatch = false;

          let sortByInBatch = false;
          let sortOrderInBatch = false;

          const sortByInURL = params.has("sortBy");
          const defaultSortOrder = "desc";
          for (const [updateKey] of pendingUpdates.entries()) {
            if (updateKey === "sortBy") sortByInBatch = true;
            if (updateKey === "sortOrder") sortOrderInBatch = true;
          }

          for (const [updateKey, entry] of pendingUpdates.entries()) {
            const {
              value: updateValue,
              defaultValue: entryDefaultValue,
              serialize: entrySerialize,
              areEqual: entryAreEqual,
            } = entry;

            if (updateKey === "sortBy") {
              params.set(updateKey, entrySerialize(updateValue));

              if (!sortOrderInBatch) {
                const currentSortOrder =
                  params.get("sortOrder") || defaultSortOrder;
                params.set("sortOrder", currentSortOrder);
              }
            } else if (updateKey === "sortOrder") {
              if (sortByInURL || sortByInBatch) {
                params.set(updateKey, entrySerialize(updateValue));
              } else if (entryAreEqual(updateValue, entryDefaultValue)) {
                params.delete(updateKey);
              } else {
                params.set(updateKey, entrySerialize(updateValue));
              }
            } else if (entryAreEqual(updateValue, entryDefaultValue)) {
              params.delete(updateKey);
            } else {
              if (updateKey === "search" && typeof updateValue === "string") {
                params.set(updateKey, encodeURIComponent(updateValue));
              } else {
                params.set(updateKey, entrySerialize(updateValue));
              }
            }
            if (updateKey === "pageSize") {
              pageSizeChangedInBatch = true;
            }
          }

          if (pageSizeChangedInBatch) {
            params.set("page", "1");
          }

          pendingUpdates.clear();

          isInBatchUpdate = false;

          updateUrlNow(params)
            .then(resolve)
            .catch((error) => {
              pendingUpdates.clear();
              isInBatchUpdate = false;
              throw error;
            });
        });
      });
    },
    [searchParams, key, serialize, value, defaultValue, updateUrlNow, areEqual],
  );

  return [value, updateValue] as const;
}

export function formatDateForUrl(date: Date | undefined): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

export function validateDateString(dateString: string): boolean {
  if (!dateString) return false;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return !Number.isNaN(date.getTime());
}

export function parseDateFromUrl(dateString: string): Date | undefined {
  if (!validateDateString(dateString)) return undefined;
  return new Date(dateString);
}
