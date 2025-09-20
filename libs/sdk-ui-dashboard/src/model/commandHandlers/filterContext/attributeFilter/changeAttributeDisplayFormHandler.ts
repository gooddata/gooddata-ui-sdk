// (C) 2022-2025 GoodData Corporation
import { flatMap } from "lodash-es";
import { batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { IAttributeMetadataObject } from "@gooddata/sdk-model";

import { validateFilterDisplayForm } from "./validation/filterDisplayFormValidation.js";
import { newDisplayFormMap } from "../../../../_staging/metadata/objRefMap.js";
import { SetAttributeFilterDisplayForm } from "../../../commands/filters.js";
import { attributeDisplayFormChanged } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { queryAttributeByDisplayForm } from "../../../queries/index.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { query } from "../../../store/_infra/queryCall.js";
import { selectAllCatalogDisplayFormsMap } from "../../../store/catalog/catalogSelectors.js";
import {
    selectEnableDuplicatedLabelValuesInAttributeFilter,
    selectEnableImmediateAttributeFilterDisplayAsLabelMigration,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
} from "../../../store/config/configSelectors.js";
import { selectFilterContextAttributeFilterByLocalId } from "../../../store/filterContext/filterContextSelectors.js";
import { filterContextActions } from "../../../store/filterContext/index.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* changeAttributeDisplayFormHandler(
    ctx: DashboardContext,
    cmd: SetAttributeFilterDisplayForm,
): SagaIterator<void> {
    const { filterLocalId, displayForm, isWorkingSelectionChange, isResultOfMigration } = cmd.payload;
    const {
        backend: {
            capabilities: { supportsElementUris },
        },
    } = ctx;

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
    const enableDuplicatedLabelValuesInAttributeFilter: ReturnType<
        typeof selectEnableDuplicatedLabelValuesInAttributeFilter
    > = yield select(selectEnableDuplicatedLabelValuesInAttributeFilter);
    const enableImmediateAttributeFilterDisplayAsLabelMigration: ReturnType<
        typeof selectEnableImmediateAttributeFilterDisplayAsLabelMigration
    > = yield select(selectEnableImmediateAttributeFilterDisplayAsLabelMigration);
    const isApplyAllAtOnceEnabledAndSet: ReturnType<typeof selectIsApplyFiltersAllAtOnceEnabledAndSet> =
        yield select(selectIsApplyFiltersAllAtOnceEnabledAndSet);

    yield put(
        batchActions([
            // keep the attribute display form field up to date
            filterContextActions.addAttributeFilterDisplayForm(displayFormData),
            filterContextActions.changeAttributeDisplayForm({
                filterLocalId,
                displayForm,
                supportsElementUris,
                enableDuplicatedLabelValuesInAttributeFilter,
                isWorkingSelectionChange:
                    isWorkingSelectionChange &&
                    !enableImmediateAttributeFilterDisplayAsLabelMigration &&
                    isApplyAllAtOnceEnabledAndSet,
                enableImmediateAttributeFilterDisplayAsLabelMigration,
                isResultOfMigration,
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
