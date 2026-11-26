// (C) 2026 GoodData Corporation

import { batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { areObjRefsEqual, objRefToString } from "@gooddata/sdk-model";

import { type IRemoveParameters } from "../../commands/parameters.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { type IDashboardParametersRemoved, parametersRemoved } from "../../events/parameters.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectDashboardParameters } from "../../store/tabs/parameters/parametersSelectors.js";
import { selectActiveOrDefaultTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { revalidateDrillToCustomUrlParams } from "../common/validateDrillToCustomUrlParams.js";

export function* removeParametersHandler(
    ctx: DashboardContext,
    cmd: IRemoveParameters,
): SagaIterator<IDashboardParametersRemoved> {
    const { refs, tabLocalIdentifier } = cmd.payload;

    const activeTabLocalIdentifier: ReturnType<typeof selectActiveOrDefaultTabLocalIdentifier> = yield select(
        selectActiveOrDefaultTabLocalIdentifier,
    );
    if (tabLocalIdentifier !== activeTabLocalIdentifier) {
        throw invalidArgumentsProvided(ctx, cmd, `The tab ${tabLocalIdentifier} is not the active tab.`);
    }

    const activeParameters: ReturnType<typeof selectDashboardParameters> =
        yield select(selectDashboardParameters);
    const remainingRefs = activeParameters.map((parameter) => parameter.ref);
    for (const ref of refs) {
        const index = remainingRefs.findIndex((remainingRef) => areObjRefsEqual(remainingRef, ref));
        if (index === -1) {
            throw invalidArgumentsProvided(
                ctx,
                cmd,
                `The parameter ${objRefToString(ref)} is not on the active tab or is repeated.`,
            );
        }
        remainingRefs.splice(index, 1);
    }

    yield put(batchActions(refs.map((ref) => tabsActions.removeParameter({ ref }))));
    yield call(revalidateDrillToCustomUrlParams);

    return parametersRemoved(ctx, refs, cmd.correlationId);
}
