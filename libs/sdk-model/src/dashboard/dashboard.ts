// (C) 2019-2025 GoodData Corporation

import { isEmpty } from "lodash-es";

import { IDashboardObjectIdentity } from "./common.js";
import { IFilterContext, IFilterContextDefinition, ITempFilterContext } from "./filterContext.js";
import { IDashboardLayout, IDashboardWidget } from "./layout.js";
import { IAuditable, IAuditableDates, IAuditableUsers } from "../base/metadata.js";
import {
    DateFilterGranularity,
    IAbsoluteDateFilterPreset,
    IRelativeDateFilterPreset,
} from "../dateFilterConfig/index.js";
import { IDataSetMetadataObject } from "../ldm/metadata/dataSet/index.js";
import { Identifier, ObjRef } from "../objRef/index.js";

/**
 * Date filter configuration mode
 * @alpha
 */
export type DashboardDateFilterConfigMode = "readonly" | "hidden" | "active";

/**
 * Represent the values of DashboardDateFilterConfigMode
 *
 * @internal
 */
export const DashboardDateFilterConfigModeValues: Record<
    Uppercase<DashboardDateFilterConfigMode>,
    DashboardDateFilterConfigMode
> = {
    READONLY: "readonly" as const,
    HIDDEN: "hidden" as const,
    ACTIVE: "active" as const,
};

/**
 * Attribute filter configuration mode
 * @alpha
 */
export type DashboardAttributeFilterConfigMode = "readonly" | "hidden" | "active";

/**
 * Represent the values of DashboardAttributeFilterConfigMode
 *
 * @internal
 */
export const DashboardAttributeFilterConfigModeValues: Record<
    Uppercase<DashboardAttributeFilterConfigMode>,
    DashboardAttributeFilterConfigMode
> = {
    READONLY: "readonly" as const,
    HIDDEN: "hidden" as const,
    ACTIVE: "active" as const,
};

/**
 * Date filter presets to add to the date filter for the current dashboard
 * @alpha
 */
export interface IDashboardDateFilterAddedPresets {
    /**
     * Absolute date filter presets to include in the date filter for the current dashboard
     */
    absolutePresets?: IAbsoluteDateFilterPreset[];
    /**
     * Relative date filter presets to include in the date filter for the current dashboard
     */
    relativePresets?: IRelativeDateFilterPreset[];
}

/**
 * Extended date filter config
 * @alpha
 */
export interface IDashboardDateFilterConfig {
    /**
     * Customized name of the date filter to display
     */
    filterName: string;

    /**
     * Extended date filter config mode
     */
    mode: DashboardDateFilterConfigMode;

    /**
     * Local identifiers of the date filter options to hide for the current dashboard
     */
    hideOptions?: Identifier[];

    /**
     * Date filter granularities to hide in the date filter dropdown for the current dashboard
     */
    hideGranularities?: DateFilterGranularity[];

    /**
     * Date filter presets to add to the date filter dropdown specific for the current dashboard
     */
    addPresets?: IDashboardDateFilterAddedPresets;
}

/**
 * Extended attribute filter config
 * @alpha
 */
export interface IDashboardAttributeFilterConfig {
    /**
     * Local identifier of the attribute filter to configure
     */
    localIdentifier: string;

    /**
     * Control visibility mode of the attribute filter
     */
    mode?: DashboardAttributeFilterConfigMode;

    /**
     * Display form to use to show elements of attribute filter in UI
     */
    displayAsLabel?: ObjRef;
}

/**
 * Extended date filter config item for date filters fully specified including date data set
 * @alpha
 */
export interface IDashboardDateFilterConfigItem {
    dateDataSet: ObjRef;
    config: IDashboardDateFilterConfig;
}

/**
 * Dashboard common properties
 * @alpha
 */
export interface IDashboardBase {
    /**
     * Dashboard title
     */
    readonly title: string;

    /**
     * Dashboard description
     */
    readonly description: string;

    /**
     * Dashboard tags.
     *
     * @remarks
     * This property is optional for backwards compatibility reasons, but for newly created dashboards,
     * you can expect this to always be defined (an empty array in case there are no tags).
     *
     * Since 8.6.0
     */
    readonly tags?: string[];
}

/**
 * @alpha
 */
export interface IDashboardPluginBase {
    readonly type: "IDashboardPlugin";

    /**
     * Plugin name.
     */
    readonly name: string;

    /**
     * Plugin description. This is optional and may provide additional information about what
     * the plugin does.
     */
    readonly description?: string;

    /**
     * Plugins may be tagged using arbitrary tags for additional categorization.
     */
    readonly tags: string[];

    /**
     * Fully qualified URL where the plugin entry point is hosted.
     */
    readonly url: string;
}

/**
 * @alpha
 */
export interface IDashboardPlugin extends IDashboardPluginBase, IDashboardObjectIdentity, IAuditable {}

/**
 * @alpha
 */
export interface IDashboardPluginDefinition extends IDashboardPluginBase, Partial<IDashboardObjectIdentity> {}

/**
 * A link between dashboard and a plugin that it uses. Optionally contains parameters that should
 * be passed to the plugin at load time.
 *
 * @alpha
 */
export interface IDashboardPluginLink {
    readonly type: "IDashboardPluginLink";

    /**
     * Linked plugin.
     */
    readonly plugin: ObjRef;

    /**
     * Contains parameters that should be passed to the plugin at load time. The format
     * and content of the parameters are fully dependent on the implementation of the plugin. If the
     * plugin parameterization is possible, then the plugin documentation should contain the detail.
     */
    readonly parameters?: string;
}

/**
 * Object share status
 *
 * @remarks
 * private - object accessible only by its creator
 * shared - object shared with closed set of users/groups
 * public - accessible by everyone in project
 *
 * @alpha
 */
export type ShareStatus = "private" | "shared" | "public";

/**
 * Share permission.
 *
 * Hierarchy (highest → lowest): EDIT ⊃ SHARE ⊃ VIEW.
 *
 * - VIEW: Open and read a dashboard.
 * - SHARE: Includes VIEW; grant/revoke access for others.
 * - EDIT: Includes SHARE; modify content (layout, widgets, filters) and save changes.
 *
 *
 * @alpha
 */
export type SharePermission = "EDIT" | "SHARE" | "VIEW";

/**
 * Common properties for objects with controlled access
 * @alpha
 */
export interface IAccessControlAware {
    /**
     * Current object share status. This prop is affecting listing of object and access to it for different users
     */
    readonly shareStatus: ShareStatus;

    /**
     * Dashboard share permissions
     */
    readonly sharePermissions?: SharePermission[];

    /**
     * For backends NOT forcing strict access this prop reflects its current setting of strict access
     * If set to true then object is not accessible via its URI for people without access rights.
     * Otherwise object is accessible by its URI, eg. when drilling to it.
     */
    readonly isUnderStrictControl?: boolean;

    /**
     * When object is locked, no one other than the administrator can edit it
     */
    readonly isLocked?: boolean;
}

/**
 * Analytical dashboard consists of widgets
 * (widgets are kpis or insights with additional settings - drilling and alerting),
 * layout (which defines rendering and ordering of these widgets),
 * and filter context (configured attribute and date filters).
 * It's also possible to setup scheduled emails for the dashboard
 * (user will receive an email with the exported dashboard attached at the specified time interval),
 * and optionally extended date filter config.
 * @alpha
 */
export interface IDashboard<TWidget = IDashboardWidget>
    extends IDashboardBase,
        IDashboardObjectIdentity,
        Readonly<Required<IAuditableDates>>,
        Readonly<IAuditableUsers>,
        IAccessControlAware {
    readonly type: "IDashboard";

    /**
     * The layout of the dashboard determines the dashboard widgets {@link IWidget} and where they are rendered
     */
    readonly layout?: IDashboardLayout<TWidget>;

    /**
     * Dashboard filter context, or temporary filter context
     * (temporary filter context is used to override original filter context during the export)
     */
    readonly filterContext?: IFilterContext | ITempFilterContext;

    /**
     * Dashboard extended common date filter config
     */
    readonly dateFilterConfig?: IDashboardDateFilterConfig;

    /**
     * Dashboard extended date filters with date data set/dimension configs
     */
    readonly dateFilterConfigs?: IDashboardDateFilterConfigItem[];

    /**
     * Dashboard extended attribute filter configs
     */
    readonly attributeFilterConfigs?: IDashboardAttributeFilterConfig[];

    /**
     * Plugins used on this dashboard.
     */
    readonly plugins?: IDashboardPluginLink[];

    /**
     * Disables cross filtering for this dashboard.
     */
    readonly disableCrossFiltering?: boolean;

    /**
     * Disables reset of user filters for this dashboard.
     */
    readonly disableUserFilterReset?: boolean;

    /**
     * Disables save of user filters for this dashboard.
     */
    readonly disableUserFilterSave?: boolean;

    /**
     * Disables listing and saving of filter views for this dashboard.
     */
    readonly disableFilterViews?: boolean;

    /**
     * Data sets related to the dashboard, as defined by the includes directive
     */
    readonly dataSets?: IDataSetMetadataObject[];

    /**
     * Override the default evaluation frequency for the dashboard.
     */
    readonly evaluationFrequency?: string;
}

/**
 * Dashboard definition represents modified or created dashboard
 *
 * @alpha
 */
export interface IDashboardDefinition<TWidget = IDashboardWidget>
    extends IDashboardBase,
        IAccessControlAware,
        Partial<IDashboardObjectIdentity> {
    readonly type: "IDashboard";

    /**
     * The layout of the dashboard determines the dashboard widgets {@link IWidget} and where they are rendered
     */
    readonly layout?: IDashboardLayout<TWidget>;

    /**
     * Dashboard filter context, or temporary filter context
     */
    readonly filterContext?: IFilterContext | IFilterContextDefinition;

    /**
     * Dashboard extended common date filter config
     */
    readonly dateFilterConfig?: IDashboardDateFilterConfig;

    /**
     * Dashboard extended date filters with date data set/dimension configs
     */
    readonly dateFilterConfigs?: IDashboardDateFilterConfigItem[];

    /**
     * Dashboard extended attribute filter configs
     */
    readonly attributeFilterConfigs?: IDashboardAttributeFilterConfig[];

    /**
     * Plugins to use on this dashboard.
     */
    readonly plugins?: IDashboardPluginLink[];

    /**
     * Disables cross filtering for this dashboard.
     */
    readonly disableCrossFiltering?: boolean;

    /**
     * Disables reset of user filters for this dashboard.
     */
    readonly disableUserFilterReset?: boolean;

    /**
     * Disables save of user filters for this dashboard.
     */
    readonly disableUserFilterSave?: boolean;

    /**
     * Disables listing and saving of filter views for this dashboard.
     */
    readonly disableFilterViews?: boolean;

    /**
     * Evaluation frequency of alerts for the dashboard.
     */
    readonly evaluationFrequency?: string;
}

/**
 * Tests whether the provided object is an instance of {@link IDashboard}.
 *
 * @param obj - object to test
 * @alpha
 */
export function isDashboard(obj: unknown): obj is IDashboard {
    const asDash: IDashboard | undefined = obj as IDashboard;

    return !isEmpty(asDash) && asDash.type === "IDashboard" && asDash.ref !== undefined;
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardDefinition}.
 *
 * @param obj - object to test
 * @alpha
 */
export function isDashboardDefinition(obj: unknown): obj is IDashboardDefinition {
    const asDash: IDashboard | undefined = obj as IDashboard;

    return !isEmpty(asDash) && asDash.type === "IDashboard";
}

/**
 * Availability of {@link IListedDashboard}.
 * Either full (the listed dashboard is also available as a fully accessible metadata object) or
 * only via link (full metadata object is not accessible, only the listed dashboard record).
 * @alpha
 */
export type ListedDashboardAvailability = "full" | "viaLink";

/**
 * Listed dashboard - to display the dashboard in the list
 * Only a subset of dashboard data is available,
 * for the full definition see {@link IDashboard}
 * @alpha
 */
export interface IListedDashboard
    extends Readonly<Required<IAuditableDates>>,
        Readonly<IAuditableUsers>,
        IAccessControlAware {
    /**
     * Dashboard object ref
     */
    readonly ref: ObjRef;

    /**
     * Dashboard uri
     */
    readonly uri: string;

    /**
     * Dashboard identifier
     */
    readonly identifier: string;

    /**
     * Dashboard title
     */
    readonly title: string;

    /**
     * Dashboard description
     */
    readonly description: string;

    /**
     * Dashboard tags.
     *
     * @remarks
     * This property is optional for backwards compatibility reasons, but for newly created dashboards,
     * you can expect this to always be defined (an empty array in case there are no tags).
     *
     * Since 8.6.0
     */
    readonly tags?: string[];

    /**
     * States if dashboard is shared with the user and fully accessible or if it is hidden but accessible via link if user knows it.
     */
    readonly availability: ListedDashboardAvailability;
}

/**
 * Tests whether the provided object is an instance of {@link IListedDashboard}.
 *
 * @param obj - object to test
 * @alpha
 */
export function isListedDashboard(obj: unknown): obj is IListedDashboard {
    const asDash: IListedDashboard | undefined = obj as IListedDashboard;

    return !isEmpty(asDash) && asDash.availability !== undefined && asDash.ref !== undefined;
}

/**
 * Dashboard permissions.
 *
 * @alpha
 */
export type IDashboardPermissions = {
    [permission in
        | "canEditDashboard"
        | "canEditLockedDashboard"
        | "canShareLockedDashboard"
        | "canShareDashboard"
        | "canViewDashboard"]: boolean;
};

/**
 * Object describing minimal properties of existing dashboard.
 *
 * @alpha
 */
export interface IExistingDashboard extends IDashboardObjectIdentity {
    /**
     * Dashboard title
     */
    title?: string;
}
