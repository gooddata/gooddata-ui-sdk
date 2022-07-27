// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, select, SagaReturnType } from "redux-saga/effects";

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
export function* elementsSaga(options: ILoadElementsOptions): SagaIterator<ILoadElementsResult> {
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
        options,
    };
}
