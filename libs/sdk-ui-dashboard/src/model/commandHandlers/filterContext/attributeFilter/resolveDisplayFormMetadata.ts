// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import {
    type IAttributeDisplayFormMetadataObject,
    type IAttributeMetadataObject,
    type ObjRef,
} from "@gooddata/sdk-model";

import { newDisplayFormMap } from "../../../../_staging/metadata/objRefMap.js";
import { queryAttributeByDisplayForm } from "../../../queries/attributes.js";
import { query } from "../../../store/_infra/queryCall.js";
import { selectAllCatalogDisplayFormsMap } from "../../../store/catalog/catalogSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type ITabSyncSession, putTabSynced } from "../tabSync/tabSyncSaga.js";

/**
 * Resolves display form metadata for the given ObjRef and registers it in the store
 * so that selectors like selectAttributeFilterDisplayFormsMap can resolve it.
 *
 * With a tab sync `session`, the display form is registered on the synced tabs too.
 *
 * @returns the resolved display form metadata, or undefined if not found
 */
export function* resolveAndRegisterDisplayFormMetadata(
    displayForm: ObjRef,
    session?: ITabSyncSession,
): SagaIterator<IAttributeDisplayFormMetadataObject | undefined> {
    const catalogDisplayFormsMap: ReturnType<typeof selectAllCatalogDisplayFormsMap> = yield select(
        selectAllCatalogDisplayFormsMap,
    );

    let displayFormData = catalogDisplayFormsMap.get(displayForm);
    if (!displayFormData) {
        const attributes: IAttributeMetadataObject[] = yield call(
            query,
            queryAttributeByDisplayForm([displayForm]),
        );
        const attributeDisplayFormsMap = newDisplayFormMap(attributes.flatMap((a) => a.displayForms));
        displayFormData = attributeDisplayFormsMap.get(displayForm);
    }

    if (displayFormData) {
        const action = tabsActions.addAttributeFilterDisplayForm(displayFormData);
        if (session) {
            yield call(putTabSynced, session, [action]);
        } else {
            yield put(action);
        }
    }

    return displayFormData;
}
