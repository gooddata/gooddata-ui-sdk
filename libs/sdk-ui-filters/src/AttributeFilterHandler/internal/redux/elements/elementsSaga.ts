// (C) 2022-2024 GoodData Corporation
import { SagaIterator } from "redux-saga";
import omit from "lodash/omit.js";
import { call, select, SagaReturnType } from "redux-saga/effects";
import { CancelableOptions } from "@gooddata/sdk-backend-spi";

import { ILoadElementsResult, ILoadElementsOptions } from "../../../types/index.js";
import {
    selectAttributeFilterDisplayAsLabel,
    selectAttributeFilterDisplayForm,
    selectHiddenElementsAsAttributeElements,
} from "../filter/filterSelectors.js";
import { selectAttribute } from "../loadAttribute/loadAttributeSelectors.js";
import { getAttributeFilterContext, PromiseFnReturnType } from "../common/sagas.js";
import { selectStaticElements } from "./elementsSelectors.js";
import { loadElements } from "./loadElements.js";

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

    const { enableDuplicatedLabelValuesInAttributeFilter } = context;

    const filterByPrimaryLabelProp =
        enableDuplicatedLabelValuesInAttributeFilter && attributeFilterDisplayAsLabelRef && !options.search // when searching by string, we need to apply it to the displayAsLabel directly not primary label
            ? { filterByPrimaryLabel: true }
            : {};

    const allOptions = {
        ...options,
        ...filterByPrimaryLabelProp,
    };

    const elementsQueryResult: PromiseFnReturnType<typeof loadElements> = yield call(
        loadElements,
        context,
        {
            displayFormRef:
                enableDuplicatedLabelValuesInAttributeFilter && attributeFilterDisplayAsLabelRef
                    ? attributeFilterDisplayAsLabelRef
                    : attributeFilterDisplayFormRef,
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
