// (C) 2022-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { SagaReturnType, all, call, put, select } from "redux-saga/effects";

import {
    IAttributeDisplayFormMetadataObject,
    IAttributeFilter,
    IDrillToCustomUrl,
    IFilter,
    IInsightWidget,
    areObjRefsEqual,
    filterObjRef,
    idRef,
    isAttributeFilter,
    isDrillToCustomUrl,
    isNegativeAttributeFilter,
    widgetRef,
} from "@gooddata/sdk-model";

import { isDisplayFormRelevantToDrill } from "./isDisplayFormRelevantToDrill.js";
import { dashboardAttributeFilterToAttributeFilter } from "../../../_staging/dashboard/dashboardFilterConverter.js";
import { ObjRefMap } from "../../../_staging/metadata/objRefMap.js";
import { queryWidgetFilters } from "../../queries/widgets.js";
import { query } from "../../store/_infra/queryCall.js";
import { selectAttributeFilterConfigsOverrides } from "../../store/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectAllCatalogDisplayFormsMap } from "../../store/catalog/catalogSelectors.js";
import { selectDrillTargetsByWidgetRef } from "../../store/drillTargets/drillTargetsSelectors.js";
import { selectFilterContextAttributeFilters } from "../../store/filterContext/filterContextSelectors.js";
import { uiActions } from "../../store/ui/index.js";
import {
    extractDashboardFilterDisplayFormIdentifiers,
    extractDisplayFormIdentifiers,
    extractInsightFilterDisplayFormIdentifiers,
} from "../widgets/validation/insightDrillDefinitionUtils.js";

interface IInvalidParamsInfo {
    widget: IInsightWidget;
    invalidDrills: IDrillToCustomUrl[];
}

//
export function* validateDrillToCustomUrlParams(widgets: IInsightWidget[]) {
    const possibleInvalidDrills: SagaReturnType<typeof validateWidgetDrillToCustomUrlParams>[] = yield all(
        widgets.map((widget) => call(validateWidgetDrillToCustomUrlParams, widget)),
    );

    const invalidDrills = possibleInvalidDrills.filter(({ invalidDrills }) => invalidDrills.length > 0);

    if (invalidDrills.length === 0) {
        yield put(uiActions.resetInvalidCustomUrlDrillParameterWidget(widgets));
    } else {
        yield put(uiActions.setInvalidCustomUrlDrillParameterWidgets(invalidDrills));
    }
}

function* validateWidgetDrillToCustomUrlParams(widget: IInsightWidget): SagaIterator<IInvalidParamsInfo> {
    const selectDrillTargetsByWidgetRefSelector = selectDrillTargetsByWidgetRef(widgetRef(widget));
    const drillTargets: ReturnType<typeof selectDrillTargetsByWidgetRefSelector> = yield select(
        selectDrillTargetsByWidgetRefSelector,
    );

    if (!drillTargets?.availableDrillTargets) {
        // skip this part of the validation in case the drill targets are not available yet
        return {
            widget,
            invalidDrills: [],
        };
    }
    const displayForms = yield select(selectAllCatalogDisplayFormsMap);

    const widgetFilters: IFilter[] = yield call(query, queryWidgetFilters(widget.ref));
    const widgetAttributeFilters = widgetFilters.filter(isAttributeFilter);
    const sanitizedWidgetAttributeFilters = widgetAttributeFilters.map((filter) =>
        sanitizeAttributeFilter(filter, displayForms),
    );

    const dashboardFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );
    const dashboardAttributeFilters = dashboardFilters.map(dashboardAttributeFilterToAttributeFilter);
    const sanitizedDashboardAttributeFilters = dashboardAttributeFilters.map((filter) =>
        sanitizeAttributeFilter(filter, displayForms),
    );

    const attributeFilterConfigs: ReturnType<typeof selectAttributeFilterConfigsOverrides> = yield select(
        selectAttributeFilterConfigsOverrides,
    );

    return widget.drills.filter(isDrillToCustomUrl).reduce(
        (acc: IInvalidParamsInfo, drillDefinition) => {
            const ids = extractDisplayFormIdentifiers([drillDefinition]);

            const hasInvalidParam = ids.some((identifier) => {
                const displayForm = displayForms.get(identifier);
                if (!displayForm) {
                    // the drill as a whole is invalid, no reason to validate the parameters
                    return false;
                }

                return !isDisplayFormRelevantToDrill(
                    drillDefinition,
                    drillTargets.availableDrillTargets!,
                    displayForm,
                );
            });

            const dashboardFilterIds = extractDashboardFilterDisplayFormIdentifiers([drillDefinition]);
            const hasInvalidDashboardFilterParam = dashboardFilterIds.some((identifier) => {
                const displayForm = displayForms.get(identifier);
                if (!displayForm) {
                    // target display form no longer exists, no reason to validate the parameters
                    return true;
                }

                return (
                    !sanitizedDashboardAttributeFilters.some((filter) =>
                        areObjRefsEqual(filterObjRef(filter), identifier),
                    ) &&
                    !attributeFilterConfigs.some((config) => {
                        return config.displayAsLabel && areObjRefsEqual(config.displayAsLabel, identifier);
                    })
                );
            });

            const insightFilterIds = extractInsightFilterDisplayFormIdentifiers([drillDefinition]);
            const hasInvalidInsightFilterParam = insightFilterIds.some((identifier) => {
                const displayForm = displayForms.get(identifier);
                if (!displayForm) {
                    // target display form no longer exists, no reason to validate the parameters
                    return true;
                }

                return !sanitizedWidgetAttributeFilters.some((filter) =>
                    areObjRefsEqual(filterObjRef(filter), identifier),
                );
            });

            if (hasInvalidParam || hasInvalidDashboardFilterParam || hasInvalidInsightFilterParam) {
                acc.invalidDrills.push(drillDefinition);
            }

            return acc;
        },
        { widget, invalidDrills: [] },
    );
}

function sanitizeAttributeFilter(
    filter: IAttributeFilter,
    displayFormMap: ObjRefMap<IAttributeDisplayFormMetadataObject>,
) {
    const displayForm = displayFormMap.get(filterObjRef(filter));
    if (displayForm) {
        if (isNegativeAttributeFilter(filter)) {
            return {
                ...filter,
                negativeAttributeFilter: {
                    ...filter.negativeAttributeFilter,
                    displayForm: idRef(displayForm.id, "displayForm"),
                },
            };
        } else {
            return {
                ...filter,
                positiveAttributeFilter: {
                    ...filter.positiveAttributeFilter,
                    displayForm: idRef(displayForm.id, "displayForm"),
                },
            };
        }
    }
    return filter;
}
