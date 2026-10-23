// (C) 2022-2026 GoodData Corporation

import { isEqual } from "lodash-es";

export function isChanged<T>(defaultValues: T, currentValues: T, transformer: (data: T) => T): boolean {
    return !isEqual(transformer(defaultValues), transformer(currentValues));
}
