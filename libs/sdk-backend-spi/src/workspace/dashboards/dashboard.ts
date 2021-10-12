// (C) 2019-2021 GoodData Corporation
import { IAuditableDates, IAuditableUsers, Identifier, IInsight, ObjRef } from "@gooddata/sdk-model";
import { IDashboardLayout, IDashboardWidget } from "./layout";
import { IFilterContext, IFilterContextDefinition, ITempFilterContext } from "./filterContext";
import { IDashboardObjectIdentity } from "./common";
import {
    DateFilterGranularity,
    IAbsoluteDateFilterPreset,
    IRelativeDateFilterPreset,
} from "../dateFilterConfigs/types";

/**
 * Date filter configuration mode
 * @alpha
 */
export type DashboardDateFilterConfigMode = "readonly" | "hidden" | "active";

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
     * When dashboard is locked, no one other than the administrator can edit it
     */
    readonly isLocked?: boolean;

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
export interface IDashboardPlugin extends IDashboardPluginBase, IDashboardObjectIdentity, IAuditableDates {}

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
     * Optionally contains parameters that should be passed to the plugin at load time. The format
     * and content of the parameters are fully dependent on the implementation of the plugin. If the
     * plugin parameterization is possible, then the plugin documentation should contain the detail.
     */
    readonly parameters?: string;
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
        Readonly<IAuditableUsers> {
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
     * Dashboard extended date filter config
     */
    readonly dateFilterConfig?: IDashboardDateFilterConfig;

    /**
     * Plugins used on this dashboard.
     */
    readonly plugins?: IDashboardPluginLink[];
}

/**
 * Dashboard definition represents modified or created dashboard
 *
 * @alpha
 */
export interface IDashboardDefinition<TWidget = IDashboardWidget>
    extends IDashboardBase,
        Partial<IDashboardObjectIdentity> {
    /**
     * The layout of the dashboard determines the dashboard widgets {@link IWidget} and where they are rendered
     */
    readonly layout?: IDashboardLayout<TWidget>;

    /**
     * Dashboard filter context, or temporary filter context
     */
    readonly filterContext?: IFilterContext | IFilterContextDefinition;

    /**
     * Dashboard extended date filter config
     */
    readonly dateFilterConfig?: IDashboardDateFilterConfig;

    /**
     * Plugins to use on this dashboard.
     */
    readonly plugins?: IDashboardPluginLink[];
}

/**
 * Listed dashboard - to display the dashboard in the list
 * Only a subset of dashboard data is available,
 * for the full definition see {@link IDashboard}
 * @alpha
 */
export interface IListedDashboard extends Readonly<Required<IAuditableDates>>, Readonly<IAuditableUsers> {
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
}

/**
 * Dashboard referenced objects
 *
 * @alpha
 */
export interface IDashboardReferences {
    /**
     * Referenced insights. Empty if no insights on dashboard or referenced insights were not requested.
     */
    insights: IInsight[];

    /**
     * Referenced plugins. Empty if no plugins on dashboard or referenced plugins were not requested.
     */
    plugins: IDashboardPlugin[];
}

/**
 * Dashboard with referenced objects
 *  * @alpha
 */
export interface IDashboardWithReferences {
    dashboard: IDashboard;
    references: IDashboardReferences;
}
