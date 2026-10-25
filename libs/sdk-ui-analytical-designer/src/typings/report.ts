// (C) 2007-2026 GoodData Corporation

import { type IParameterWarning } from "../store/filter_bar/parameter_filter_service.js";
import { type IParameterFilter } from "../store/filter_bar/parameter_filter_types.js";

import { type IObjectMeta, type IVisualizationObjectContent } from "./bear/bearTypes.js";
import { type IDateDatasets } from "./datasets.js";
import { type IElement } from "./measure_filters.js";
import { type ICatalogEntries } from "./state_objects.js";

// VisualizationObject.IVisualizationObjectContent
export type IReportContent = IVisualizationObjectContent;

/**
 * The saved-report currency (`report.lastSavedObject`, the save/compare/export shape). The shape is
 * the bear visualization object, except that `content` is null and `meta` minimal until a report is
 * opened or saved (the initial seed in store/report/report_state.ts).
 */
export interface IReportVisualizationObject {
    meta: Partial<IObjectMeta>;
    content: IReportContent | null;
}

export interface IReport {
    visualizationObject: IReportVisualizationObject;
}

export interface ILoadedReportItems {
    allDateDatasets: IDateDatasets;
    availableDateDatasets: IDateDatasets;
    filterItems: {
        [uri: string]: {
            items: IElement[];
            total: number;
        };
    };
    itemCache: ICatalogEntries;
    parameterFilters: ReadonlyArray<IParameterFilter>;
    parameterWarnings: ReadonlyArray<IParameterWarning>;
}

/**
 * An item a date filter or an additional date filter references, but the workspace no longer has:
 * a date dataset's granularity that was disabled in the logical data model.
 */
export interface IMissingDateFilterItem {
    /** title of the date dataset the item belongs to */
    readonly datasetTitle: string;
    /** the missing granularity (`GDC.time.*`); absent when it cannot be told from the reference */
    readonly granularity?: string;
    /** the referenced identifier: the label of an additional date filter, the dataset of a date filter */
    readonly identifier: string;
}

export interface IErrorResponseData {
    traceId: string;
    httpStatus: number;
    rawData: IErrorRawData;
}

export interface IErrorRawData {
    [key: string]: unknown;
}
