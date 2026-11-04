// (C) 2021-2026 GoodData Corporation

import { type DependencyList, useCallback, useRef } from "react";

import { type MaqlEditorView } from "../../MaqlEditor/codemirror/types.js";
import { type IMeasureDef } from "../metric/metricHelpers.js";

export type IMeasureDefWithMaqlField = Omit<IMeasureDef, "expression"> & { expression: string | MaqlValue };

export type MaqlValue =
    | string
    | {
          value: string;
          valid: boolean;
      };

export function getMaqlValue(value: MaqlValue): string {
    if (typeof value === "object") {
        return value.value;
    }
    return value;
}
export function getMaqlValid(value: MaqlValue): boolean {
    if (typeof value === "object") {
        return value.valid;
    }
    return true;
}

export function useMaqlField(
    value: MaqlValue,
    onChange: (value: MaqlValue) => void,
): [(editor: MaqlEditorView, value: string) => void, (editor: MaqlEditorView, valid: boolean) => void] {
    const valueRef = useRef<string>(getMaqlValue(value));
    const validRef = useRef<boolean>(getMaqlValid(value));

    const onValidation = useValueOnly(
        (valid: boolean) => {
            validRef.current = valid;
            onChange(createMaqlValue(valueRef.current, valid));
        },
        [onChange],
    );

    const onChanged = useValueOnly(
        (currentValue: string) => {
            valueRef.current = currentValue;
            onChange(createMaqlValue(currentValue, validRef.current));
        },
        [onChange],
    );

    return [onChanged, onValidation];
}

function useValueOnly<T>(handler: (val: T) => void, deps: DependencyList) {
    return useCallback(
        (_editor: MaqlEditorView, value: T) => {
            handler(value);
        },
        // oxlint-disable-next-line react-hooks/exhaustive-deps
        deps,
    );
}

export function createMaqlValue(value: string, valid: boolean): MaqlValue {
    return {
        value,
        valid,
    };
}
