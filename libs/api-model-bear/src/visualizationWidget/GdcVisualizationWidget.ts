// (C) 2020-2022 GoodData Corporation
import isEmpty from "lodash/fp/isEmpty";
import has from "lodash/has";
import { GdcMetadata } from "../meta/GdcMetadata";
import { GdcExtendedDateFilters } from "../extendedDateFilters/GdcExtendedDateFilters";
import { GdcVisualizationObject } from "../visualizationObject/GdcVisualizationObject";
import { Identifier } from "../aliases";

/**
 * @public
 */
export namespace GdcVisualizationWidget {
    export interface IVisualizationWidget {
        meta: GdcMetadata.IObjectMeta;
        content: {
            visualization: string;
            dateDataSet?: string;
            ignoreDashboardFilters: Array<
                GdcExtendedDateFilters.IDateFilterReference | GdcExtendedDateFilters.IAttributeFilterReference
            >;
            drills?: IDrillDefinition[];
            properties?: string;
            references?: GdcVisualizationObject.IReferenceItems;
            configuration?: IVisualizationWidgetConfiguration;
        };
    }

    export interface IWrappedVisualizationWidget {
        visualizationWidget: IVisualizationWidget;
    }

    export type IDrillDefinition =
        | IDrillToVisualization
        | IDrillToDashboard
        | IDrillToCustomUrl
        | IDrillToAttributeUrl;

    export type DrillFromType = IDrillFromMeasure | IDrillFromAttribute;

    export interface IDrillFromMeasure {
        drillFromMeasure: GdcVisualizationObject.ILocalIdentifierQualifier;
    }

    export interface IDrillFromAttribute {
        drillFromAttribute: GdcVisualizationObject.ILocalIdentifierQualifier;
    }

    export interface IDrillToVisualization {
        drillToVisualization: {
            target: "pop-up";
            from: DrillFromType;
            toVisualization: GdcVisualizationObject.IObjUriQualifier;
        };
    }

    export interface IDrillToDashboard {
        drillToDashboard: {
            target: "in-place";
            from: DrillFromType;
            toDashboard?: Identifier;
        };
    }

    export interface IDrillToCustomUrl {
        drillToCustomUrl: {
            target: "new-window";
            from: DrillFromType;
            customUrl: string;
        };
    }

    export interface IDrillToAttributeUrl {
        drillToAttributeUrl: {
            target: "new-window";
            from: DrillFromType;
            insightAttributeDisplayForm: GdcVisualizationObject.IObjUriQualifier;
            drillToAttributeDisplayForm: GdcVisualizationObject.IObjUriQualifier;
        };
    }

    export interface IVisualizationWidgetConfiguration {
        hideTitle: boolean;
    }

    export function isDrillToVisualization(obj: unknown): obj is IDrillToVisualization {
        return !isEmpty(obj) && !!(obj as IDrillToVisualization).drillToVisualization;
    }

    export function isDrillToDashboard(obj: unknown): obj is IDrillToDashboard {
        return !isEmpty(obj) && !!(obj as IDrillToDashboard).drillToDashboard;
    }

    export function isDrillToCustomUrl(obj: unknown): obj is IDrillToCustomUrl {
        return !isEmpty(obj) && !!(obj as IDrillToCustomUrl).drillToCustomUrl;
    }

    export function isDrillToAttributeUrl(obj: unknown): obj is IDrillToAttributeUrl {
        return !isEmpty(obj) && !!(obj as IDrillToAttributeUrl).drillToAttributeUrl;
    }

    export function isDrillFromMeasure(obj: DrillFromType): obj is IDrillFromMeasure {
        return !isEmpty(obj) && !!(obj as IDrillFromMeasure).drillFromMeasure;
    }

    export function isDrillFromAttribute(obj: DrillFromType): obj is IDrillFromAttribute {
        return !isEmpty(obj) && !!(obj as IDrillFromAttribute).drillFromAttribute;
    }

    export function isVisualizationWidget(obj: unknown): obj is IVisualizationWidget {
        return !isEmpty(obj) && (obj as IVisualizationWidget).meta.category === "visualizationWidget";
    }

    export function isWrappedVisualizationWidget(obj: unknown): obj is IWrappedVisualizationWidget {
        // eslint-disable-next-line no-prototype-builtins
        return !isEmpty(obj) && has(obj, "visualizationWidget");
    }
}
