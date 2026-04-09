// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";
import { batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import {
    DashboardAttributeFilterSelectionTypeValues,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemLocalIdentifier,
    isInsightWidget,
    objRefToString,
} from "@gooddata/sdk-model";

import { resolveAndRegisterDisplayFormMetadata } from "./resolveDisplayFormMetadata.js";
import { canFilterBeAdded } from "./validation/uniqueFiltersValidation.js";
import { type IAddTextAttributeFilter } from "../../../commands/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { selectBackendCapabilities } from "../../../store/backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectCanAddMoreFilters,
    selectFilterContextAttributeFilterItemByDisplayForm,
    selectFilterContextAttributeFilterItemByLocalId,
    selectFilterContextAttributeFilterItems,
} from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { selectAllAnalyticalWidgets } from "../../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { type PromiseFnReturnType } from "../../../types/sagas.js";
import { validateDrillToCustomUrlParams } from "../../common/validateDrillToCustomUrlParams.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* addTextAttributeFilterHandler(
    ctx: DashboardContext,
    cmd: IAddTextAttributeFilter,
): SagaIterator<void> {
    const { filter, index, mode } = cmd.payload;

    const displayForm = dashboardAttributeFilterItemDisplayForm(filter);
    const localIdentifier = dashboardAttributeFilterItemLocalIdentifier(filter);

    const isUnderFilterCountLimit: ReturnType<typeof selectCanAddMoreFilters> =
        yield select(selectCanAddMoreFilters);

    if (!isUnderFilterCountLimit) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to add filter, even though the limit on the count of filters has been reached.`,
        );
    }

    const allFilters: ReturnType<typeof selectFilterContextAttributeFilterItems> = yield select(
        selectFilterContextAttributeFilterItems,
    );

    const canBeAdded: PromiseFnReturnType<typeof canFilterBeAdded> = yield call(
        canFilterBeAdded,
        ctx,
        displayForm,
        allFilters,
    );

    if (!canBeAdded) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Filter for displayForm ${objRefToString(displayForm)} already exists in the filter context.`,
        );
    }

    // Resolve and register the display form metadata so selectors can find it
    const displayFormMetadata: SagaReturnType<typeof resolveAndRegisterDisplayFormMetadata> = yield call(
        resolveAndRegisterDisplayFormMetadata,
        displayForm,
    );

    if (!displayFormMetadata) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to add filter for a non-existing display form ${objRefToString(displayForm)}.`,
        );
    }

    yield put(
        tabsActions.addTextAttributeFilter({
            filter,
            index,
        }),
    );

    const addedFilterByLocalId: ReturnType<
        ReturnType<typeof selectFilterContextAttributeFilterItemByLocalId>
    > = localIdentifier
        ? yield select(selectFilterContextAttributeFilterItemByLocalId(localIdentifier))
        : undefined;
    const addedFilterByDisplayForm: ReturnType<
        ReturnType<typeof selectFilterContextAttributeFilterItemByDisplayForm>
    > = yield select(selectFilterContextAttributeFilterItemByDisplayForm(displayForm));
    const addedFilter = addedFilterByLocalId ?? addedFilterByDisplayForm;
    invariant(addedFilter, "Inconsistent state in addTextAttributeFilterHandler");
    const addedFilterLocalIdentifier = dashboardAttributeFilterItemLocalIdentifier(addedFilter);
    invariant(addedFilterLocalIdentifier, "Inconsistent state in addTextAttributeFilterHandler");

    const capabilities: ReturnType<typeof selectBackendCapabilities> =
        yield select(selectBackendCapabilities);
    const configActions = [];
    if (capabilities.supportsHiddenAndLockedFiltersOnUI && mode) {
        configActions.push(
            tabsActions.changeAttributeFilterConfigMode({
                localIdentifier: addedFilterLocalIdentifier,
                mode,
            }),
        );
    }
    // New filters default to listOrText available mode
    configActions.push(
        tabsActions.changeAttributeFilterSelectionType({
            localIdentifier: addedFilterLocalIdentifier,
            selectionType: DashboardAttributeFilterSelectionTypeValues.LIST_OR_TEXT,
        }),
    );
    if (!isEmpty(configActions)) {
        yield put(batchActions(configActions));
    }

    yield call(dispatchFilterContextChanged, ctx, cmd);
    const widgets: ReturnType<typeof selectAllAnalyticalWidgets> = yield select(selectAllAnalyticalWidgets);
    yield call(validateDrillToCustomUrlParams, widgets.filter(isInsightWidget));
}
