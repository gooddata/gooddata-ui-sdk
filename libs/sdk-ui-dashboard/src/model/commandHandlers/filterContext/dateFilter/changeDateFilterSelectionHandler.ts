// (C) 2021-2025 GoodData Corporation

import { toNumber } from "lodash-es";
import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, put, select } from "redux-saga/effects";

import {
    IDashboardDateFilter,
    newAbsoluteDashboardDateFilter,
    newAllTimeDashboardDateFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { ChangeDateFilterSelection, DateFilterSelection } from "../../../commands/filters.js";
import { dateFilterChanged } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { selectIsApplyFiltersAllAtOnceEnabledAndSet } from "../../../store/config/configSelectors.js";
import { selectIsCrossFiltering } from "../../../store/drill/drillSelectors.js";
import {
    selectFilterContextDateFilter,
    selectFilterContextDateFilterByDataSet,
} from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { canApplyDateFilter, dispatchFilterContextChanged, resetCrossFiltering } from "../common.js";

export function* changeDateFilterSelectionHandler(
    ctx: DashboardContext,
    cmd: ChangeDateFilterSelection,
): SagaIterator<void> {
    const isAllTime =
        cmd.payload.type === "relative" &&
        cmd.payload.granularity === "GDC.time.date" &&
        cmd.payload.from === undefined &&
        cmd.payload.to === undefined;

    const canApply: SagaReturnType<typeof canApplyDateFilter> = yield call(
        canApplyDateFilter,
        dateFilterSelectionToDateFilter(cmd.payload),
    );
    if (!canApply) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Cannot apply a date filter that is invalid by the current dateFilterConfig.`,
        );
    }

    const isApplyAllAtOnceEnabledAndSet: ReturnType<typeof selectIsApplyFiltersAllAtOnceEnabledAndSet> =
        yield select(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const isWorkingSelectionChange = cmd.payload.isWorkingSelectionChange && isApplyAllAtOnceEnabledAndSet;
    const localIdentifierObj = cmd.payload.localIdentifier
        ? { localIdentifier: cmd.payload.localIdentifier }
        : {};
    yield put(
        tabsActions.upsertDateFilter(
            isAllTime
                ? {
                      type: "allTime",
                      dataSet: cmd.payload.dataSet,
                      isWorkingSelectionChange,
                      ...localIdentifierObj,
                  }
                : {
                      type: cmd.payload.type,
                      granularity: cmd.payload.granularity,
                      from: cmd.payload.from,
                      to: cmd.payload.to,
                      dataSet: cmd.payload.dataSet,
                      isWorkingSelectionChange,
                      ...localIdentifierObj,
                      ...(cmd.payload.boundedFilter ? { boundedFilter: cmd.payload.boundedFilter } : {}),
                  },
        ),
    );

    if (!isWorkingSelectionChange) {
        const isCrossFiltering = yield select(selectIsCrossFiltering);
        if (isCrossFiltering) {
            yield call(resetCrossFiltering, cmd);
        }
    }

    const affectedFilter: ReturnType<typeof selectFilterContextDateFilter> = cmd.payload.dataSet
        ? yield select(selectFilterContextDateFilterByDataSet(cmd.payload.dataSet))
        : yield select(selectFilterContextDateFilter);

    yield dispatchDashboardEvent(
        dateFilterChanged(ctx, affectedFilter, cmd.payload.dateFilterOptionLocalId, cmd.correlationId),
    );

    yield call(dispatchFilterContextChanged, ctx, cmd);
}

function dateFilterSelectionToDateFilter(dateFilterSelection: DateFilterSelection): IDashboardDateFilter {
    if (dateFilterSelection.type === "absolute" && dateFilterSelection.from && dateFilterSelection.to) {
        return newAbsoluteDashboardDateFilter(
            dateFilterSelection.from.toString(),
            dateFilterSelection.to.toString(),
            undefined,
            dateFilterSelection.localIdentifier,
        );
    } else if (
        dateFilterSelection.type === "relative" &&
        dateFilterSelection.granularity === "GDC.time.date" &&
        dateFilterSelection.from === undefined &&
        dateFilterSelection.to === undefined
    ) {
        return newAllTimeDashboardDateFilter(undefined, dateFilterSelection.localIdentifier);
    } else {
        return newRelativeDashboardDateFilter(
            dateFilterSelection.granularity,
            toNumber(dateFilterSelection.from),
            toNumber(dateFilterSelection.to),
            undefined,
            dateFilterSelection.localIdentifier,
            dateFilterSelection.boundedFilter,
        );
    }
}
