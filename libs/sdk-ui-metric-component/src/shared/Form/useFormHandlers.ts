// (C) 2022-2026 GoodData Corporation

import { type Context, useCallback, useContext } from "react";

import { FormContext, type FormContextState } from "./FormContext.js";
import { useInvalidFocusField } from "./hooks/useInvalidFocusField.js";

export type FormHandlers<T> = {
    onForceSave: (data?: Partial<T>) => Promise<void>;
    onSave: () => Promise<void>;
    onSaveAs: () => Promise<void>;
    onClose: () => void;
};

export function useFormHandlers<T>(): FormHandlers<T> {
    const { formHandlers, formStatus, currentValues, getFormState, setFocus, setSaving } = useContext(
        FormContext as unknown as Context<FormContextState<T, unknown>>,
    );
    const { onSave, onSaveAs, onClose, transformer, invalidFocus } = formHandlers;
    const {
        isValid = false,
        isSaveDisabled = true,
        isSaveAsDisabled = true,
        isEditable = false,
        isWriteable = false,
    } = formStatus || {};
    const canSave = !isSaveDisabled && isEditable;
    const canSaveAs = !isSaveAsDisabled && isWriteable;

    const invalidFocusField = useInvalidFocusField(invalidFocus);

    const onSaveHandler = useCallback(() => {
        const currentValues = getFormState().currentValues;
        setSaving(true);
        return trySave(
            canSave,
            isValid,
            () => onSave(transformer(currentValues), false),
            () => setFocus(invalidFocusField),
        ).then(() => setSaving(false));
    }, [canSave, invalidFocusField, isValid, getFormState, onSave, setFocus, setSaving, transformer]);

    const onForceSaveHandler = useCallback(
        (data: Partial<T> = {}) => {
            const currentValues = getFormState().currentValues;
            setSaving(true);
            return trySave(
                canSave,
                isValid,
                () => onSave(transformer({ ...currentValues, ...data }), true),
                () => setFocus(invalidFocusField),
            ).then(() => setSaving(false));
        },
        [canSave, invalidFocusField, isValid, getFormState, onSave, setFocus, setSaving, transformer],
    );

    const onSaveAsHandler = useCallback(() => {
        const currentValues = getFormState().currentValues;

        setSaving(true);
        return trySave(
            canSaveAs,
            isValid,
            () => onSaveAs(transformer(currentValues)),
            () => setFocus(invalidFocusField),
        ).then(() => setSaving(false));
    }, [canSaveAs, invalidFocusField, isValid, getFormState, onSaveAs, setFocus, setSaving, transformer]);

    const onCloseHandler = useCallback(() => {
        onClose(transformer(currentValues), isValid);
    }, [currentValues, isValid, onClose, transformer]);

    return {
        onForceSave: onForceSaveHandler,
        onSave: onSaveHandler,
        onSaveAs: onSaveAsHandler,
        onClose: onCloseHandler,
    };
}

function trySave<T>(
    canSave: boolean,
    isValid: boolean,
    onSave: () => Promise<T>,
    onInvalid: () => void,
): Promise<T | void> {
    const promise = canSave && isValid ? onSave() : Promise.resolve();
    promise.then(() => {
        if (!isValid) {
            onInvalid();
        }
    });
    return promise;
}
