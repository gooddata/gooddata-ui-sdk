// (C) 2022-2026 GoodData Corporation

import { omit } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, select } from "redux-saga/effects";

import { type CancelableOptions } from "@gooddata/sdk-backend-spi";
import { type ObjRef } from "@gooddata/sdk-model";

import { selectStaticElements } from "./elementsSelectors.js";
import { loadElements } from "./loadElements.js";
import { type ILoadElementsOptions, type ILoadElementsResult } from "../../../types/elementsLoader.js";
import { type PromiseFnReturnType, getAttributeFilterContext } from "../common/sagas.js";
import {
    selectAttributeFilterDisplayAsLabel,
    selectAttributeFilterDisplayForm,
    selectHiddenElementsAsAttributeElements,
} from "../filter/filterSelectors.js";
import { selectAttribute } from "../loadAttribute/loadAttributeSelectors.js";

/**
 * @internal
 */
export function* elementsSaga(
    options: ILoadElementsOptions & CancelableOptions,
    cacheId?: string,
): SagaIterator<ILoadElementsResult> {
    const context: SagaReturnType<typeof getAttributeFilterContext> = yield call(getAttributeFilterContext);

    const hiddenElements: ReturnType<typeof selectHiddenElementsAsAttributeElements> = yield select(
        selectHiddenElementsAsAttributeElements,
    );

    const attribute: ReturnType<typeof selectAttribute> = yield select(selectAttribute);

    const attributeFilterDisplayFormRef: ReturnType<typeof selectAttributeFilterDisplayForm> = yield select(
        selectAttributeFilterDisplayForm,
    );

    const attributeFilterDisplayAsLabelRef: ReturnType<typeof selectAttributeFilterDisplayAsLabel> =
        yield select(selectAttributeFilterDisplayAsLabel);

    const staticElements: ReturnType<typeof selectStaticElements> = yield select(selectStaticElements);

    const filterByPrimaryLabelProp =
        attributeFilterDisplayAsLabelRef && !options.search // when searching by string, we need to apply it to the displayAsLabel directly not primary label
            ? { filterByPrimaryLabel: true }
            : {};

    const allOptions = {
        ...options,
        ...filterByPrimaryLabelProp,
    };

    const elementsQueryResult: PromiseFnReturnType<typeof loadElements> = yield call(
        loadElements as (
            context: SagaReturnType<typeof getAttributeFilterContext>,
            options: ILoadElementsOptions & CancelableOptions & { displayFormRef: ObjRef },
            hiddenElementsInfo: {
                hiddenElements: ReturnType<typeof selectHiddenElementsAsAttributeElements>;
                attribute: ReturnType<typeof selectAttribute>;
            },
            staticElements: ReturnType<typeof selectStaticElements>,
            cacheId?: string,
        ) => ReturnType<typeof loadElements>,
        context,
        {
            displayFormRef: attributeFilterDisplayAsLabelRef || attributeFilterDisplayFormRef,
            ...allOptions,
        },
        {
            hiddenElements,
            attribute,
        },
        staticElements,
        cacheId,
    );

    return {
        elements: elementsQueryResult.items,
        totalCount: elementsQueryResult.totalCount,
        options: omit(allOptions, "signal"),
        cacheId: elementsQueryResult.cacheId,
    };
}
