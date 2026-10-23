// (C) 2022-2026 GoodData Corporation

import { type Context, type RefObject, createRef, useContext } from "react";

import { FormContext, type FormContextState, type FormState } from "./FormContext.js";

export function useFormFieldElementRef<T>(field: keyof T): RefObject<HTMLElement | null> {
    const { elements } = useContext(FormContext as unknown as Context<FormContextState<T, unknown>>);
    return createOrGetElement(elements, field);
}

function createOrGetElement<T>(elements: FormState<T>["elements"], field: keyof T) {
    return elements[field] || (elements[field] = createRef<HTMLElement>());
}
