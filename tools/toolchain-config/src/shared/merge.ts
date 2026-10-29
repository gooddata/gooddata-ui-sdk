// (C) 2026 GoodData Corporation

function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const prototype: unknown = Object.getPrototypeOf(value);

    return prototype === Object.prototype || prototype === null;
}

/**
 * Deep-merges consumer overrides into a preset's options, with the same rules vite's `mergeConfig`
 * uses: plain objects merge recursively, everything else (arrays, functions, primitives, class
 * instances) is replaced by the override. `null` and `undefined` overrides leave the base value alone.
 *
 * Exists for the tools that ship no merge helper of their own, rolldown among them.
 */
export function mergeOptions<T extends object>(base: T, overrides: Partial<T> | undefined): T {
    if (!overrides) {
        return base;
    }

    const result = { ...base } as Record<string, unknown>;

    for (const [key, override] of Object.entries(overrides)) {
        if (key === "__proto__" || override === undefined || override === null) {
            continue;
        }

        const current = result[key];

        result[key] =
            isPlainObject(current) && isPlainObject(override) ? mergeOptions(current, override) : override;
    }

    return result as T;
}
