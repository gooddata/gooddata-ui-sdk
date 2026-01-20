// (C) 2021-2026 GoodData Corporation

import {
    type IKpiComparisonDirection,
    type IKpiComparisonTypeComparison,
    type IKpiWidgetConfiguration,
    type ObjRef,
    isObjRef,
} from "@gooddata/sdk-model";

import { type IDashboardCommand } from "./base.js";
import {
    type IFilterOpReplaceAll,
    type IWidgetDescription,
    type IWidgetFilterOperation,
    type IWidgetHeader,
} from "../types/widgetTypes.js";

/**
 * Payload of the {@link IChangeKpiWidgetHeader} command.
 * @beta
 */
export interface IChangeKpiWidgetHeaderPayload {
    /**
     * KPI Widget reference whose measure to change.
     */
    readonly ref: ObjRef;

    /**
     * Header to use for the KPI widget. Contents of the provided header will be used as-is and will be
     * used to replace the current header values.
     */
    readonly header: IWidgetHeader;
}

/**
 * @beta
 */
export interface IChangeKpiWidgetHeader extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_HEADER";
    readonly payload: IChangeKpiWidgetHeaderPayload;
}

/**
 * Creates the ChangeKpiWidgetHeader command. Dispatching this command will result in change of the KPI widget's
 * header which (now) includes title.
 *
 * @param ref - reference of the KPI widget to modify
 * @param header - new header to use
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function changeKpiWidgetHeader(
    ref: ObjRef,
    header: IWidgetHeader,
    correlationId?: string,
): IChangeKpiWidgetHeader {
    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_HEADER",
        correlationId,
        payload: {
            ref,
            header,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IChangeKpiWidgetDescription} command.
 * @beta
 */
export interface IChangeKpiWidgetDescriptionPayload {
    /**
     * Reference to Kpi whose description to change.
     */
    readonly ref: ObjRef;

    /**
     * Description to use for the Kpi widget. Contents of the provided description will be used as-is and will be
     * used to replace the current description values.
     */
    readonly description: IWidgetDescription;
}

/**
 * @beta
 */
export interface IChangeKpiWidgetDescription extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_DESCRIPTION";
    readonly payload: IChangeKpiWidgetDescriptionPayload;
}

/**
 * Creates the ChangeKpiWidgetDescription command. Dispatching this command will result in change of the Kpi widget's
 * description.
 *
 * @param ref - reference of the kpi widget to modify
 * @param description - new description to use
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function changeKpiWidgetDescription(
    ref: ObjRef,
    description: IWidgetDescription,
    correlationId?: string,
): IChangeKpiWidgetDescription {
    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_DESCRIPTION",
        correlationId,
        payload: {
            ref,
            description,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IChangeKpiWidgetConfiguration} command.
 * @beta
 */
export interface IChangeKpiWidgetConfigurationPayload {
    /**
     * Reference to Kpi Widget whose configuration to change.
     */
    readonly ref: ObjRef;

    /**
     * Configuration to use for the kpi that is rendered by the widget.
     *
     * These will replace the existing configuration. To clear any widget-level configuration
     * currently in effect for the widget, set the configuration to `undefined`.
     */
    readonly config: IKpiWidgetConfiguration | undefined;
}

/**
 * @beta
 */
export interface IChangeKpiWidgetConfiguration extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_CONFIGURATION";
    readonly payload: IChangeKpiWidgetConfigurationPayload;
}

/**
 *
 * Creates the ChangeKpiWidgetConfiguration command. Dispatching this command will result is modification
 * of the configuration that are effective for the particular kpi widget.
 *
 * Through configuration, you can modify how is particular kpi rendered
 *
 * If you want to clear any widget-level configuration, set config to `undefined`.
 *
 * @param ref - reference of the insight widget to modify
 * @param config - new configuration to set, undefined to clear any widget level  config
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function changeKpiWidgetConfiguration(
    ref: ObjRef,
    config: IKpiWidgetConfiguration | undefined,
    correlationId?: string,
): IChangeKpiWidgetConfiguration {
    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_CONFIGURATION",
        correlationId,
        payload: {
            ref,
            config,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IChangeKpiWidgetMeasure} command.
 * @beta
 */
export interface IChangeKpiWidgetMeasurePayload {
    /**
     * KPI Widget reference whose measure to change.
     */
    readonly ref: ObjRef;

    /**
     * Reference to the new measure to use instead of the old measure.
     */
    readonly measureRef: ObjRef;

    /**
     * Specify the new header that should be used for the KPI widget with the
     * changed measure.
     *
     * @remarks
     * You may specify the widget header as 'from-measure'. In that case the title will be automatically
     * set to the title of measure specified in the `measureRef` property.
     */
    readonly header?: IWidgetHeader | "from-measure";
}

/**
 * @beta
 */
export interface IChangeKpiWidgetMeasure extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_MEASURE";
    readonly payload: IChangeKpiWidgetMeasurePayload;
}

/**
 * Creates the ChangeKpiWidgetMeasure command. Dispatching this command will result in change of the measure
 * used by the KPI.
 *
 * @param ref - reference of the KPI widget to modify
 * @param measureRef - reference of the measure to use
 * @param header - specify new header to use; if not provided the existing header will be reused
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function changeKpiWidgetMeasure(
    ref: ObjRef,
    measureRef: ObjRef,
    header?: IWidgetHeader | "from-measure",
    correlationId?: string,
): IChangeKpiWidgetMeasure {
    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_MEASURE",
        correlationId,
        payload: {
            ref,
            measureRef,
            header,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IChangeKpiWidgetFilterSettings} command.
 * @beta
 */
export interface IChangeKpiWidgetFilterSettingsPayload {
    /**
     * KPI Widget reference whose filter settings to change.
     */
    readonly ref: ObjRef;

    /**
     * Filter settings to apply for the widget. The settings are used as-is and
     * replace current widget settings.
     */
    readonly operation: IWidgetFilterOperation;
}

/**
 * @beta
 */
export interface IChangeKpiWidgetFilterSettings extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_FILTER_SETTINGS";
    readonly payload: IChangeKpiWidgetFilterSettingsPayload;
}

/**
 * Creates the ChangeKpiWidgetFilterSettings command. Dispatching this command will result in change of KPI widget's
 * filter settings; this includes change of data set used for date filter, disabling date filtering, ignoring
 * attribute filters that are defined on the dashboard for the widget.
 *
 * @param ref - reference of the KPI widget to modify
 * @param settings - new filter settings to apply
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function replaceKpiWidgetFilterSettings(
    ref: ObjRef,
    settings: Omit<IFilterOpReplaceAll, "type">,
    correlationId?: string,
): IChangeKpiWidgetFilterSettings {
    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "replace",
                ...settings,
            },
        },
    };
}

/**
 * Creates the ChangeKpiWidgetFilterSettings command for {@link IFilterOpEnableDateFilter} operation.
 *
 * Dispatching this command will result in change of KPI widget's date filter setting. The date filtering will
 * be enabled and the provided date data set will be used for date-filtering widget's KPI.
 *
 * @param ref - reference of the KPI widget to modify
 * @param dateDataset - date data set to use for filtering the insight, if "default" is provided, the default date dataset will be resolved and used
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function enableKpiWidgetDateFilter(
    ref: ObjRef,
    dateDataset: ObjRef | "default",
    correlationId?: string,
): IChangeKpiWidgetFilterSettings {
    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "enableDateFilter",
                dateDataset,
            },
        },
    };
}

/**
 * Creates the ChangeKpiWidgetFilterSettings command for {@link IFilterOpDisableDateFilter} operation.
 *
 * Dispatching this command will result in change of KPI widget's date filter setting. The date filtering will
 * be disabled.
 *
 * @param ref - reference of the KPI widget to modify
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function disableKpiWidgetDateFilter(
    ref: ObjRef,
    correlationId?: string,
): IChangeKpiWidgetFilterSettings {
    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "disableDateFilter",
            },
        },
    };
}

/**
 * Creates the ChangeKpiWidgetFilterSettings command for {@link IFilterOpReplaceAttributeIgnores} operation.
 *
 * Dispatching this command will result in replacement of KPI widget's attribute filter ignore-list. Those attribute filters
 * that use the provided displayForms for filtering will be ignored by the widget.
 *
 * @param ref - reference of the KPI widget to modify
 * @param displayForms - refs of display forms used by attribute filters that should be ignored
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function replaceKpiWidgetIgnoredFilters(
    ref: ObjRef,
    displayForms?: ObjRef[],
    correlationId?: string,
): IChangeKpiWidgetFilterSettings {
    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "replaceAttributeIgnores",
                displayFormRefs: displayForms ?? [],
            },
        },
    };
}

/**
 * Creates the ChangeKpiWidgetFilterSettings command for {@link IFilterOpIgnoreAttributeFilter} operation.
 *
 * Dispatching this command will result in addition of one or more filters into KPI widget's attribute filter ignore-list.
 * Those attribute filters that use the provided displayForms for filtering will be ignored by the widget on top of any
 * other filters that are already ignored.
 *
 * Ignored attribute filters are not passed down to the KPI and will not be used to filter that KPI.
 *
 * The operation is idempotent - trying to ignore an attribute filter multiple times will have no effect.
 *
 * @param ref - reference of the KPI widget to modify
 * @param oneOrMoreDisplayForms - one or more refs of display forms used by attribute filters that should be added to the ignore-list
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function ignoreFilterOnKpiWidget(
    ref: ObjRef,
    oneOrMoreDisplayForms: ObjRef | ObjRef[],
    correlationId?: string,
): IChangeKpiWidgetFilterSettings {
    const displayFormRefs = isObjRef(oneOrMoreDisplayForms) ? [oneOrMoreDisplayForms] : oneOrMoreDisplayForms;

    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "ignoreAttributeFilter",
                displayFormRefs,
            },
        },
    };
}

/**
 * Creates the ChangeKpiWidgetFilterSettings command for {@link IFilterOpUnignoreAttributeFilter} operation.
 *
 * Dispatching this command will result in removal of one or more filters from KPI widget's attribute filter ignore-list.
 * Ignored attribute filters are not passed down to the KPI and will not be used to filter that KPI.
 *
 * The operation is idempotent - trying to unignore an attribute filter multiple times will have no effect.
 *
 * @param ref - reference of the KPI widget to modify
 * @param oneOrMoreDisplayForms - one or more refs of display forms used by attribute filters that should be removed from the ignore-list
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function unignoreFilterOnKpiWidget(
    ref: ObjRef,
    oneOrMoreDisplayForms: ObjRef | ObjRef[],
    correlationId?: string,
): IChangeKpiWidgetFilterSettings {
    const displayFormRefs = isObjRef(oneOrMoreDisplayForms) ? [oneOrMoreDisplayForms] : oneOrMoreDisplayForms;

    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "unignoreAttributeFilter",
                displayFormRefs,
            },
        },
    };
}

//
//
//

/**
 * @beta
 */
export interface IKpiWidgetComparison {
    /**
     * Type of comparison to do. May be period-over-period, previous period or no
     * comparison.
     *
     * TODO: explain PoP & previous period
     *
     * If not specified, defaults to no comparison.
     */
    comparisonType?: IKpiComparisonTypeComparison;

    /**
     * Customizes whether growth of the measure compared to previous period is considered
     * a good thing or a bad thing. This setting influences the visuals (red vs green indicators)
     */
    comparisonDirection?: IKpiComparisonDirection;
}

/**
 * Payload of the {@link IChangeKpiWidgetComparison} command.
 * @beta
 */
export interface IChangeKpiWidgetComparisonPayload {
    /**
     * Reference to KPI Widget whose filter settings to change.
     */
    readonly ref: ObjRef;

    /**
     * Comparison settings to use for the KPI Widget.
     *
     * To disable comparison you can send empty object here.
     */
    readonly comparison: IKpiWidgetComparison;
}

/**
 * @beta
 */
export interface IChangeKpiWidgetComparison extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_COMPARISON";
    readonly payload: IChangeKpiWidgetComparisonPayload;
}

/**
 * Creates the ChangeKpiWidgetComparison command. Dispatching this command will result in change of what comparison
 * method - if any - is used for the KPI's Measure. The KPI may compare measure value from current period (as selected
 * by the date filter) to previous period and then depending on whether the current value grows can visualize that
 * as a good or bad thing.
 *
 * @param ref - reference of the KPI widget to modify
 * @param comparison - new comparison setting
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function changeKpiWidgetComparison(
    ref: ObjRef,
    comparison: IKpiWidgetComparison,
    correlationId?: string,
): IChangeKpiWidgetComparison {
    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_COMPARISON",
        correlationId,
        payload: {
            ref,
            comparison,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IRefreshKpiWidget} command.
 * @beta
 */
export interface IRefreshKpiWidgetPayload {
    /**
     * Reference to KPI Widget to refresh.
     */
    readonly ref: ObjRef;
}

/**
 * @beta
 */
export interface IRefreshKpiWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.KPI_WIDGET.REFRESH";
    readonly payload: IRefreshKpiWidgetPayload;
}

/**
 * Creates the RefreshKpiWidget command. Dispatching this command will result in re-calculation of the KPI's value.
 *
 * @param ref - reference of the KPI widget to refresh
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function refreshKpiWidget(ref: ObjRef, correlationId?: string): IRefreshKpiWidget {
    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.REFRESH",
        correlationId,
        payload: {
            ref,
        },
    };
}

//
//
//

/**
 * Payload of the {@link ISetDrillForKpiWidget} command.
 * @beta
 */
export interface ISetDrillForKpiWidgetPayload {
    /**
     * Reference to KPI Widget to modify.
     */
    readonly ref: ObjRef;
    readonly legacyDashboardRef: ObjRef;
    readonly legacyDashboardTabIdentifier: string;
}

/**
 * @beta
 */
export interface ISetDrillForKpiWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.KPI_WIDGET.SET_DRILL";
    readonly payload: ISetDrillForKpiWidgetPayload;
}

/**
 * Creates the SetDrillForKpiWidget command. Dispatching this command will result in KPI having its drill set to the given value.
 *
 * @param ref - reference of the KPI widget to modify
 * @param legacyDashboardRef - ref of the legacy dashboard to drill to
 * @param legacyDashboardTabIdentifier - identifier of the legacy dashboard tab to drill to
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function setDrillForKpiWidget(
    ref: ObjRef,
    legacyDashboardRef: ObjRef,
    legacyDashboardTabIdentifier: string,
    correlationId?: string,
): ISetDrillForKpiWidget {
    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.SET_DRILL",
        correlationId,
        payload: {
            ref,
            legacyDashboardTabIdentifier,
            legacyDashboardRef,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IRemoveDrillForKpiWidget} command.
 * @beta
 */
export interface IRemoveDrillForKpiWidgetPayload {
    /**
     * Reference to KPI Widget to modify.
     */
    readonly ref: ObjRef;
}

/**
 * @beta
 */
export interface IRemoveDrillForKpiWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.KPI_WIDGET.REMOVE_DRILL";
    readonly payload: IRemoveDrillForKpiWidgetPayload;
}

/**
 * Creates the RemoveDrillForKpiWidget command. Dispatching this command will result in KPI having its drill removed.
 *
 * @param ref - reference of the KPI widget to modify
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function removeDrillForKpiWidget(ref: ObjRef, correlationId?: string): IRemoveDrillForKpiWidget {
    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.REMOVE_DRILL",
        correlationId,
        payload: {
            ref,
        },
    };
}
