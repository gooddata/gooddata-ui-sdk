// (C) 2020 GoodData Corporation
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

    export interface IDrillFromMeasure {
        drillFromMeasure: GdcVisualizationObject.ILocalIdentifierQualifier;
    }

    export interface IDrillToVisualization {
        drillToVisualization: {
            target: "pop-up";
            from: IDrillFromMeasure;
            toVisualization: GdcVisualizationObject.IObjUriQualifier;
        };
    }

    export interface IDrillToDashboard {
        drillToDashboard: {
            target: "in-place";
            from: IDrillFromMeasure;
            toDashboard: Identifier;
        };
    }

    export interface IDrillToCustomUrl {
        drillToCustomUrl: {
            target: "new-window";
            from: IDrillFromMeasure;
            customUrl: string;
        };
    }

    export interface IDrillToAttributeUrl {
        drillToAttributeUrl: {
            target: "new-window";
            from: IDrillFromMeasure;
            insightAttributeDisplayForm: GdcVisualizationObject.IObjUriQualifier;
            drillToAttributeDisplayForm: GdcVisualizationObject.IObjUriQualifier;
        };
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

    export function isVisualizationWidget(obj: unknown): obj is IVisualizationWidget {
        return !isEmpty(obj) && (obj as IVisualizationWidget).meta.category === "visualizationWidget";
    }

    export function isWrappedVisualizationWidget(obj: unknown): obj is IWrappedVisualizationWidget {
        // eslint-disable-next-line no-prototype-builtins
        return !isEmpty(obj) && has(obj, "visualizationWidget");
    }
}
