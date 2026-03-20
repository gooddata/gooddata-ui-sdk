// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { dashboardAttributeFilterItemDisplayForm } from "@gooddata/sdk-model";

import { type ReplaceAttributeFilterItemSelection } from "../../../commands/filters.js";
import { attributeFilterItemSelectionReplaced } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { selectIsApplyFiltersAllAtOnceEnabledAndSet } from "../../../store/config/configSelectors.js";
import {
    selectIsCrossFiltering,
    selectIsFilterFromCrossFilteringByLocalIdentifier,
} from "../../../store/drill/drillSelectors.js";
import { selectFilterContextAttributeFilterItemByLocalId } from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged, resetCrossFiltering } from "../common.js";
import { resolveAndRegisterDisplayFormMetadata } from "./resolveDisplayFormMetadata.js";

export function* replaceAttributeFilterItemSelectionHandler(
    ctx: DashboardContext,
    cmd: ReplaceAttributeFilterItemSelection,
): SagaIterator<void> {
    const { filterLocalId, filter, isWorkingSelectionChange, isSelectionInvalid } = cmd.payload;

    // Validate that the filter exists using the wide selector
    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterItemByLocalId>> =
        yield select(selectFilterContextAttributeFilterItemByLocalId(filterLocalId));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with filterLocalId ${filterLocalId} not found.`);
    }

    const isApplyAllAtOnceEnabledAndSet: ReturnType<typeof selectIsApplyFiltersAllAtOnceEnabledAndSet> =
        yield select(selectIsApplyFiltersAllAtOnceEnabledAndSet);

    yield put(
        tabsActions.replaceAttributeFilterItem({
            filterLocalId,
            filter,
            isWorkingSelectionChange: isWorkingSelectionChange && isApplyAllAtOnceEnabledAndSet,
            isSelectionInvalid,
        }),
    );

    // Ensure the new filter's displayForm is registered in the displayFormsMap.
    // This is needed for cross-type migration (e.g. text→list) where the new filter's
    // displayForm (primary label) may not have been registered previously.
    const newDisplayForm = dashboardAttributeFilterItemDisplayForm(filter);
    yield call(resolveAndRegisterDisplayFormMetadata, newDisplayForm);

    // Read back the changed filter for the event
    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterItemByLocalId>> =
        yield select(selectFilterContextAttributeFilterItemByLocalId(filterLocalId));

    if (changedFilter) {
        yield dispatchDashboardEvent(
            attributeFilterItemSelectionReplaced(ctx, changedFilter, cmd.correlationId),
        );
    }

    const isCrossFiltering = yield select(selectIsCrossFiltering);
    const isCurrentFilterCrossFiltering = yield select(
        selectIsFilterFromCrossFilteringByLocalIdentifier(filterLocalId),
    );
    if (
        isCrossFiltering &&
        !isCurrentFilterCrossFiltering &&
        (!isWorkingSelectionChange || !isApplyAllAtOnceEnabledAndSet)
    ) {
        yield call(resetCrossFiltering, cmd);
    }

    yield call(dispatchFilterContextChanged, ctx, cmd);
}
