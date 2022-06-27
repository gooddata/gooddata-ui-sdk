// (C) 2022 GoodData Corporation
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import invariant from "ts-invariant";

import { SetAttributeFilterDisplayForm } from "../../../commands/filters";
import { attributeDisplayFormChanged } from "../../../events/filters";
import { filterContextActions } from "../../../store/filterContext";
import {
    selectAttributeFilterDisplayFormsMap,
    selectFilterContextAttributeFilterByLocalId,
} from "../../../store/filterContext/filterContextSelectors";
import { DashboardContext } from "../../../types/commonTypes";
import { dispatchFilterContextChanged } from "../common";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher";
import { validateFilterDisplayForm } from "./validation/filterDisplayFormValidation";
import { invalidArgumentsProvided } from "../../../events/general";

export function* changeAttributeDisplayFormHandler(
    ctx: DashboardContext,
    cmd: SetAttributeFilterDisplayForm,
): SagaIterator<void> {
    const { filterLocalId, displayForm } = cmd.payload;

    yield put(
        filterContextActions.changeAttributeDisplayForm({
            filterLocalId,
            displayForm,
        }),
    );

    const displayFormsMap: ReturnType<typeof selectAttributeFilterDisplayFormsMap> = yield select(
        selectAttributeFilterDisplayFormsMap,
    );

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(filterLocalId));

    invariant(
        changedFilter,
        "Inconsistent state in changeAttributeDisplayFormHandler, cannot update attribute filter for given local identifier.",
    );

    const attribute = displayFormsMap.get(changedFilter.attributeFilter.displayForm);

    const validationResult: SagaReturnType<typeof validateFilterDisplayForm> = yield call(
        validateFilterDisplayForm,
        ctx,
        attribute,
        displayForm,
    );

    if (validationResult !== "VALID") {
        const message =
            validationResult === "INVALID_ATTRIBUTE_DISPLAY_FORM"
                ? "The display form provided is not a valid display form of the attribute filter."
                : "Cannot find the attribute for the display form used on the attribute filter.";

        throw invalidArgumentsProvided(ctx, cmd, message);
    }

    yield dispatchDashboardEvent(attributeDisplayFormChanged(ctx, changedFilter, cmd.correlationId));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
