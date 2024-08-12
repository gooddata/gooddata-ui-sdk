// (C) 2022-2024 GoodData Corporation
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { invariant } from "ts-invariant";
import { batchActions } from "redux-batched-actions";
import flatMap from "lodash/flatMap.js";

import { SetAttributeFilterDisplayForm } from "../../../commands/filters.js";
import { attributeDisplayFormChanged } from "../../../events/filters.js";
import { filterContextActions } from "../../../store/filterContext/index.js";
import { selectFilterContextAttributeFilterByLocalId } from "../../../store/filterContext/filterContextSelectors.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { validateFilterDisplayForm } from "./validation/filterDisplayFormValidation.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { selectAllCatalogDisplayFormsMap } from "../../../store/catalog/catalogSelectors.js";
import {
    areObjRefsEqual,
    IAttributeMetadataObject,
    IDashboardAttributeFilter,
    isDashboardAttributeFilterReference,
} from "@gooddata/sdk-model";
import { query } from "../../../store/_infra/queryCall.js";
import { queryAttributeByDisplayForm } from "../../../queries/index.js";
import { newDisplayFormMap } from "../../../../_staging/metadata/objRefMap.js";
import { selectEnableDuplicatedLabelValuesInAttributeFilter } from "../../../store/config/configSelectors.js";
import { selectWidgets } from "../../../store/layout/layoutSelectors.js";
import { ignoreFilterOnInsightWidget, unignoreFilterOnInsightWidget } from "../../../commands/insight.js";
import { ExtendedDashboardWidget } from "src/model/types/layoutTypes.js";

export function* changeAttributeDisplayFormHandler(
    ctx: DashboardContext,
    cmd: SetAttributeFilterDisplayForm,
): SagaIterator<void> {
    const { filterLocalId, displayForm } = cmd.payload;
    const {
        backend: {
            capabilities: { supportsElementUris },
        },
    } = ctx;

    const originalFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(filterLocalId));

    const catalogDisplayFormsMap: ReturnType<typeof selectAllCatalogDisplayFormsMap> = yield select(
        selectAllCatalogDisplayFormsMap,
    );

    const attributes: IAttributeMetadataObject[] = yield call(
        query,
        queryAttributeByDisplayForm([displayForm]),
    );

    const attributeDisplayFormsMap = newDisplayFormMap([...flatMap(attributes, (a) => a.displayForms)]);

    const displayFormData =
        catalogDisplayFormsMap.get(displayForm) || attributeDisplayFormsMap.get(displayForm);

    invariant(
        displayFormData,
        "Inconsistent state in changeAttributeDisplayFormHandler, cannot update attribute filter with display form not available in the catalog.",
    );

    const attribute = displayFormData?.attribute;

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
    const enableDuplicatedLabelValuesInAttributeFilter: ReturnType<
        typeof selectEnableDuplicatedLabelValuesInAttributeFilter
    > = yield select(selectEnableDuplicatedLabelValuesInAttributeFilter);

    yield put(
        batchActions([
            // keep the attribute display form field up to date
            filterContextActions.addAttributeFilterDisplayForm(displayFormData),
            filterContextActions.changeAttributeDisplayForm({
                filterLocalId,
                displayForm,
                supportsElementUris,
                enableDuplicatedLabelValuesInAttributeFilter,
            }),
        ]),
    );

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(filterLocalId));

    invariant(
        changedFilter,
        "Inconsistent state in changeAttributeDisplayFormHandler, cannot update attribute filter for given local identifier.",
    );

    if (enableDuplicatedLabelValuesInAttributeFilter) {
        // sync change of filter's DF with potential ignoreDashboardFilters on insight widgets
        const widgets: ReturnType<typeof selectWidgets> = yield select(selectWidgets);
        for (const widget of widgets) {
            const isWidgetReferencingChangedFilter = getIsWidgetReferencingChangedFilter(
                widget,
                originalFilter,
            );

            if (originalFilter && isWidgetReferencingChangedFilter) {
                yield put(
                    unignoreFilterOnInsightWidget(widget.ref, originalFilter.attributeFilter.displayForm),
                );
                yield put(ignoreFilterOnInsightWidget(widget.ref, changedFilter.attributeFilter.displayForm));
            }
        }
    }

    yield dispatchDashboardEvent(attributeDisplayFormChanged(ctx, changedFilter, cmd.correlationId));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}

function getIsWidgetReferencingChangedFilter(
    widget: ExtendedDashboardWidget,
    originalFilter?: IDashboardAttributeFilter,
) {
    return (
        originalFilter &&
        widget.ignoreDashboardFilters?.some((reference) => {
            if (!isDashboardAttributeFilterReference(reference)) {
                return false;
            }

            return areObjRefsEqual(reference.displayForm, originalFilter.attributeFilter.displayForm);
        })
    );
}
