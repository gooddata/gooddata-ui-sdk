// (C) 2007-2025 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import isEqual from "lodash/isEqual.js";

/**
 * Safely parse JSON string, fallback to default value if parsing fails.
 */
const safeParse = <T>(item: string | null, defaultValue: T): T => {
    if (!item) {
        return defaultValue;
    }

    try {
        return JSON.parse(item) as T;
    } catch {
        return defaultValue;
    }
};

/**
 * Hook for using local storage.
 * Ideally, you want to keep initial value immutable to avoid unnecessary re-renders.
 * @public
 */
export const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        return safeParse(localStorage.getItem(key), initialValue);
    });

    // Expose a separate callback to the user instead of using effect on storedValue
    // to avoid unnecessary localStorage writes.
    const setValue = useCallback(
        (value: T) => {
            setStoredValue(value);
            localStorage.setItem(key, JSON.stringify(value));
        },
        [key, setStoredValue],
    );

    // Listen to storage change events in case the value is changed in another tab or by another component.
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key !== key) return;

            setStoredValue((value: T) => {
                if (isEqual(event.newValue, value)) {
                    // Return the same value to avoid re-renders
                    return value;
                }

                return safeParse(event.newValue, initialValue);
            });
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [key, setStoredValue, initialValue]);

    return [storedValue, setValue];
};
