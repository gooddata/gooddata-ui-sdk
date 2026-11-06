// (C) 2022-2026 GoodData Corporation

import { _isEqual } from "@gooddata/util";

export function isChanged<T>(defaultValues: T, currentValues: T, transformer: (data: T) => T): boolean {
    return !_isEqual(transformer(defaultValues), transformer(currentValues));
}
