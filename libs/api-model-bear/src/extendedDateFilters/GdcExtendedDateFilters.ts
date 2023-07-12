// (C) 2019-2022 GoodData Corporation
//import { GdcMetadata } from "../meta/index.js";
import isEmpty from "lodash/isEmpty.js";
import { IObjectMeta } from "../meta/GdcMetadata.js";
import { DateString } from "../base/GdcTypes.js";

/**
 * Generated unique identification string that is not subject to change during project copying.
 * @public
 */
export type GUID = string;

/**
 * @public
 */
export type RelativeGranularityOffset = number;

/**
 * @public
 */
export type DateFilterGranularity =
    | "GDC.time.minute"
    | "GDC.time.hour"
    | "GDC.time.date"
    | "GDC.time.week_us"
    | "GDC.time.month"
    | "GDC.time.quarter"
    | "GDC.time.year";

/**
 * @public
 */
export interface IDateFilterBase {
    localIdentifier: GUID;
    name?: string;
    visible: boolean;
}

/**
 * @public
 */
export type IDateFilterAllTime = IDateFilterBase;

/**
 * @public
 */
export type IDateFilterAbsoluteForm = IDateFilterBase;

/**
 * @public
 */
export interface IDateFilterRelativeForm extends IDateFilterBase {
    granularities: DateFilterGranularity[];
}

/**
 * @public
 */
export interface IDateFilterAbsolutePreset extends IDateFilterBase {
    from: DateString;
    to: DateString;
}

/**
 * @public
 */
export interface IDateFilterRelativePreset extends IDateFilterBase {
    from: number;
    to: number;
    granularity: DateFilterGranularity;
}

/**
 * @public
 */
export interface IDateFilterConfigContent {
    selectedOption: GUID;
    allTime?: IDateFilterAllTime;
    absoluteForm?: IDateFilterAbsoluteForm;
    relativeForm?: IDateFilterRelativeForm;
    absolutePresets?: IDateFilterAbsolutePreset[];
    relativePresets?: IDateFilterRelativePreset[];
}

/**
 * @public
 */
export interface IDateFilterConfig {
    meta: IObjectMeta;
    content: IDateFilterConfigContent;
}

/**
 * @public
 */
export interface IWrappedDateFilterConfig {
    dateFilterConfig: IDateFilterConfig;
}

/**
 * @public
 */
export interface IDateFilterReference {
    dateFilterReference: {
        dataSet: string;
    };
}

/**
 * @public
 */
export const isDateFilterReference = (obj: unknown): obj is IDateFilterReference =>
    !isEmpty(obj) && !!(obj as IDateFilterReference).dateFilterReference;

/**
 * @public
 */
export interface IAttributeFilterReference {
    attributeFilterReference: {
        displayForm: string;
    };
}

/**
 * @public
 */
export const isAttributeFilterReference = (obj: unknown): obj is IAttributeFilterReference =>
    !isEmpty(obj) && !!(obj as IAttributeFilterReference).attributeFilterReference;
