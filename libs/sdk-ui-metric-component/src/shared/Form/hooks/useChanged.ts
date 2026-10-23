// (C) 2022-2026 GoodData Corporation

import { useEffect, useState } from "react";

import { type FormState } from "../FormContext.js";
import { isChanged } from "../utils.js";

import { type FormHandlers } from "./useFormHandlersInternal.js";
import { type FormStatus } from "./useFormStatusInternal.js";

export function useChanged<T, S>(
    { transformer }: FormHandlers<T, S>,
    { isValid, isLoading }: FormStatus<T, S>,
    { currentValues }: FormState<T>,
    onValueChange?: (data: T, valid: boolean) => void,
): void {
    const [data, setData] = useState<[T, boolean]>([currentValues, isValid]);
    const [previousValues, previousValid] = data;

    useEffect(() => {
        const changed = isChanged(previousValues, currentValues, transformer) || previousValid !== isValid;
        if (onValueChange && changed && !isLoading) {
            setData([currentValues, isValid]);
            onValueChange(transformer(currentValues), isValid);
        }
    }, [transformer, currentValues, isLoading, isValid, onValueChange, previousValid, previousValues]);
}
