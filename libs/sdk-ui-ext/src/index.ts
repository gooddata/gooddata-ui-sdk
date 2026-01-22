// (C) 2007-2026 GoodData Corporation

/**
 * This package contains various extensions on top of the stable components included in GoodData.UI.
 *
 * @remarks
 * The extensions land here instead of their own project as part of their staged development.
 *
 * Notable member of the package is InsightView, the component that allows you to embed
 * Analytical Designer insights.
 *
 * @packageDocumentation
 */

import { type IInsight, type IInsightDefinition, type ISettings } from "@gooddata/sdk-model";
import { type IDrillEvent } from "@gooddata/sdk-ui";

export type { ChartInlineVisualizationType } from "@gooddata/sdk-ui-charts";
import {
    DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT_PX,
    DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT,
    EmbedInsightDialog,
    EmptyAfmSdkError,
    FluidLayoutDescriptor,
    FullVisualizationCatalog,
    type IDrillDownDefinition,
    type IEmbedInsightDialogProps,
    type IFluidLayoutDescriptor,
    type ILayoutDescriptor,
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT,
    INSIGHT_WIDGET_SIZE_INFO_NEW_DEFAULT,
    type ISizeInfo,
    type ISizeInfoDefault,
    type IVisualizationDefaultSizeInfo,
    type IVisualizationMeta,
    type IVisualizationSizeInfo,
    KPI_WIDGET_SIZE_INFO_DEFAULT,
    type LayoutType,
    MIN_VISUALIZATION_WIDTH,
    PluggableVisualizationErrorCodes,
    type PluggableVisualizationErrorType,
    RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT,
    RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT,
    VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT,
    VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_NEW_DEFAULT,
    WIDGET_DROPZONE_SIZE_INFO_DEFAULT,
    addIntersectionFiltersToInsight,
    fluidLayoutDescriptor,
    isDrillDownDefinition,
    isEmptyAfm,
    isSizeInfo,
    isSizeInfoDefault,
    isVisualizationDefaultSizeInfo,
} from "./internal/index.js";

export { clearInsightViewCaches } from "./dataLoaders/index.js";
export * from "./insightView/index.js";
export * from "./automations/index.js";
// exported for sdk-ui-dashboard
export {
    type IDrillDownDefinition,
    type IVisualizationSizeInfo,
    type IVisualizationDefaultSizeInfo,
    type IVisualizationMeta,
    type ISizeInfo,
    type ISizeInfoDefault,
    type IFluidLayoutDescriptor,
    type ILayoutDescriptor,
    type LayoutType,
    type PluggableVisualizationErrorType,
    type IEmbedInsightDialogProps,
    isDrillDownDefinition,
    fluidLayoutDescriptor,
    FluidLayoutDescriptor,
    isEmptyAfm,
    EmptyAfmSdkError,
    PluggableVisualizationErrorCodes,
    addIntersectionFiltersToInsight,
    DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT_PX,
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT,
    INSIGHT_WIDGET_SIZE_INFO_NEW_DEFAULT,
    KPI_WIDGET_SIZE_INFO_DEFAULT,
    WIDGET_DROPZONE_SIZE_INFO_DEFAULT,
    RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT,
    RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT,
    VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT,
    VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_NEW_DEFAULT,
    DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT,
    MIN_VISUALIZATION_WIDTH,
    EmbedInsightDialog,
    isSizeInfo,
    isSizeInfoDefault,
    isVisualizationDefaultSizeInfo,
};

// below functions are exported only for sdk-ui-dashboard use to avoid exporting the whole FullVisualizationCatalog
/**
 * @internal
 */
export function getInsightSizeInfo(insight: IInsightDefinition, settings: ISettings): IVisualizationSizeInfo {
    return FullVisualizationCatalog.forInsight(
        insight,
        settings?.enableNewPivotTable ?? true,
        settings?.enableNewGeoPushpin ?? false,
    ).getSizeInfo(insight, fluidLayoutDescriptor, settings);
}

/**
 * @internal
 */
export function getInsightWithAppliedDrillDown(
    insight: IInsight,
    drillEvent: IDrillEvent,
    drillDefinition: IDrillDownDefinition,
    backendSupportsElementUris: boolean,
    settings: ISettings,
): IInsight {
    return FullVisualizationCatalog.forInsight(
        insight,
        false,
        settings?.enableNewGeoPushpin ?? false,
    ).applyDrillDown(
        insight,
        {
            drillDefinition,
            event: drillEvent,
        },
        backendSupportsElementUris,
    );
}

/**
 * @internal
 */
export function getInsightVisualizationMeta(
    insight: IInsightDefinition,
    settings?: ISettings,
): IVisualizationMeta {
    return FullVisualizationCatalog.forInsight(
        insight,
        settings?.enableNewPivotTable ?? true,
        settings?.enableNewGeoPushpin ?? false,
    ).getMeta(settings);
}

export * from "./internal/components/dialogs/userManagementDialogs/index.js";

export * from "./internal/components/attributeHierarchies/index.js";

export * from "./internal/components/pluggableVisualizations/alerts.js";
export * from "./internal/components/pluggableVisualizations/keyDriverAnalysis.js";

export {
    NotificationsPanel,
    type INotificationsPanelProps,
    type INotificationsPanelCustomComponentsProps,
} from "./notificationsPanel/NotificationsPanel/NotificationsPanel.js";
export {
    DefaultNotificationsPanel,
    type INotificationsPanelComponentProps,
} from "./notificationsPanel/NotificationsPanel/DefaultNotificationsPanel.js";
export {
    DefaultNotificationsPanelButton,
    type INotificationsPanelButtonComponentProps,
} from "./notificationsPanel/NotificationsPanel/DefaultNotificationsPanelButton.js";
export {
    DefaultNotificationsPanelHeader,
    type INotificationsPanelHeaderComponentProps,
} from "./notificationsPanel/NotificationsPanel/DefaultNotificationsPanelHeader.js";
export {
    DefaultNotificationsList,
    type INotificationsListComponentProps,
} from "./notificationsPanel/NotificationsList/DefaultNotificationsList.js";
export {
    DefaultNotificationsListEmptyState,
    type INotificationsListEmptyStateComponentProps,
} from "./notificationsPanel/NotificationsList/DefaultNotificationsListEmptyState.js";
export {
    DefaultNotificationsListErrorState,
    type INotificationsListErrorStateComponentProps,
} from "./notificationsPanel/NotificationsList/DefaultNotificationsListErrorState.js";
export {
    DefaultNotification,
    type INotificationComponentProps,
} from "./notificationsPanel/Notification/DefaultNotification.js";
export {
    DefaultNotificationSkeletonItem,
    type INotificationSkeletonItemComponentProps,
} from "./notificationsPanel/NotificationsList/DefaultSkeletonItem.js";
export type { INotificationsPanelView } from "./notificationsPanel/types.js";

/**
 * In order to use React18 for visualization rendering, one has to provide createRoot function.
 * Older React17 render is used by default.

 * @public
 * @deprecated no longer necessary to call this method. It's now no-op for React 18 and 19, kept for backward compatibility.
 */
export function provideCreateRoot(_fn: any) {
    // eslint-disable-next-line no-console
    console.log("Info: no longer necessary to call provideCreateRoot");
}
