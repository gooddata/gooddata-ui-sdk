// (C) 2021-2026 GoodData Corporation

import { toNumber } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, select } from "redux-saga/effects";

import {
    type IDashboardDateFilter,
    type ObjRef,
    dashboardFilterObjRef,
    isDashboardDateFilter,
    isDashboardParameterizedDateFilter,
    newAbsoluteDashboardDateFilter,
    newAllTimeDashboardDateFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { PARAMETERIZED_DATE_FILTER_NOT_SUPPORTED } from "../../../../_staging/dashboard/parameterizedDateFilters.js";
import {
    type ChangeDateFilterSelection,
    type ChangeDateFilterSelectionOfAnyType,
    type DateFilterSelection,
} from "../../../commands/filters.js";
import { dateFilterChanged, dateFilterOfAnyTypeChanged } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { selectIsApplyFiltersAllAtOnceEnabledAndSet } from "../../../store/config/configSelectors.js";
import { selectIsCrossFiltering } from "../../../store/drill/drillSelectors.js";
import { type IUpsertDateFilterPayload } from "../../../store/tabs/filterContext/filterContextReducers.js";
import {
    selectFilterContextDateFilterOfAnyType,
    selectFilterContextDateFilterOfAnyTypeByDataSet,
} from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { canApplyDateFilter, resetCrossFiltering } from "../common.js";
import { toUpsertDateFilterPayload } from "../tabSync/tabSyncRules.js";
import { type ITabSyncSession, beginTabSync, endTabSync, putTabSynced } from "../tabSync/tabSyncSaga.js";

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
        throw invalidArgumentsProvided(ctx, cmd, INVALID_BY_DATE_FILTER_CONFIG);
    }

    const localIdentifierObj = cmd.payload.localIdentifier
        ? { localIdentifier: cmd.payload.localIdentifier }
        : {};
    const emptyValueHandlingObj = cmd.payload.emptyValueHandling
        ? { emptyValueHandling: cmd.payload.emptyValueHandling }
        : {};
    const upsertPayload: IUpsertDateFilterPayload = isAllTime
        ? {
              type: "allTime",
              dataSet: cmd.payload.dataSet,
              ...localIdentifierObj,
              ...emptyValueHandlingObj,
          }
        : {
              type: cmd.payload.type,
              granularity: cmd.payload.granularity,
              from: cmd.payload.from,
              to: cmd.payload.to,
              dataSet: cmd.payload.dataSet,
              ...localIdentifierObj,
              ...(cmd.payload.boundedFilter ? { boundedFilter: cmd.payload.boundedFilter } : {}),
              ...emptyValueHandlingObj,
          };

    yield call(
        upsertDateFilterSelection,
        ctx,
        cmd,
        upsertPayload,
        cmd.payload.dataSet,
        cmd.payload.dateFilterOptionLocalId,
        cmd.payload.isWorkingSelectionChange,
    );
}

export function* changeDateFilterSelectionOfAnyTypeHandler(
    ctx: DashboardContext,
    cmd: ChangeDateFilterSelectionOfAnyType,
): SagaIterator<void> {
    const { filter, dateFilterOptionLocalId, isWorkingSelectionChange } = cmd.payload;

    if (isDashboardParameterizedDateFilter(filter)) {
        throw invalidArgumentsProvided(ctx, cmd, PARAMETERIZED_DATE_FILTER_NOT_SUPPORTED);
    }

    const canApply: SagaReturnType<typeof canApplyDateFilter> = yield call(
        canApplyDateFilter,
        filter ?? newAllTimeDashboardDateFilter(),
    );
    if (!canApply) {
        throw invalidArgumentsProvided(ctx, cmd, INVALID_BY_DATE_FILTER_CONFIG);
    }

    yield call(
        upsertDateFilterSelection,
        ctx,
        cmd,
        filter ? toUpsertDateFilterPayload(filter) : { type: "allTime" },
        filter ? dashboardFilterObjRef(filter) : undefined,
        dateFilterOptionLocalId,
        isWorkingSelectionChange,
    );
}

const INVALID_BY_DATE_FILTER_CONFIG =
    "Cannot apply a date filter that is invalid by the current dateFilterConfig.";

function* upsertDateFilterSelection(
    ctx: DashboardContext,
    cmd: ChangeDateFilterSelection | ChangeDateFilterSelectionOfAnyType,
    upsertPayload: IUpsertDateFilterPayload,
    dataSet: ObjRef | undefined,
    dateFilterOptionLocalId: string | undefined,
    requestedWorkingSelectionChange: boolean | undefined,
): SagaIterator<void> {
    const session: ITabSyncSession = yield call(beginTabSync);

    const isApplyAllAtOnceEnabledAndSet: ReturnType<typeof selectIsApplyFiltersAllAtOnceEnabledAndSet> =
        yield select(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const isWorkingSelectionChange = requestedWorkingSelectionChange && isApplyAllAtOnceEnabledAndSet;
    yield call(putTabSynced, session, [
        tabsActions.upsertDateFilter({ ...upsertPayload, isWorkingSelectionChange }),
    ]);

    if (!isWorkingSelectionChange) {
        const isCrossFiltering = yield select(selectIsCrossFiltering);
        if (isCrossFiltering) {
            yield call(resetCrossFiltering, cmd);
        }
    }

    const affectedFilter: ReturnType<typeof selectFilterContextDateFilterOfAnyType> = dataSet
        ? yield select(selectFilterContextDateFilterOfAnyTypeByDataSet(dataSet))
        : yield select(selectFilterContextDateFilterOfAnyType);

    if (!affectedFilter || isDashboardDateFilter(affectedFilter)) {
        yield dispatchDashboardEvent(
            dateFilterChanged(ctx, affectedFilter, dateFilterOptionLocalId, cmd.correlationId),
        );
    }
    yield dispatchDashboardEvent(
        dateFilterOfAnyTypeChanged(ctx, affectedFilter, dateFilterOptionLocalId, cmd.correlationId),
    );

    yield call(endTabSync, ctx, cmd, session);
}

function dateFilterSelectionToDateFilter(dateFilterSelection: DateFilterSelection): IDashboardDateFilter {
    if (dateFilterSelection.type === "absolute" && dateFilterSelection.from && dateFilterSelection.to) {
        return newAbsoluteDashboardDateFilter(
            dateFilterSelection.from.toString(),
            dateFilterSelection.to.toString(),
            undefined,
            dateFilterSelection.localIdentifier,
            dateFilterSelection.emptyValueHandling,
            dateFilterSelection.granularity,
        );
    } else if (
        dateFilterSelection.type === "relative" &&
        dateFilterSelection.granularity === "GDC.time.date" &&
        dateFilterSelection.from === undefined &&
        dateFilterSelection.to === undefined
    ) {
        return newAllTimeDashboardDateFilter(
            undefined,
            dateFilterSelection.localIdentifier,
            dateFilterSelection.emptyValueHandling,
        );
    } else {
        return newRelativeDashboardDateFilter(
            dateFilterSelection.granularity,
            toNumber(dateFilterSelection.from),
            toNumber(dateFilterSelection.to),
            undefined,
            dateFilterSelection.localIdentifier,
            dateFilterSelection.boundedFilter,
            dateFilterSelection.emptyValueHandling,
        );
    }
}
