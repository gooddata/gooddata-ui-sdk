// (C) 2022-2026 GoodData Corporation

import { batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { resolveAndRegisterDisplayFormMetadata } from "./resolveDisplayFormMetadata.js";
import { validateFilterDisplayForm } from "./validation/filterDisplayFormValidation.js";
import { type ISetAttributeFilterDisplayForm } from "../../../commands/filters.js";
import { attributeDisplayFormChanged } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import {
    selectEnableImmediateAttributeFilterDisplayAsLabelMigration,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
} from "../../../store/config/configSelectors.js";
import { selectFilterContextAttributeFilterItemByLocalId } from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* changeAttributeDisplayFormHandler(
    ctx: DashboardContext,
    cmd: ISetAttributeFilterDisplayForm,
): SagaIterator<void> {
    const { filterLocalId, displayForm, isWorkingSelectionChange, isResultOfMigration } = cmd.payload;

    const displayFormData = yield call(resolveAndRegisterDisplayFormMetadata, displayForm);

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
    const enableImmediateAttributeFilterDisplayAsLabelMigration: ReturnType<
        typeof selectEnableImmediateAttributeFilterDisplayAsLabelMigration
    > = yield select(selectEnableImmediateAttributeFilterDisplayAsLabelMigration);
    const isApplyAllAtOnceEnabledAndSet: ReturnType<typeof selectIsApplyFiltersAllAtOnceEnabledAndSet> =
        yield select(selectIsApplyFiltersAllAtOnceEnabledAndSet);

    yield put(
        batchActions([
            tabsActions.changeAttributeDisplayForm({
                filterLocalId,
                displayForm,
                isWorkingSelectionChange:
                    isWorkingSelectionChange &&
                    !enableImmediateAttributeFilterDisplayAsLabelMigration &&
                    isApplyAllAtOnceEnabledAndSet,
                enableImmediateAttributeFilterDisplayAsLabelMigration,
                isResultOfMigration,
            }),
        ]),
    );

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterItemByLocalId>> =
        yield select(selectFilterContextAttributeFilterItemByLocalId(filterLocalId));

    invariant(
        changedFilter,
        "Inconsistent state in changeAttributeDisplayFormHandler, cannot update attribute filter for given local identifier.",
    );
    yield dispatchDashboardEvent(attributeDisplayFormChanged(ctx, changedFilter, cmd.correlationId));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
