// (C) 2026 GoodData Corporation

import { compact } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { select } from "redux-saga/effects";

import { type ObjRef, isComputedAttributeRef, objRefToString } from "@gooddata/sdk-model";

import { selectEnableComputedAttributes } from "../../../../store/config/configSelectors.js";

/**
 * Finds a reference to a computed attribute that the command must not accept because computed attributes
 * are not enabled in the workspace.
 *
 * A computed attribute is referenced directly (its display form ref is its own ref typed
 * `computedAttribute`), so a command can name one even when the feature is off. Letting it through would
 * create a filter the backend refuses and the UI cannot render, so such commands are rejected up front.
 * Nothing is selected from the store unless a computed attribute is actually referenced.
 *
 * @returns the first offending reference, or undefined when the command may proceed
 */
export function* findDisabledComputedAttributeRef(
    refs: ReadonlyArray<ObjRef | undefined>,
): SagaIterator<ObjRef | undefined> {
    const computedAttributeRef = compact(refs).find(isComputedAttributeRef);
    if (!computedAttributeRef) {
        return undefined;
    }

    const enabled: ReturnType<typeof selectEnableComputedAttributes> = yield select(
        selectEnableComputedAttributes,
    );

    return enabled ? undefined : computedAttributeRef;
}

export function computedAttributesDisabledMessage(ref: ObjRef): string {
    return `Reference ${objRefToString(ref)} points at a computed attribute, but computed attributes are not enabled in the workspace (enableComputedAttributes setting).`;
}
