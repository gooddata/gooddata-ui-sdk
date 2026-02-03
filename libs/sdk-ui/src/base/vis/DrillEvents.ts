// (C) 2007-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IDataView } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDescriptor,
    type IMeasureDescriptor,
    type IResultAttributeHeader,
    type ITotalDescriptor,
} from "@gooddata/sdk-model";

import {
    type ChartElementType,
    type ChartType,
    type HeadlineElementType,
    type HeadlineType,
    type TableElementType,
    type TableType,
    type VisElementType,
    type VisType,
    type XirrType,
} from "./visualizationTypes.js";
import { type IHeaderPredicate, isHeaderPredicate } from "../headerMatching/HeaderPredicate.js";

/**
 * Drillable item reference or predicate that enables insight / kpi drilling if it matches some attribute or measure of the insight / kpi.
 *
 * @remarks
 * You can use {@link @gooddata/sdk-ui#HeaderPredicates} factory functions to create predicates,
 * or specify reference to the identifier / uri of the target attribute / measure using {@link @gooddata/sdk-ui#IDrillableItem} definition.
 *
 * @public
 */
export type ExplicitDrill = IDrillableItem | IHeaderPredicate;

/**
 * @public
 */
export function isExplicitDrill(obj: unknown): obj is ExplicitDrill {
    return [isDrillableItem, isHeaderPredicate].some((pred) => pred(obj));
}

/**
 * @public
 */
export interface IDrillableItemUri {
    uri: string;
}

/**
 * @public
 */
export interface IDrillableItemIdentifier {
    identifier: string;
}

/**
 * @public
 */
export type IDrillableItem =
    | IDrillableItemUri
    | IDrillableItemIdentifier
    | (IDrillableItemUri & IDrillableItemIdentifier);

/**
 * @public
 */
export function isDrillableItemUri(item: unknown): item is IDrillableItemUri {
    return !isEmpty(item) && (item as IDrillableItemUri).uri !== undefined;
}

/**
 * @public
 */
export function isDrillableItemIdentifier(item: unknown): item is IDrillableItemIdentifier {
    return !isEmpty(item) && (item as IDrillableItemIdentifier).identifier !== undefined;
}

/**
 * @public
 */
export function isDrillableItem(item: unknown): item is IDrillableItem {
    return [isDrillableItemUri, isDrillableItemIdentifier].some((pred) => pred(item));
}

/**
 * @public
 */
export type IDrillEventCallback = (event: IDrillEvent) => void | boolean;

/**
 * @public
 */
export interface IDrillIntersectionAttributeItem extends IAttributeDescriptor, IResultAttributeHeader {}

/**
 * @public
 */
export function isDrillIntersectionAttributeItem(
    header: DrillEventIntersectionElementHeader,
): header is IDrillIntersectionAttributeItem {
    return !isEmpty(header) && (header as IDrillIntersectionAttributeItem).attributeHeaderItem !== undefined;
}

/**
 * @public
 */
export function isDrillIntersectionDateAttributeItem(
    header: DrillEventIntersectionElementHeader,
): header is IDrillIntersectionAttributeItem {
    return (
        !isEmpty(header) &&
        (header as IDrillIntersectionAttributeItem).attributeHeaderItem !== undefined &&
        Boolean((header as IDrillIntersectionAttributeItem).attributeHeader.granularity)
    );
}

/**
 * @public
 */
export type DrillEventIntersectionElementHeader =
    | IAttributeDescriptor
    | IMeasureDescriptor
    | ITotalDescriptor
    | IDrillIntersectionAttributeItem;

/**
 * @public
 */
export interface IDrillEventIntersectionElement {
    header: DrillEventIntersectionElementHeader;
}

/**
 * Drill context for table
 *
 * @public
 */
export interface IDrillEventContextTable {
    type: TableType;
    element: TableElementType;
    columnIndex: number;
    rowIndex: number;
    row: any[];
    intersection: IDrillEventIntersectionElement[];
}

/**
 * Drill context for headline
 *
 * @public
 */
export interface IDrillEventContextHeadline {
    type: HeadlineType;
    element: HeadlineElementType;
    value: string | null;
    intersection: IDrillEventIntersectionElement[];
}

/**
 * Drill context for XIRR
 *
 * @public
 */
export interface IDrillEventContextXirr {
    type: XirrType;
    element: HeadlineElementType; // XIRR uses Headline internally, so its drill context is the same as that of Headline
    value: string | null;
    intersection: IDrillEventIntersectionElement[];
}

/**
 * Drill context for pointy-charts
 *
 * @public
 */
export interface IDrillEventContextPoint {
    type: ChartType;
    element: ChartElementType;
    elementChartType?: ChartType;
    x?: number;
    y?: number;
    z?: number;
    seriesIndex?: number;
    pointIndex?: number;
    chartId?: string;
    value?: string;
    intersection: IDrillEventIntersectionElement[];
}

/**
 * Drill context for headline
 *
 * @public
 */
export interface IDrillPoint {
    x: number;
    y: number | null;
    intersection: IDrillEventIntersectionElement[];
    type?: ChartType;
}

/**
 * Drill context for chart element group (multiple series + click on axis value) where
 * every point has own intersection.
 *
 * @public
 */
export interface IDrillEventContextGroup {
    type: ChartType;
    element: ChartElementType;
    points: IDrillPoint[];
}

/**
 * Drill context for all visualization type.
 * @public
 */
export interface IDrillEventContext {
    type: VisType; // type of visualization
    element: VisElementType; // type of visualization element drilled
    x?: number; // chart x coordinate (if supported)
    y?: number | null; // chart y coordinate (if supported)
    z?: number; // chart z coordinate (if supported)
    seriesIndex?: number; // index of series within the chart (if supported)
    pointIndex?: number; // index of point within the series (if supported)
    chartId?: string; // unique chart instance id (if available)
    columnIndex?: number;
    rowIndex?: number;
    row?: any[]; // table row data of the drilled row
    value?: string | null; // cell or element value drilled

    // some drill headers that are relevant for current drill element
    intersection?: IDrillEventIntersectionElement[];
    // A collection of chart series points (if available)
    points?: IDrillPoint[];
}

/**
 * @public
 */
export interface IDrillEvent {
    dataView: IDataView;
    drillContext: IDrillEventContext;
    chartX?: number;
    chartY?: number;
    target?: HTMLElement;
}

/**
 * @public
 */
export interface IHighchartsParentTick {
    leaves: number;
    startAt: number;
    label: any;
}

/**
 * @public
 */
export interface IHighchartsCategoriesTree {
    tick: IHighchartsParentTick;
}

/**
 * @public
 */
export type OnFiredDrillEvent = IDrillEventCallback;

/**
 * @public
 */
export interface IDrillConfig {
    dataView: IDataView;
    onDrill: OnFiredDrillEvent;
}
