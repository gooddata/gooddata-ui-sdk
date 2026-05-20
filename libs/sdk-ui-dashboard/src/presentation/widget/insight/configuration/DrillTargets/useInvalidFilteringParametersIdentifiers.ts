// (C) 2020-2026 GoodData Corporation

import { useMemo } from "react";

import { uniq } from "lodash-es";

import {
    type IAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardMeasureValueFilter,
    type IMeasureValueFilter,
    areObjRefsEqual,
    filterObjRef,
    idRef,
} from "@gooddata/sdk-model";
import {
    getDashboardAttributeFilterPlaceholdersFromUrl,
    getDashboardMeasureValueFilterPlaceholdersFromUrl,
    getInsightAttributeFilterPlaceholdersFromUrl,
    getInsightMeasureValueFilterPlaceholdersFromUrl,
} from "@gooddata/sdk-model/internal";

import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import {
    selectAllCatalogDisplayFormsMap,
    selectAllCatalogMeasuresMap,
} from "../../../../../model/store/catalog/catalogSelectors.js";
import {
    dashboardMeasureValueFilterMatchesIdentifier,
    insightMeasureValueFilterMatchesIdentifier,
} from "../../../../../model/utils/measureValueFilterUtils.js";
import { type UrlDrillTarget, isDrillToCustomUrlConfig } from "../../../../drill/types.js";

export function useInvalidFilteringParametersIdentifiers(
    urlDrillTarget: UrlDrillTarget | undefined,
    insightFilters: IAttributeFilter[] | undefined,
    dashboardFilters: IAttributeFilter[] | undefined,
    dashboardMeasureValueFilters: IDashboardMeasureValueFilter[] | undefined,
    insightMeasureValueFilters: IMeasureValueFilter[] | undefined,
    enableInsightMeasureValueFilters: boolean,
    attributeFilterConfigs: IDashboardAttributeFilterConfig[] | undefined,
) {
    const displayForms = useDashboardSelector(selectAllCatalogDisplayFormsMap);
    const measures = useDashboardSelector(selectAllCatalogMeasuresMap);

    return useMemo(() => {
        if (isDrillToCustomUrlConfig(urlDrillTarget)) {
            const dashboardAttributeFilterParameters = getDashboardAttributeFilterPlaceholdersFromUrl(
                urlDrillTarget.customUrl,
            );
            const insightAttributeFilterParameters = getInsightAttributeFilterPlaceholdersFromUrl(
                urlDrillTarget.customUrl,
            );
            const dashboardMeasureValueFilterParameters = getDashboardMeasureValueFilterPlaceholdersFromUrl(
                urlDrillTarget.customUrl,
            );
            const insightMeasureValueFilterParameters = getInsightMeasureValueFilterPlaceholdersFromUrl(
                urlDrillTarget.customUrl,
            );

            const invalidDashboardParameters = dashboardAttributeFilterParameters
                .filter(({ identifier }) => {
                    // parameter is invalid if either it points to display form that no longer exists
                    const relevantDf = displayForms.get(idRef(identifier, "displayForm"));
                    if (!relevantDf) {
                        return true;
                    }

                    return (
                        !dashboardFilters?.some((filter) => {
                            return areObjRefsEqual(filterObjRef(filter), idRef(identifier, "displayForm"));
                        }) &&
                        !attributeFilterConfigs?.some((config) => {
                            return (
                                config.displayAsLabel &&
                                areObjRefsEqual(config.displayAsLabel, idRef(identifier, "displayForm"))
                            );
                        })
                    );
                })
                .map(({ identifier }) => identifier);

            const invalidInsightParameters = insightAttributeFilterParameters
                .filter(({ identifier }) => {
                    // parameter is invalid if either it points to display form that no longer exists
                    const relevantDf = displayForms.get(idRef(identifier, "displayForm"));
                    if (!relevantDf) {
                        return true;
                    }

                    return !insightFilters?.some((filter) => {
                        return areObjRefsEqual(filterObjRef(filter), idRef(identifier, "displayForm"));
                    });
                })
                .map(({ identifier }) => identifier);

            const invalidDashboardMvfParameters = dashboardMeasureValueFilterParameters
                .filter(({ identifier }) => {
                    return !dashboardMeasureValueFilters?.some((filter) =>
                        dashboardMeasureValueFilterMatchesIdentifier(
                            filter.dashboardMeasureValueFilter.measure,
                            identifier,
                            measures,
                        ),
                    );
                })
                .map(({ identifier }) => identifier);

            const invalidInsightMvfParameters = enableInsightMeasureValueFilters
                ? insightMeasureValueFilterParameters
                      .filter(({ identifier }) => {
                          return !insightMeasureValueFilters?.some((filter) =>
                              insightMeasureValueFilterMatchesIdentifier(
                                  filter.measureValueFilter.measure,
                                  identifier,
                              ),
                          );
                      })
                      .map(({ identifier }) => identifier)
                : insightMeasureValueFilterParameters.map(({ identifier }) => identifier);

            return uniq([
                ...invalidDashboardParameters,
                ...invalidInsightParameters,
                ...invalidDashboardMvfParameters,
                ...invalidInsightMvfParameters,
            ]);
        }
        return [];
    }, [
        displayForms,
        measures,
        urlDrillTarget,
        insightFilters,
        dashboardFilters,
        dashboardMeasureValueFilters,
        insightMeasureValueFilters,
        enableInsightMeasureValueFilters,
        attributeFilterConfigs,
    ]);
}
