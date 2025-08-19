// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { ChangeAttributeFilterSelection } from "../../../commands/filters.js";
import { attributeFilterSelectionChanged } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import {
    selectEnableImmediateAttributeFilterDisplayAsLabelMigration,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
} from "../../../store/config/configSelectors.js";
import {
    selectIsCrossFiltering,
    selectIsFilterFromCrossFilteringByLocalIdentifier,
} from "../../../store/drill/drillSelectors.js";
import {
    selectAttributeFilterDescendants,
    selectFilterContextAttributeFilterByLocalId,
} from "../../../store/filterContext/filterContextSelectors.js";
import { filterContextActions } from "../../../store/filterContext/index.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged, resetCrossFiltering } from "../common.js";

export function* changeAttributeFilterSelectionHandler(
    ctx: DashboardContext,
    cmd: ChangeAttributeFilterSelection,
): SagaIterator<void> {
    const {
        elements,
        filterLocalId,
        selectionType,
        isWorkingSelectionChange,
        isResultOfMigration,
        isSelectionInvalid,
    } = cmd.payload;

    // validate filterLocalId
    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(cmd.payload.filterLocalId));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with filterLocalId ${filterLocalId} not found.`);
    }

    const isApplyAllAtOnceEnabledAndSet: ReturnType<typeof selectIsApplyFiltersAllAtOnceEnabledAndSet> =
        yield select(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const enableImmediateAttributeFilterDisplayAsLabelMigration: ReturnType<
        typeof selectEnableImmediateAttributeFilterDisplayAsLabelMigration
    > = yield select(selectEnableImmediateAttributeFilterDisplayAsLabelMigration);

    yield put(
        filterContextActions.updateAttributeFilterSelection({
            elements,
            filterLocalId,
            negativeSelection: selectionType === "NOT_IN",
            isWorkingSelectionChange: isWorkingSelectionChange && isApplyAllAtOnceEnabledAndSet,
            enableImmediateAttributeFilterDisplayAsLabelMigration,
            isResultOfMigration,
            isSelectionInvalid,
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
                        isWorkingSelectionChange: isWorkingSelectionChange && isApplyAllAtOnceEnabledAndSet,
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
        (!isWorkingSelectionChange || !isApplyAllAtOnceEnabledAndSet)
    ) {
        yield call(resetCrossFiltering, cmd);
    }

    yield dispatchDashboardEvent(attributeFilterSelectionChanged(ctx, changedFilter, cmd.correlationId));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
