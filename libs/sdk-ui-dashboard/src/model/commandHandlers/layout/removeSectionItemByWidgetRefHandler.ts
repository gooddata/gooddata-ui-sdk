// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";
import { selectWidgetCoordinatesByRef } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

import { RemoveSectionItemByWidgetRef } from "../../commands/layout.js";
import { removeSectionItemSaga } from "./removeSectionItemHandler.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { objRefToString } from "@gooddata/sdk-model";

export function* removeSectionItemByWidgetRefHandler(
    ctx: DashboardContext,
    cmd: RemoveSectionItemByWidgetRef,
): SagaIterator<void> {
    let widgetCoordinates: ReturnType<ReturnType<typeof selectWidgetCoordinatesByRef>>;
    try {
        widgetCoordinates = yield select(selectWidgetCoordinatesByRef(cmd.payload.widgetRef));
    } catch (e: any) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Can't get widget coordinates for widget ref: ${objRefToString(cmd.payload.widgetRef)}, ${
                e.message
            }`,
        );
    }

    return yield call(
        removeSectionItemSaga,
        ctx,
        {
            correlationId: cmd.correlationId,
            payload: {
                ...widgetCoordinates,
                eager: cmd.payload.eager,
                stashIdentifier: cmd.payload.stashIdentifier,
            },
        },
        cmd,
    );
}
