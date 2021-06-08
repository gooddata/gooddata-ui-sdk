// (C) 2021 GoodData Corporation
import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { MoveAttributeFilter } from "../../../commands/filters";
import { invalidArgumentsProvided } from "../../../events/general";
import { attributeFilterMoved } from "../../../events/filters";
import { filterContextActions } from "../../../state/filterContext";
import {
    makeSelectFilterContextAttributeFilterByLocalId,
    makeSelectFilterContextAttributeFilterIndexByLocalId,
    selectFilterContextFilters,
} from "../../../state/filterContext/filterContextSelectors";
import { DashboardContext } from "../../../types/commonTypes";
import { putCurrentFilterContextChanged } from "../common";

export function* moveAttributeFilterHandler(
    ctx: DashboardContext,
    cmd: MoveAttributeFilter,
): SagaIterator<void> {
    const { filterLocalId, index } = cmd.payload;

    // validate filterLocalId
    const selectFilterByLocalId = makeSelectFilterContextAttributeFilterByLocalId();

    const affectedFilter: ReturnType<typeof selectFilterByLocalId> = yield select(
        selectFilterByLocalId,
        filterLocalId,
    );

    if (!affectedFilter) {
        return yield put(
            invalidArgumentsProvided(
                ctx,
                `Filter with filterLocalId ${filterLocalId} not found.`,
                cmd.correlationId,
            ),
        );
    }

    // validate target index
    const allFilters: ReturnType<typeof selectFilterContextFilters> = yield select(
        selectFilterContextFilters,
    );

    const maximalTargetIndex = allFilters.length - 1;

    if (index > maximalTargetIndex || index < -1) {
        return yield put(
            invalidArgumentsProvided(
                ctx,
                `Invalid index (${index}) provided, it must be between -1 and ${maximalTargetIndex}`,
                cmd.correlationId,
            ),
        );
    }

    const selectFilterIndexByLocalId = makeSelectFilterContextAttributeFilterIndexByLocalId();

    const originalIndex: ReturnType<typeof selectFilterIndexByLocalId> = yield select(
        selectFilterIndexByLocalId,
        filterLocalId,
    );

    yield put(
        filterContextActions.moveAttributeFilter({
            filterLocalId,
            index,
        }),
    );

    const finalIndex: ReturnType<typeof selectFilterIndexByLocalId> = yield select(
        selectFilterIndexByLocalId,
        filterLocalId,
    );

    yield put(attributeFilterMoved(ctx, affectedFilter, originalIndex, finalIndex, cmd.correlationId));
    yield call(putCurrentFilterContextChanged, ctx, cmd);
}
