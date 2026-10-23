// (C) 2022-2026 GoodData Corporation

import {
    type ForwardRefExoticComponent,
    type MutableRefObject,
    type PropsWithChildren,
    type ReactNode,
    type Ref,
    forwardRef,
    useEffect,
    useRef,
} from "react";

import { isEqual } from "lodash-es";

import { type FormMode } from "./data.js";
import { FormApi, type IFormApi } from "./FormApi.js";
import { FormContext } from "./FormContext.js";
import { useChanged } from "./hooks/useChanged.js";
import { useDirty } from "./hooks/useDirty.js";
import { useFormHandlersInternal } from "./hooks/useFormHandlersInternal.js";
import { useFormState } from "./hooks/useFormState.js";
import { type ValidationInfo, useFormStatusInternal } from "./hooks/useFormStatusInternal.js";
import { useMutations } from "./hooks/useMutations.js";
import { useRealFocus } from "./hooks/useRealFocus.js";

export interface IForm<T, S> {
    data: T;
    mode?: FormMode;
    transformer?: (data: T) => T;
    validator?: (data: T) => ValidationInfo<T, S>;
    //props
    initialFocus?: keyof T;
    invalidFocus?: (validation: ValidationInfo<T, S>) => keyof T | null;
    writeable?: boolean;
    editable?: boolean;
    locked?: boolean;
    //handlers
    onSave: (data: T, force?: boolean) => Promise<void>;
    onSaveAs: (data: T) => Promise<void>;
    onClose: (data: Partial<T>, valid: boolean) => void;
    onDirtyChanged?: (state: boolean) => void;
    onValueChange?: (data: T, valid: boolean) => void;
    children: ReactNode;
    //ref
    ref?: Ref<IFormApi<T> | undefined>;
}

export type FormProviderComponent<T, S> = ForwardRefExoticComponent<PropsWithChildren<IForm<T, S>>>;

export const FormProvider = forwardRef<IFormApi<unknown> | undefined, IForm<unknown, unknown>>(
    function FormProvider(props, ref) {
        const { children, data, initialFocus, onDirtyChanged, onValueChange } = props;

        const [state, setState, getFormState] = useFormState(data, initialFocus);
        const formHandlers = useFormHandlersInternal(props);
        const formStatus = useFormStatusInternal(formHandlers, props, state);

        const { setValues, setChanged, setTouched, setActive, setFocus, setBlur, setSaving } =
            useMutations(setState);

        useDirty(formStatus, onDirtyChanged);
        useRealFocus(formStatus, state, setState);
        useChanged(formHandlers, formStatus, state, onValueChange);

        const value = useMemoCompare(
            {
                ...state,
                getFormState,
                formStatus,
                formHandlers,
                setValues,
                setChanged,
                setTouched,
                setActive,
                setFocus,
                setBlur,
                setSaving,
            },
            isEqual,
        );

        return (
            <FormContext.Provider value={value}>
                <FormApi ref={ref} />
                {children}
            </FormContext.Provider>
        );
    },
);

function useMemoCompare<T>(next: T, compare: (prev: T, next: T) => boolean): T {
    const previousRef = useRef<T>(undefined) as MutableRefObject<T>;
    const previous = previousRef.current;

    const isEqual = compare(previous, next);

    useEffect(() => {
        if (!isEqual) {
            previousRef.current = next;
        }
    });

    return isEqual ? previous : next;
}
