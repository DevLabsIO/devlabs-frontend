type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

type Comparable =
  | string
  | number
  | boolean
  | object
  | null
  | undefined
  | TypedArray
  | Date
  | RegExp
  | Set<unknown>
  | Map<unknown, unknown>;

export function isDeepEqual(a: Comparable, b: Comparable): boolean {
  const visited = new WeakMap<object, object>();

  return compare(a, b);

  function compare(a: Comparable, b: Comparable): boolean {
    if (a === b) return true;

    if (a == null || b == null) return a === b;

    const typeA = typeof a;
    const typeB = typeof b;
    if (typeA !== typeB) return false; // Fast non-recursive paths for common types
    if (typeA !== "object") return false; // We already checked a === b for primitives

    if (a instanceof Date) {
      return b instanceof Date && a.getTime() === b.getTime();
    }

    if (a instanceof RegExp) {
      return b instanceof RegExp && a.toString() === b.toString();
    }

    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;

      for (let i = 0; i < a.length; i++) {
        if (!compare(a[i] as Comparable, b[i] as Comparable)) return false;
      }

      return true;
    } // Special handling for Set - order doesn't matter for Sets
    if (a instanceof Set) {
      if (!(b instanceof Set) || a.size !== b.size) return false;

      for (const item of a) {
        let found = false;
        for (const otherItem of b) {
          if (compare(item as Comparable, otherItem as Comparable)) {
            found = true;
            break;
          }
        }
        if (!found) return false;
      }
      return true;
    }

    if (a instanceof Map) {
      if (!(b instanceof Map) || a.size !== b.size) return false;

      for (const [key, val] of a.entries()) {
        if (
          !b.has(key) ||
          !compare(val as Comparable, b.get(key) as Comparable)
        )
          return false;
      }

      return true;
    } // Handle typed arrays
    if (ArrayBuffer.isView(a)) {
      if (
        !ArrayBuffer.isView(b) ||
        a.constructor !== b.constructor ||
        (a as TypedArray).length !== (b as TypedArray).length
      )
        return false;

      const typedA = a as TypedArray;
      const typedB = b as TypedArray;

      for (let i = 0; i < typedA.length; i++) {
        if (typedA[i] !== typedB[i]) return false;
      }
      return true;
    } // Handle plain objects with circular reference detection
    if (a.constructor === Object && b.constructor === Object) {
      const objA = a as Record<string, unknown>;
      const objB = b as Record<string, unknown>;

      if (visited.has(objA)) {
        return visited.get(objA) === objB;
      }

      visited.set(objA, objB);

      const keysA = Object.keys(objA);
      const keysB = Object.keys(objB);

      if (keysA.length !== keysB.length) return false;

      for (const key of keysA) {
        if (
          !(key in objB) ||
          !compare(objA[key] as Comparable, objB[key] as Comparable)
        ) {
          return false;
        }
      }

      return true;
    }

    if (a.constructor !== b.constructor) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (
        !compare(
          (a as Record<string, unknown>)[key] as Comparable,
          (b as Record<string, unknown>)[key] as Comparable,
        )
      )
        return false;
    }

    return true;
  }
}

export function memoize<T>(
  fn: (...args: unknown[]) => T,
): (...args: unknown[]) => T {
  const cache = new Map<string, T>();

  return (...args: unknown[]): T => {
    let key: string;
    try {
      key = JSON.stringify(args, (_, value) => {
        if (value instanceof Map) {
          return { __type: "Map", entries: Array.from(value.entries()) };
        }
        if (value instanceof Set) {
          return { __type: "Set", values: Array.from(value) };
        }
        if (value instanceof Date) {
          return { __type: "Date", value: value.toISOString() };
        }
        if (value instanceof RegExp) {
          return { __type: "RegExp", value: value.toString() };
        }
        return value;
      });
    } catch {
      key =
        String(args.length) +
        args.map((arg, i) => `${i}:${typeof arg}`).join(",");
    }

    if (cache.has(key)) {
      const cachedValue = cache.get(key);
      return cachedValue !== undefined ? cachedValue : fn(...args);
    }

    const result = fn(...args);
    cache.set(key, result);

    return result;
  };
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function resetUrlState(
  router: { replace: (path: string) => void },
  pathname: string,
): void {
  router.replace(pathname);
}
