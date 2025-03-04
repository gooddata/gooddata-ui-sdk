// (C) 2021-2025 GoodData Corporation
import { all, call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { invariant } from "ts-invariant";

import { invalidArgumentsProvided } from "../../../events/general.js";
import { attributeFilterSelectionChanged } from "../../../events/filters.js";
import { ChangeAttributeFilterSelection } from "../../../commands/filters.js";
import { filterContextActions } from "../../../store/filterContext/index.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged, resetCrossFiltering } from "../common.js";
import {
    selectAttributeFilterDescendants,
    selectFilterContextAttributeFilterByLocalId,
} from "../../../store/filterContext/filterContextSelectors.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import {
    selectIsCrossFiltering,
    selectIsFilterFromCrossFilteringByLocalIdentifier,
} from "../../../store/drill/drillSelectors.js";
import { selectEnableDashboardFiltersApplyModes } from "../../../store/config/configSelectors.js";

export function* changeAttributeFilterSelectionHandler(
    ctx: DashboardContext,
    cmd: ChangeAttributeFilterSelection,
): SagaIterator<void> {
    const { elements, filterLocalId, selectionType, isWorkingSelectionChange } = cmd.payload;

    // validate filterLocalId
    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(cmd.payload.filterLocalId));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with filterLocalId ${filterLocalId} not found.`);
    }

    const enableDashboardFiltersApplyModes: ReturnType<typeof selectEnableDashboardFiltersApplyModes> =
        yield select(selectEnableDashboardFiltersApplyModes);

    yield put(
        filterContextActions.updateAttributeFilterSelection({
            elements,
            filterLocalId,
            negativeSelection: selectionType === "NOT_IN",
            isWorkingSelectionChange: isWorkingSelectionChange && enableDashboardFiltersApplyModes,
        }),
    );

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(cmd.payload.filterLocalId));

    invariant(changedFilter, "Inconsistent state in attributeFilterChangeSelectionCommandHandler");

    if (!ctx.backend.capabilities.supportsKeepingDependentFiltersSelection) {
        const childFiltersIds: ReturnType<ReturnType<typeof selectAttributeFilterDescendants>> = yield select(
            selectAttributeFilterDescendants(changedFilter.attributeFilter.localIdentifier!),
        );

        yield all(
            childFiltersIds.map((childFilterId) =>
                put(
                    filterContextActions.updateAttributeFilterSelection({
                        filterLocalId: childFilterId,
                        elements: {
                            uris: [],
                        },
                        negativeSelection: true,
                        isWorkingSelectionChange:
                            isWorkingSelectionChange && enableDashboardFiltersApplyModes,
                    }),
                ),
            ),
        );
    }

    const isCrossFiltering = yield select(selectIsCrossFiltering);
    const isCurrentFilterCrossFiltering = yield select(
        selectIsFilterFromCrossFilteringByLocalIdentifier(filterLocalId),
    );
    if (
        isCrossFiltering &&
        !isCurrentFilterCrossFiltering &&
        (!isWorkingSelectionChange || !enableDashboardFiltersApplyModes)
    ) {
        yield call(resetCrossFiltering, cmd);
    }

    if (!isWorkingSelectionChange || !enableDashboardFiltersApplyModes) {
        yield dispatchDashboardEvent(attributeFilterSelectionChanged(ctx, changedFilter, cmd.correlationId));
        yield call(dispatchFilterContextChanged, ctx, cmd);
    }
}
