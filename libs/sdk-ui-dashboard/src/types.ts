// (C) 2007-2025 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import {
    IAbsoluteDateFilter,
    IInsight,
    INegativeAttributeFilter,
    IPositiveAttributeFilter,
    IRelativeDateFilter,
    isAttributeFilter,
    isDateFilter,
    LocalIdRef,
    ObjRef,
    DrillDefinition,
    IWidget,
    ShareStatus,
    IAccessGrantee,
} from "@gooddata/sdk-model";
import { IDrillEvent, OnFiredDrillEvent } from "@gooddata/sdk-ui";
import { DateFilterConfigValidationResult } from "./_staging/dateFilterConfig/validation.js";

// TODO consider adding FilterContextItem to this union so that user can use either sdk-model or FilterContextItem variants of the filters
/**
 * Supported dashboard filter type.
 * @public
 */
export type IDashboardFilter =
    | IAbsoluteDateFilter
    | IRelativeDateFilter
    | IPositiveAttributeFilter
    | INegativeAttributeFilter;

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardFilter}.
 *
 * @alpha
 */
export function isDashboardFilter(obj: unknown): obj is IDashboardFilter {
    return isAttributeFilter(obj) || isDateFilter(obj);
}

/**
 * Supported dashboard drill definitions.
 *
 * @beta
 */
export type DashboardDrillDefinition = DrillDefinition | IDrillDownDefinition;

/**
 * A {@link @gooddata/sdk-ui#IDrillEvent} with added information about the drill event specific to the Dashboard context.
 * @beta
 */
export interface IDashboardDrillEvent extends IDrillEvent {
    /**
     * All the drilling interactions set in KPI dashboards that are relevant to the given drill event (including drill downs).
     */
    drillDefinitions: DashboardDrillDefinition[];

    /**
     * Reference to the widget that triggered the drill event.
     */
    widgetRef?: ObjRef;
}

/**
 * Callback called when a drill event occurs.
 * @beta
 */
export type OnFiredDashboardDrillEvent = (event: IDashboardDrillEvent) => ReturnType<OnFiredDrillEvent>;

/**
 * Implicit drill down context
 *
 * @alpha
 */
export interface IDrillDownContext {
    drillDefinition: IDrillDownDefinition;
    event: IDrillEvent;
}

/**
 * Information about the DrillDown interaction - the attribute that is next in the drill down hierarchy.
 * @beta
 */
export interface IDrillDownDefinition {
    type: "drillDown";

    /**
     * Local identifier of the attribute that triggered the drill down.
     */
    origin: LocalIdRef;

    /**
     * Target attribute display form for drill down.
     */
    target: ObjRef;

    /**
     * Title for the target attribute.
     */
    title?: string;

    /**
     * Reference to the attribute hierarchy that triggered the drill down.
     * Is required if enableDrillDownIntersectionIgnoredAttributes feature flag is set to true.
     */
    hierarchyRef?: ObjRef;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillDownDefinition}.
 * @beta
 */
export function isDrillDownDefinition(obj: unknown): obj is IDrillDownDefinition {
    return !isEmpty(obj) && (obj as IDrillDownDefinition).type === "drillDown";
}

/**
 * @alpha
 */
export interface DashboardDrillContext {
    /**
     * Particular insight that triggered the drill event.
     */
    insight?: IInsight;

    /**
     * Particular widget that triggered the drill event.
     */
    widget?: IWidget;
}

/**
 * @internal
 */
export interface IDrillToUrlPlaceholder {
    placeholder: string;
    identifier: string;
    toBeEncoded: boolean;
}

/**
 * All sharing properties describing sharing changes
 *
 * @public
 */
export interface ISharingProperties {
    /**
     * Dashboard share status
     *
     * @remarks
     * private - dashboard accessible only by its creator
     * shared - dashboard shared with closed set of users/groups
     * public - accessible by everyone in the workspace
     */
    shareStatus: ShareStatus;
    /**
     * For backends NOT forcing strict access this prop reflects its current setting of strict access
     *
     * @remarks
     * If set to true then object is not accessible via its URI/ref for people without access rights.
     * Otherwise object is accessible by its URI/ref, eg. when drilling to it.
     */
    isUnderStrictControl: boolean;
    /**
     * When set to true, the dashboard is locked and no one other than the administrator can edit it.
     */
    isLocked: boolean;
    /**
     * Access grantees to grant access to the dashboard to.
     */
    granteesToAdd: IAccessGrantee[];
    /**
     * Access grantees whose access to the dashboard to revoke.
     */
    granteesToDelete: IAccessGrantee[];
}

/**
 * @beta
 */
export interface IMenuButtonItemsVisibility {
    /**
     * If set to true, the Save as new button will be visible. Defaults to false.
     */
    saveAsNewButton?: boolean;
    /**
     * If set to true, the Export to PDF button will be visible. Defaults to true.
     */
    pdfExportButton?: boolean;
    /**
     * If set to true, the Export to EXCEL button will be visible. Defaults to true.
     */
    excelExportButton?: boolean;
    /**
     * If set to true, the Export to PowerPoint button will be visible. Defaults to true.
     */
    powerPointExportButton?: boolean;
    /**
     * If set to true, the Schedule emailing button will be visible. Defaults to true.
     */
    scheduleEmailButton?: boolean;
    /**
     * If set to true, the Alerting button will be visible. Defaults to true.
     */
    alertingButton?: boolean;
    /**
     * If set to true, the Delete button will be visible. Defaults to true.
     */
    deleteButton?: boolean;
}

/**
 * @beta
 */
export type RenderMode = "view" | "edit" | "export";

/**
 * @public
 */
export type DateFilterValidationResult = "TOO_MANY_CONFIGS" | "NO_CONFIG" | DateFilterConfigValidationResult;

/**
 * Legacy Dashboard (a.k.a. PP Dashboard) tab.
 * @alpha
 */
export interface ILegacyDashboardTab {
    /**
     * Title of the tab
     */
    readonly title: string;
    /**
     * Unique identifier of the tab
     */
    readonly identifier: string;
}

/**
 * Legacy Dashboard (a.k.a. PP Dashboard).
 * @alpha
 */
export interface ILegacyDashboard {
    /**
     * Object ref
     */
    readonly ref: ObjRef;

    /**
     * Object uri
     */
    readonly uri: string;

    /**
     * Object identifier
     */
    readonly identifier: string;

    /**
     * Title of the legacy dashboard
     */
    readonly title: string;

    /**
     * Tabs included in the legacy dashboard
     */
    readonly tabs: ILegacyDashboardTab[];
}

/**
 * Coordinates of an item in a layout.
 * @beta
 */
export interface ILayoutCoordinates {
    /**
     * 0-based index of the section the item is in.
     */
    sectionIndex: number;
    /**
     * 0-based index of the item within the section.
     */
    itemIndex: number;
}

/**
 *  Tests whenever the provided object is layout coordinates object.
 *  @alpha
 */
export function isLayoutCoordinates(obj: unknown): obj is ILayoutCoordinates {
    return (
        !isEmpty(obj) &&
        (obj as ILayoutCoordinates).sectionIndex !== undefined &&
        (obj as ILayoutCoordinates).itemIndex !== undefined
    );
}

/**
 *  Coordinates of an item in a nested layout.
 *  @alpha
 */
export type ILayoutItemPath = ILayoutCoordinates[];

/**
 *  Tests whenever the provided object is section path.
 *  @alpha
 */
export function isLayoutItemPath(obj: unknown): obj is ILayoutItemPath {
    return !isEmpty(obj) && Array.isArray(obj) && obj.every(isLayoutCoordinates);
}

/**
 *  Coordinates of a section in a nested layout.
 *  @alpha
 */
export interface ILayoutSectionPath {
    /**
     * The path to the parent item that contains this section.
     *
     * Undefined when section is in the root layout, otherwise leads to the layout widget in which the section
     * is nested.
     */
    parent?: ILayoutItemPath;
    /**
     * Zero based index.
     */
    sectionIndex: number;
}

/**
 *  Tests whenever the provided object is section path.
 *  @alpha
 */
export function isLayoutSectionPath(obj: unknown): obj is ILayoutSectionPath {
    return !isEmpty(obj) && (obj as ILayoutSectionPath).sectionIndex !== undefined;
}

/**
 * @internal
 */
export interface IGlobalDrillDownAttributeHierarchyDefinition {
    type: "drillDown";

    /**
     * Local identifier of the attribute that triggered the drill down.
     */
    origin: LocalIdRef;

    /**
     * Target attribute hierarchy for drill down.
     */
    target: ObjRef;
}

/**
 * @internal
 */
export interface IScheduleEmailContext {
    /**
     * Widget to schedule email for.
     */
    widgetRef?: ObjRef | undefined;
}

/**
 * @internal
 */
export interface IScheduleEmailDialogContext {
    /**
     * Widget to schedule email for.
     */
    widgetRef?: ObjRef | undefined;
}
