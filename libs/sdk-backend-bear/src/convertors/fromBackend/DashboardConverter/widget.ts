// (C) 2019-2020 GoodData Corporation

import { GdcVisualizationWidget, GdcKpi, GdcExtendedDateFilters } from "@gooddata/api-model-bear";
import { uriRef } from "@gooddata/sdk-model";
import {
    IWidget,
    IDashboardFilterReference,
    IDashboardDateFilterReference,
    IDashboardAttributeFilterReference,
} from "@gooddata/sdk-backend-spi";
import { convertVisualizationWidgetDrill, convertKpiDrill } from "./drills";
import { convertReferencesToUris } from "../ReferenceConverter";
import { deserializeProperties } from "../PropertiesConverter";

export const convertFilterReference = (
    filterReference:
        | GdcExtendedDateFilters.IDateFilterReference
        | GdcExtendedDateFilters.IAttributeFilterReference,
): IDashboardFilterReference => {
    if (GdcExtendedDateFilters.isDateFilterReference(filterReference)) {
        const convertedDateFilterReference: IDashboardDateFilterReference = {
            type: "dateFilterReference",
            dataSet: uriRef(filterReference.dateFilterReference.dataSet),
        };
        return convertedDateFilterReference;
    }

    const convertedAttributeFilterReference: IDashboardAttributeFilterReference = {
        type: "attributeFilterReference",
        displayForm: uriRef(filterReference.attributeFilterReference.displayForm),
    };

    return convertedAttributeFilterReference;
};

export const convertVisualizationWidget = (
    visualizationWidget: GdcVisualizationWidget.IWrappedVisualizationWidget,
): IWidget => {
    const {
        visualizationWidget: {
            content: { visualization, ignoreDashboardFilters, dateDataSet, drills, references, properties },
            meta: { identifier, uri, title, summary },
        },
    } = visualizationWidget;

    const { properties: convertedProperties } = convertReferencesToUris({
        properties: deserializeProperties(properties),
        references: references || {},
    });

    const convertedWidget: IWidget = {
        type: "insight",
        ref: uriRef(uri),
        identifier,
        uri,
        title,
        description: summary,
        insight: uriRef(visualization),
        dateDataSet: dateDataSet ? uriRef(dateDataSet) : undefined,
        ignoreDashboardFilters: ignoreDashboardFilters
            ? ignoreDashboardFilters.map(convertFilterReference)
            : [],
        drills: drills ? drills.map(convertVisualizationWidgetDrill) : [],
        properties: convertedProperties,
    };

    return convertedWidget;
};

export const convertKpi = (kpi: GdcKpi.IWrappedKPI): IWidget => {
    const {
        kpi: {
            content: { dateDataSet, ignoreDashboardFilters, drillTo },
            meta: { identifier, uri, title, summary },
        },
    } = kpi;

    const convertedWidget: IWidget = {
        type: "kpi",
        ref: uriRef(uri),
        identifier,
        uri,
        title,
        description: summary,
        dateDataSet: dateDataSet ? uriRef(dateDataSet) : undefined,
        ignoreDashboardFilters: ignoreDashboardFilters
            ? ignoreDashboardFilters.map(convertFilterReference)
            : [],
        drills: drillTo ? [convertKpiDrill(kpi)] : [],
    };

    return convertedWidget;
};

export const convertWidget = (
    widget: GdcKpi.IWrappedKPI | GdcVisualizationWidget.IWrappedVisualizationWidget,
): IWidget => {
    if (GdcKpi.isWrappedKpi(widget)) {
        return convertKpi(widget);
    }
    return convertVisualizationWidget(widget);
};
