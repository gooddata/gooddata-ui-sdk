// (C) 2022-2026 GoodData Corporation

import { useMemo } from "react";

import { type IForm } from "../Form.js";
import { emptyTransformer, emptyValidator } from "../FormContext.js";

import { type ValidationInfo } from "./useFormStatusInternal.js";

export type FormHandlers<T, S> = {
    transformer: (data: T) => T;
    validator: (data: T) => ValidationInfo<T, S>;
    onSave: (data: T, force?: boolean) => Promise<void>;
    onSaveAs: (data: T) => Promise<void>;
    onClose: (data: Partial<T>, valid: boolean) => void;
    invalidFocus?: (validation: ValidationInfo<T, S>) => keyof T | null;
};

export function useFormHandlersInternal<T, S>(props: IForm<T, S>): FormHandlers<T, S> {
    return useFormHandlers(props);
}

function useFormHandlers<T, S>({
    onClose,
    onSaveAs,
    onSave,
    transformer = emptyTransformer,
    validator = emptyValidator,
    invalidFocus,
}: IForm<T, S>) {
    return useMemo(
        () => ({
            onClose,
            onSaveAs,
            onSave,
            invalidFocus,
            transformer,
            validator,
        }),
        [onClose, onSave, onSaveAs, transformer, validator, invalidFocus],
    );
}
