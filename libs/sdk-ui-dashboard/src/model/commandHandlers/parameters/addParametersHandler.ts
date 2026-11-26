// (C) 2026 GoodData Corporation

import { batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { DashboardParameterModeValues, objRefToString } from "@gooddata/sdk-model";

import { type IAddParameters } from "../../commands/parameters.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { type IDashboardParametersAdded, parametersAdded } from "../../events/parameters.js";
import { selectCatalogParameterByRef } from "../../store/catalog/catalogSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectActiveParameterRefKeys } from "../../store/tabs/parameters/parametersSelectors.js";
import { selectActiveOrDefaultTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { revalidateDrillToCustomUrlParams } from "../common/validateDrillToCustomUrlParams.js";

export function* addParametersHandler(
    ctx: DashboardContext,
    cmd: IAddParameters,
): SagaIterator<IDashboardParametersAdded> {
    const { refs, tabLocalIdentifier } = cmd.payload;

    const activeTabLocalIdentifier: ReturnType<typeof selectActiveOrDefaultTabLocalIdentifier> = yield select(
        selectActiveOrDefaultTabLocalIdentifier,
    );
    if (tabLocalIdentifier !== activeTabLocalIdentifier) {
        throw invalidArgumentsProvided(ctx, cmd, `The tab ${tabLocalIdentifier} is not the active tab.`);
    }

    const activeRefKeys: ReturnType<typeof selectActiveParameterRefKeys> = yield select(
        selectActiveParameterRefKeys,
    );
    const takenRefKeys = new Set(activeRefKeys);
    const addActions: ReturnType<typeof tabsActions.addParameter>[] = [];
    for (const ref of refs) {
        const refKey = objRefToString(ref);
        if (takenRefKeys.has(refKey)) {
            throw invalidArgumentsProvided(ctx, cmd, `The parameter ${refKey} is already on the active tab.`);
        }
        takenRefKeys.add(refKey);

        const catalogParameter: ReturnType<ReturnType<typeof selectCatalogParameterByRef>> = yield select(
            selectCatalogParameterByRef(ref),
        );
        if (!catalogParameter) {
            throw invalidArgumentsProvided(ctx, cmd, `The parameter ${refKey} is not in the catalog.`);
        }
        addActions.push(
            tabsActions.addParameter({
                parameter: {
                    ref,
                    parameterType: catalogParameter.definition.type,
                    mode: DashboardParameterModeValues.ACTIVE,
                },
                workspaceDefault: catalogParameter.definition.defaultValue,
            }),
        );
    }

    yield put(batchActions(addActions));
    yield call(revalidateDrillToCustomUrlParams);

    return parametersAdded(ctx, refs, cmd.correlationId);
}
