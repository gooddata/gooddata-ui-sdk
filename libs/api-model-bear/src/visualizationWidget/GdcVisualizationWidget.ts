// (C) 2020-2022 GoodData Corporation
import isEmpty from "lodash/fp/isEmpty.js";
import has from "lodash/has.js";
import { Identifier } from "../aliases.js";
import { IObjectMeta } from "../meta/GdcMetadata.js";
import {
    IAttributeFilterReference,
    IDateFilterReference,
} from "../extendedDateFilters/GdcExtendedDateFilters.js";
import {
    ILocalIdentifierQualifier,
    IObjUriQualifier,
    IReferenceItems,
} from "../visualizationObject/GdcVisualizationObject.js";

/**
 * @public
 */
export interface IVisualizationWidget {
    meta: IObjectMeta;
    content: {
        visualization: string;
        dateDataSet?: string;
        ignoreDashboardFilters: Array<IDateFilterReference | IAttributeFilterReference>;
        drills?: IDrillDefinition[];
        properties?: string;
        references?: IReferenceItems;
        configuration?: IVisualizationWidgetConfiguration;
    };
}

/**
 * @public
 */
export interface IWrappedVisualizationWidget {
    visualizationWidget: IVisualizationWidget;
}

/**
 * @public
 */
export type IDrillDefinition =
    | IDrillToVisualization
    | IDrillToDashboard
    | IDrillToCustomUrl
    | IDrillToAttributeUrl;

/**
 * @public
 */
export type DrillFromType = IDrillFromMeasure | IDrillFromAttribute;

/**
 * @public
 */
export interface IDrillFromMeasure {
    drillFromMeasure: ILocalIdentifierQualifier;
}

/**
 * @public
 */
export interface IDrillFromAttribute {
    drillFromAttribute: ILocalIdentifierQualifier;
}

/**
 * @public
 */
export interface IDrillToVisualization {
    drillToVisualization: {
        target: "pop-up";
        from: DrillFromType;
        toVisualization: IObjUriQualifier;
    };
}

/**
 * @public
 */
export interface IDrillToDashboard {
    drillToDashboard: {
        target: "in-place";
        from: DrillFromType;
        toDashboard?: Identifier;
    };
}

/**
 * @public
 */
export interface IDrillToCustomUrl {
    drillToCustomUrl: {
        target: "new-window";
        from: DrillFromType;
        customUrl: string;
    };
}

/**
 * @public
 */
export interface IDrillToAttributeUrl {
    drillToAttributeUrl: {
        target: "new-window";
        from: DrillFromType;
        insightAttributeDisplayForm: IObjUriQualifier;
        drillToAttributeDisplayForm: IObjUriQualifier;
    };
}

/**
 * @public
 */
export interface IVisualizationWidgetConfiguration {
    hideTitle?: boolean;
    description?: IVisualizationWidgetDescriptionConfiguration;
}

/**
 * @public
 */
export interface IVisualizationWidgetDescriptionConfiguration {
    visible: boolean;
    source: VisualizatioWidgetDescriptionSourceType;
    includeMetrics: boolean;
}

/**
 * @public
 */
export type VisualizatioWidgetDescriptionSourceType = "widget" | "insight";

/**
 * @public
 */
export function isDrillToVisualization(obj: unknown): obj is IDrillToVisualization {
    return !isEmpty(obj) && !!(obj as IDrillToVisualization).drillToVisualization;
}

/**
 * @public
 */
export function isDrillToDashboard(obj: unknown): obj is IDrillToDashboard {
    return !isEmpty(obj) && !!(obj as IDrillToDashboard).drillToDashboard;
}

/**
 * @public
 */
export function isDrillToCustomUrl(obj: unknown): obj is IDrillToCustomUrl {
    return !isEmpty(obj) && !!(obj as IDrillToCustomUrl).drillToCustomUrl;
}

/**
 * @public
 */
export function isDrillToAttributeUrl(obj: unknown): obj is IDrillToAttributeUrl {
    return !isEmpty(obj) && !!(obj as IDrillToAttributeUrl).drillToAttributeUrl;
}

/**
 * @public
 */
export function isDrillFromMeasure(obj: DrillFromType): obj is IDrillFromMeasure {
    return !isEmpty(obj) && !!(obj as IDrillFromMeasure).drillFromMeasure;
}

/**
 * @public
 */
export function isDrillFromAttribute(obj: DrillFromType): obj is IDrillFromAttribute {
    return !isEmpty(obj) && !!(obj as IDrillFromAttribute).drillFromAttribute;
}

/**
 * @public
 */
export function isVisualizationWidget(obj: unknown): obj is IVisualizationWidget {
    return !isEmpty(obj) && (obj as IVisualizationWidget).meta.category === "visualizationWidget";
}

/**
 * @public
 */
export function isWrappedVisualizationWidget(obj: unknown): obj is IWrappedVisualizationWidget {
    // eslint-disable-next-line no-prototype-builtins
    return !isEmpty(obj) && has(obj, "visualizationWidget");
}
