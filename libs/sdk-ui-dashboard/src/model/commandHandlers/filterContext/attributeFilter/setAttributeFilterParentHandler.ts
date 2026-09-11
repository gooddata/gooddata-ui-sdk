// (C) 2021-2026 GoodData Corporation

import { isEqual } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import {
    type IDashboardAttributeFilterParent,
    dashboardAttributeFilterItemFilterElementsBy,
} from "@gooddata/sdk-model";

import { type ISetAttributeFilterParents } from "../../../commands/filters.js";
import { attributeFilterParentChanged } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { selectRestrictedDashboardFilterLocalIdentifiers } from "../../../store/filtering/dashboardFilterSelectors.js";
import {
    selectAttributeFilterDisplayFormsMap,
    selectFilterContextAttributeFilterItemByLocalId,
    selectFilterContextAttributeFilterItems,
} from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

import { validateAttributeFilterParents } from "./validation/parentFiltersValidation.js";

export function* setAttributeFilterParentsHandler(
    ctx: DashboardContext,
    cmd: ISetAttributeFilterParents,
): SagaIterator<void> {
    const { filterLocalId, parentFilters } = cmd.payload;

    const allFilters: ReturnType<typeof selectFilterContextAttributeFilterItems> = yield select(
        selectFilterContextAttributeFilterItems,
    );

    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterItemByLocalId>> =
        yield select(selectFilterContextAttributeFilterItemByLocalId(filterLocalId));

    const displayFormsMap: ReturnType<typeof selectAttributeFilterDisplayFormsMap> = yield select(
        selectAttributeFilterDisplayFormsMap,
    );

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with localId ${filterLocalId} was not found.`);
    }

    const restrictedFilterLocalIdentifiers: ReturnType<
        typeof selectRestrictedDashboardFilterLocalIdentifiers
    > = yield select(selectRestrictedDashboardFilterLocalIdentifiers);
    const storedParents = dashboardAttributeFilterItemFilterElementsBy(affectedFilter) ?? [];

    // A restricted parent carried over unchanged holds no metadata by design, so validating it would
    // reject the whole command. Anything new or edited is validated, which is what refuses a
    // dependency on a filter the caller may not read.
    const isCarriedOverRestrictedParent = (parent: IDashboardAttributeFilterParent) =>
        restrictedFilterLocalIdentifiers.has(parent.filterLocalIdentifier) &&
        storedParents.some((stored) => isEqual(stored, parent));

    const validationResult: SagaReturnType<typeof validateAttributeFilterParents> = yield call(
        validateAttributeFilterParents,
        ctx,
        affectedFilter,
        parentFilters.filter((parent) => !isCarriedOverRestrictedParent(parent)),
        allFilters,
        displayFormsMap,
    );

    if (validationResult !== "VALID") {
        const message =
            validationResult === "EXTRANEOUS_PARENT"
                ? "Some of the parents provided cannot be used because filters for those are not in the filters collection. " +
                  "Only existing filters can be used as parent filters."
                : validationResult === "INVALID_METADATA"
                  ? "Some of the parents provided cannot be used because the 'metadata' for parent filter are missing."
                  : "Some of the parents provided cannot be used because the 'over' parameter is invalid for the target filter.";

        throw invalidArgumentsProvided(ctx, cmd, message);
    }

    yield put(
        tabsActions.setAttributeFilterParents({
            filterLocalId,
            parentFilters,
        }),
    );

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterItemByLocalId>> =
        yield select(selectFilterContextAttributeFilterItemByLocalId(filterLocalId));

    invariant(changedFilter, "Inconsistent state in attributeFilterSetParentCommandHandler");

    yield dispatchDashboardEvent(attributeFilterParentChanged(ctx, changedFilter, cmd.correlationId));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
