// (C) 2019-2022 GoodData Corporation

import { GdcVisualizationWidget, GdcKpi, GdcExtendedDateFilters } from "@gooddata/api-model-bear";
import { uriRef, IDashboardFilterReference, IWidget } from "@gooddata/sdk-model";
import { convertVisualizationWidgetDrill, convertKpiDrill } from "./drills.js";
import { convertReferencesToUris } from "../ReferenceConverter.js";
import { deserializeProperties } from "../PropertiesConverter.js";

export const convertFilterReference = (
    filterReference:
        | GdcExtendedDateFilters.IDateFilterReference
        | GdcExtendedDateFilters.IAttributeFilterReference,
): IDashboardFilterReference => {
    if (GdcExtendedDateFilters.isDateFilterReference(filterReference)) {
        return {
            type: "dateFilterReference",
            dataSet: uriRef(filterReference.dateFilterReference.dataSet),
        };
    }

    return {
        type: "attributeFilterReference",
        displayForm: uriRef(filterReference.attributeFilterReference.displayForm),
    };
};

export const convertVisualizationWidget = (
    visualizationWidget: GdcVisualizationWidget.IWrappedVisualizationWidget,
): IWidget => {
    const {
        visualizationWidget: {
            content: {
                visualization,
                ignoreDashboardFilters,
                dateDataSet,
                drills,
                references,
                properties,
                configuration,
            },
            meta: { identifier, uri, title, summary },
        },
    } = visualizationWidget;

    const { properties: convertedProperties } = convertReferencesToUris({
        properties: deserializeProperties(properties),
        references: references || {},
    });

    return {
        type: "insight",
        ref: uriRef(uri!),
        identifier: identifier!,
        uri: uri!,
        title,
        description: summary!,
        insight: uriRef(visualization),
        dateDataSet: dateDataSet ? uriRef(dateDataSet) : undefined,
        ignoreDashboardFilters: ignoreDashboardFilters
            ? ignoreDashboardFilters.map(convertFilterReference)
            : [],
        drills: drills ? drills.map(convertVisualizationWidgetDrill) : [],
        properties: convertedProperties,
        ...(configuration ? { configuration } : {}),
    };
};

export const convertKpi = (kpi: GdcKpi.IWrappedKPI): IWidget => {
    const {
        kpi: {
            content,
            content: { dateDataSet, ignoreDashboardFilters, drillTo, configuration },
            meta: { identifier, uri, title, summary },
        },
    } = kpi;

    return {
        type: "kpi",
        ref: uriRef(uri!),
        identifier: identifier!,
        uri: uri!,
        title,
        description: summary!,
        dateDataSet: dateDataSet ? uriRef(dateDataSet) : undefined,
        ignoreDashboardFilters: ignoreDashboardFilters
            ? ignoreDashboardFilters.map(convertFilterReference)
            : [],
        drills: drillTo ? [convertKpiDrill(kpi)] : [],
        ...(configuration ? { configuration } : {}),
        kpi: GdcKpi.isKpiContentWithoutComparison(content)
            ? {
                  comparisonType: content.comparisonType,
                  metric: uriRef(content.metric),
              }
            : {
                  comparisonType: content.comparisonType,
                  comparisonDirection: content.comparisonDirection,
                  metric: uriRef(content.metric),
              },
    };
};

export const convertWidget = (
    widget: GdcKpi.IWrappedKPI | GdcVisualizationWidget.IWrappedVisualizationWidget,
): IWidget => {
    if (GdcKpi.isWrappedKpi(widget)) {
        return convertKpi(widget);
    }
    return convertVisualizationWidget(widget);
};
