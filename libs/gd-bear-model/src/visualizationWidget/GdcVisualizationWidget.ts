// (C) 2020 GoodData Corporation
import isEmpty from "lodash/fp/isEmpty";
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
        };
    }

    export interface IWrappedVisualizationWidget {
        visualizationWidget: IVisualizationWidget;
    }

    export type IDrillDefinition = IDrillToVisualization | IDrillToDashboard;

    export interface IDrillToVisualization {
        drillToVisualization: {
            target: "pop-up";
            from: {
                drillFromMeasure: GdcVisualizationObject.ILocalIdentifierQualifier;
            };
            toVisualization: GdcVisualizationObject.IObjUriQualifier;
        };
    }

    export interface IDrillToDashboard {
        drillToDashboard: {
            target: "in-place";
            from: {
                drillFromMeasure: GdcVisualizationObject.ILocalIdentifierQualifier;
            };
            toDashboard: Identifier;
        };
    }

    export function isDrillToVisualization(obj: any): obj is IDrillToVisualization {
        return !isEmpty(obj) && !!(obj as IDrillToVisualization).drillToVisualization;
    }

    export function isDrillToDashboard(obj: any): obj is IDrillToDashboard {
        return !isEmpty(obj) && !!(obj as IDrillToDashboard).drillToDashboard;
    }

    export function isVisualizationWidget(obj: any): obj is IVisualizationWidget {
        return !isEmpty(obj) && (obj as IVisualizationWidget).meta.category === "visualizationWidget";
    }

    export function isWrappedVisualizationWidget(obj: any): obj is IWrappedVisualizationWidget {
        return !isEmpty(obj) && obj.hasOwnProperty("visualizationWidget");
    }
}
