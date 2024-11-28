// (C) 2021-2024 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";
import { selectWidgetPathByRef } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

import { RemoveSectionItemByWidgetRef } from "../../commands/layout.js";
import { removeSectionItemSaga } from "./removeSectionItemHandler.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { objRefToString } from "@gooddata/sdk-model";

export function* removeSectionItemByWidgetRefHandler(
    ctx: DashboardContext,
    cmd: RemoveSectionItemByWidgetRef,
): SagaIterator<void> {
    let widgetCoordinates: ReturnType<ReturnType<typeof selectWidgetPathByRef>>;
    try {
        widgetCoordinates = yield select(selectWidgetPathByRef(cmd.payload.widgetRef));
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
                itemPath: widgetCoordinates,
                sectionIndex: -1, // just for compatibility purposes, information will be ignored
                itemIndex: -1, // just for compatibility purposes, information will be ignored
                eager: cmd.payload.eager,
                stashIdentifier: cmd.payload.stashIdentifier,
            },
        },
        cmd,
    );
}
