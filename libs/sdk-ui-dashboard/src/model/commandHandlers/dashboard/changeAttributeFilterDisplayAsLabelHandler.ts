// (C) 2023-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { isDashboardTextAttributeFilter } from "@gooddata/sdk-model";

import { type ISetDashboardAttributeFilterConfigDisplayAsLabel } from "../../commands/dashboard.js";
import {
    attributeDisplayFormChanged,
    dashboardAttributeConfigDisplayAsLabelChanged,
} from "../../events/filters.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { selectFilterContextAttributeFilterItemByLocalId } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { resolveAndRegisterDisplayFormMetadata } from "../filterContext/attributeFilter/resolveDisplayFormMetadata.js";
import { dispatchFilterContextChanged } from "../filterContext/common.js";

export function* changeAttributeFilterDisplayAsLabelHandler(
    ctx: DashboardContext,
    cmd: ISetDashboardAttributeFilterConfigDisplayAsLabel,
): SagaIterator<void> {
    const { localIdentifier, displayAsLabel } = cmd.payload;

    // validate localIdentifier
    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterItemByLocalId>> =
        yield select(selectFilterContextAttributeFilterItemByLocalId(localIdentifier));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with localIdentifier ${localIdentifier} not found.`);
    }

    yield put(tabsActions.changeDisplayAsLabel(cmd.payload));

    // For text filters (arbitrary/match), also update the displayForm on the filter definition itself
    if (isDashboardTextAttributeFilter(affectedFilter) && displayAsLabel) {
        yield call(resolveAndRegisterDisplayFormMetadata, displayAsLabel);

        yield put(
            tabsActions.changeTextFilterDisplayForm({
                filterLocalId: localIdentifier,
                displayForm: displayAsLabel,
                tabLocalIdentifier: cmd.payload.tabLocalIdentifier,
            }),
        );
    }

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterItemByLocalId>> =
        yield select(selectFilterContextAttributeFilterItemByLocalId(localIdentifier));

    invariant(
        changedFilter,
        "Inconsistent state in changeAttributeModeHandler, cannot update attribute filter for given local identifier.",
    );

    yield dispatchDashboardEvent(
        dashboardAttributeConfigDisplayAsLabelChanged(ctx, changedFilter, displayAsLabel, cmd.correlationId),
    );

    if (isDashboardTextAttributeFilter(affectedFilter) && displayAsLabel) {
        yield dispatchDashboardEvent(attributeDisplayFormChanged(ctx, changedFilter, cmd.correlationId));
    }
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
