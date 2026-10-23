// (C) 2022-2026 GoodData Corporation

import { forwardRef } from "react";

import { useApi } from "../hooks/useApi.js";

import { useFormHandlers } from "./useFormHandlers.js";

export interface IFormApi<T> {
    close: () => void;
    save: () => Promise<void>;
    saveAs: () => Promise<void>;
    saveForce: (data?: Partial<T>) => Promise<void>;
}

export const FormApi = forwardRef<IFormApi<unknown> | undefined, unknown>(function FormApi(_, ref) {
    const { onSave, onSaveAs, onClose, onForceSave } = useFormHandlers();

    useApi<IFormApi<unknown> | undefined>(
        ref,
        {
            close: onClose,
            save: onSave,
            saveAs: onSaveAs,
            saveForce: onForceSave,
        },
        [onSave, onSaveAs, onClose, onForceSave],
    );

    return null;
});
