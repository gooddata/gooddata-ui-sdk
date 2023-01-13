// (C) 2022-2023 GoodData Corporation
import { SagaIterator } from "redux-saga";
import omit from "lodash/omit";
import { call, select, SagaReturnType } from "redux-saga/effects";
import { CancelableOptions } from "@gooddata/sdk-backend-spi";

import { ILoadElementsResult, ILoadElementsOptions } from "../../../types";
import {
    selectAttributeFilterDisplayForm,
    selectHiddenElementsAsAttributeElements,
} from "../filter/filterSelectors";
import { selectAttribute } from "../loadAttribute/loadAttributeSelectors";
import { getAttributeFilterContext, PromiseFnReturnType } from "../common/sagas";
import { selectStaticElements } from "./elementsSelectors";
import { loadElements } from "./loadElements";

/**
 * @internal
 */
export function* elementsSaga(
    options: ILoadElementsOptions & CancelableOptions,
): SagaIterator<ILoadElementsResult> {
    const context: SagaReturnType<typeof getAttributeFilterContext> = yield call(getAttributeFilterContext);

    const hiddenElements: ReturnType<typeof selectHiddenElementsAsAttributeElements> = yield select(
        selectHiddenElementsAsAttributeElements,
    );

    const attribute: ReturnType<typeof selectAttribute> = yield select(selectAttribute);
    const attributeFilterDisplayFormRef: ReturnType<typeof selectAttributeFilterDisplayForm> = yield select(
        selectAttributeFilterDisplayForm,
    );

    const staticElements: ReturnType<typeof selectStaticElements> = yield select(selectStaticElements);

    const elementsQueryResult: PromiseFnReturnType<typeof loadElements> = yield call(
        loadElements,
        context,
        {
            displayFormRef: attributeFilterDisplayFormRef,
            ...options,
        },
        {
            hiddenElements,
            attribute,
        },
        staticElements,
    );

    return {
        elements: elementsQueryResult.items,
        totalCount: elementsQueryResult.totalCount,
        options: omit(options, "signal"),
    };
}
