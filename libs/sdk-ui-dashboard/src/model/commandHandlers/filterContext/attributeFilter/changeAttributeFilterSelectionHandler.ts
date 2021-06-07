// (C) 2021 GoodData Corporation
import { call, put, SagaReturnType } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import invariant from "ts-invariant";

import { invalidArgumentsProvided } from "../../../events/general";
import { attributeFilterSelectionChanged } from "../../../events/filters";
import { ChangeAttributeFilterSelection } from "../../../commands/filters";
import { filterContextActions } from "../../../state/filterContext";
import { DashboardContext } from "../../../types/commonTypes";
import { putCurrentFilterContextChanged } from "../common";
import { getAttributeFilterById } from "./utils";

export function* changeAttributeFilterSelectionHandler(
    ctx: DashboardContext,
    cmd: ChangeAttributeFilterSelection,
): SagaIterator<void> {
    const { elements, filterLocalId, selectionType } = cmd.payload;

    // validate filterLocalId
    const affectedFilter: SagaReturnType<typeof getAttributeFilterById> = yield call(
        getAttributeFilterById,
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

    yield put(
        filterContextActions.updateAttributeFilterSelection({
            elements,
            filterLocalId,
            negativeSelection: selectionType === "NOT_IN",
        }),
    );

    const changedFilter: SagaReturnType<typeof getAttributeFilterById> = yield call(
        getAttributeFilterById,
        cmd.payload.filterLocalId,
    );

    invariant(changedFilter, "Inconsistent state in attributeFilterChangeSelectionCommandHandler");

    yield put(attributeFilterSelectionChanged(ctx, changedFilter, cmd.correlationId));
    yield call(putCurrentFilterContextChanged, ctx, cmd);
}
