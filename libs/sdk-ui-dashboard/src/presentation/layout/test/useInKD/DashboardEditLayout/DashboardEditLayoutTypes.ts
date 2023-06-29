// (C) 2019-2022 GoodData Corporation
import { ObjRef, IDashboardLayout, IDashboardLayoutSection, IDashboardLayoutItem } from "@gooddata/sdk-model";

import { DropZoneType, IDragZoneWidget } from "./LayoutTypes.js";

export type DashboardEditLayoutContentType =
    | "widget"
    | "widgetDropzone"
    | "widgetDropzoneHotspot"
    | "widgetKpiPlaceholder"
    | "widgetNewInsightPlaceholder";

export interface IDashboardEditLayoutContentBase {
    /**
     * Dashboard edit layout content type - widget or drag and drop widget.
     */
    type: DashboardEditLayoutContentType;

    /**
     * Persisted widget identifier/uri, or widget temporary identifier
     * for widgets added in edit mode (or custom drag and drop widgets).
     */
    ref: ObjRef;
}

export interface IDashboardEditLayoutContentWidget extends IDashboardEditLayoutContentBase {
    /**
     * Type
     */
    type: "widget";
}

export interface IDashboardEditLayoutContentWidgetDropzone extends IDashboardEditLayoutContentBase {
    /**
     * Type
     */
    type: "widgetDropzone";

    /**
     * Drag and drop widget details
     */
    dragZoneWidget: IDragZoneWidget;
}

export interface IDashboardEditLayoutContentWidgetDropzoneHotspot extends IDashboardEditLayoutContentBase {
    /**
     * Type
     */
    type: "widgetDropzoneHotspot";

    /**
     * Persisted widget identifier/uri, or widget temporary identifier
     * for widgets added in edit mode.
     */
    widgetRef: ObjRef;

    /**
     * Drop zone position (prev / next)
     */
    dropZoneType: DropZoneType;
}

export interface IDashboardEditLayoutContentWidgetKpiPlaceholder extends IDashboardEditLayoutContentBase {
    /**
     * Type
     */
    type: "widgetKpiPlaceholder";
}

export interface IDashboardEditLayoutContentWidgetNewInsightPlaceholder
    extends IDashboardEditLayoutContentBase {
    /**
     * Type
     */
    type: "widgetNewInsightPlaceholder";
}

export type IDashboardEditLayoutContent =
    | IDashboardEditLayoutContentWidget
    | IDashboardEditLayoutContentWidgetDropzone
    | IDashboardEditLayoutContentWidgetDropzoneHotspot
    | IDashboardEditLayoutContentWidgetKpiPlaceholder
    | IDashboardEditLayoutContentWidgetNewInsightPlaceholder;

export type IDashboardEditLayoutItem = IDashboardLayoutItem<IDashboardEditLayoutContent>;

export type IDashboardEditLayoutSection = IDashboardLayoutSection<IDashboardEditLayoutContent>;

export type IDashboardEditLayout = IDashboardLayout<IDashboardEditLayoutContent>;
