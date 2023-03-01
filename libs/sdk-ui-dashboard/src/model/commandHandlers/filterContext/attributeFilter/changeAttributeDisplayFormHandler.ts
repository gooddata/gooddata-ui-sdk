// (C) 2022-2023 GoodData Corporation
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import invariant from "ts-invariant";
import { batchActions } from "redux-batched-actions";
import flatMap from "lodash/flatMap";

import { SetAttributeFilterDisplayForm } from "../../../commands/filters";
import { attributeDisplayFormChanged } from "../../../events/filters";
import { filterContextActions } from "../../../store/filterContext";
import { selectFilterContextAttributeFilterByLocalId } from "../../../store/filterContext/filterContextSelectors";
import { DashboardContext } from "../../../types/commonTypes";
import { dispatchFilterContextChanged } from "../common";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher";
import { validateFilterDisplayForm } from "./validation/filterDisplayFormValidation";
import { invalidArgumentsProvided } from "../../../events/general";
import { selectAllCatalogDisplayFormsMap } from "../../../store/catalog/catalogSelectors";
import { IAttributeMetadataObject } from "@gooddata/sdk-model";
import { query } from "../../../store/_infra/queryCall";
import { queryAttributeByDisplayForm } from "../../../../model/queries";
import { newDisplayFormMap } from "../../../../_staging/metadata/objRefMap";

export function* changeAttributeDisplayFormHandler(
    ctx: DashboardContext,
    cmd: SetAttributeFilterDisplayForm,
): SagaIterator<void> {
    const { filterLocalId, displayForm } = cmd.payload;

    const catalogDisplayFormsMap: ReturnType<typeof selectAllCatalogDisplayFormsMap> = yield select(
        selectAllCatalogDisplayFormsMap,
    );

    const attributes: IAttributeMetadataObject[] = yield call(
        query,
        queryAttributeByDisplayForm([displayForm]),
    );

    const attributeDisplayFormsMap = newDisplayFormMap([...flatMap(attributes, (a) => a.displayForms)]);

    const displayFormData =
        catalogDisplayFormsMap.get(displayForm) || attributeDisplayFormsMap.get(displayForm);

    invariant(
        displayFormData,
        "Inconsistent state in changeAttributeDisplayFormHandler, cannot update attribute filter with display form not available in the catalog.",
    );

    const attribute = displayFormData?.attribute;

    const validationResult: SagaReturnType<typeof validateFilterDisplayForm> = yield call(
        validateFilterDisplayForm,
        ctx,
        attribute,
        displayForm,
    );

    if (validationResult !== "VALID") {
        const message =
            validationResult === "INVALID_ATTRIBUTE_DISPLAY_FORM"
                ? "The display form provided is not a valid display form of the attribute filter."
                : "Cannot find the attribute for the display form used on the attribute filter.";

        throw invalidArgumentsProvided(ctx, cmd, message);
    }

    yield put(
        batchActions([
            // keep the attribute display form field up to date
            filterContextActions.addAttributeFilterDisplayForm(displayFormData),
            filterContextActions.changeAttributeDisplayForm({
                filterLocalId,
                displayForm,
            }),
        ]),
    );

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(filterLocalId));

    invariant(
        changedFilter,
        "Inconsistent state in changeAttributeDisplayFormHandler, cannot update attribute filter for given local identifier.",
    );

    yield dispatchDashboardEvent(attributeDisplayFormChanged(ctx, changedFilter, cmd.correlationId));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
