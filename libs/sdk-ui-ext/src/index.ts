// (C) 2007-2025 GoodData Corporation
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

import { IInsight, IInsightDefinition, ISettings } from "@gooddata/sdk-model";
import { IDrillEvent } from "@gooddata/sdk-ui";
export type { ChartInlineVisualizationType } from "@gooddata/sdk-ui-charts";
import {
    fluidLayoutDescriptor,
    FullVisualizationCatalog,
    IDrillDownDefinition,
    IVisualizationSizeInfo,
    IVisualizationMeta,
} from "./internal/index.js";

export { clearInsightViewCaches } from "./dataLoaders/index.js";
export * from "./insightView/index.js";

// exported for sdk-ui-dashboard
export type {
    IDrillDownDefinition,
    IVisualizationSizeInfo,
    IVisualizationDefaultSizeInfo,
    IVisualizationMeta,
    ISizeInfo,
    ISizeInfoDefault,
    IFluidLayoutDescriptor,
    ILayoutDescriptor,
    LayoutType,
    PluggableVisualizationErrorType,
    IEmbedInsightDialogProps,
} from "./internal/index.js";
export {
    isDrillDownDefinition,
    fluidLayoutDescriptor,
    FluidLayoutDescriptor,
    isEmptyAfm,
    EmptyAfmSdkError,
    PluggableVisualizationErrorCodes,
    addIntersectionFiltersToInsight,
    DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT_PX,
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT,
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT_LEGACY,
    INSIGHT_WIDGET_SIZE_INFO_NEW_DEFAULT,
    KPI_WIDGET_SIZE_INFO_DEFAULT,
    KPI_WIDGET_SIZE_INFO_DEFAULT_LEGACY,
    WIDGET_DROPZONE_SIZE_INFO_DEFAULT,
    RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT,
    RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT,
    VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT,
    VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_NEW_DEFAULT,
    DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT,
    MIN_VISUALIZATION_WIDTH,
    EmbedInsightDialog,
} from "./internal/index.js";

export type { CreateRoot, Root } from "./internal/createRootProvider.js";
export { provideCreateRoot } from "./internal/createRootProvider.js";

// below functions are exported only for sdk-ui-dashboard use to avoid exporting the whole FullVisualizationCatalog
/**
 * @internal
 */
export function getInsightSizeInfo(insight: IInsightDefinition, settings: ISettings): IVisualizationSizeInfo {
    return FullVisualizationCatalog.forInsight(insight).getSizeInfo(insight, fluidLayoutDescriptor, settings);
}

/**
 * @internal
 */
export function getInsightWithAppliedDrillDown(
    insight: IInsight,
    drillEvent: IDrillEvent,
    drillDefinition: IDrillDownDefinition,
    backendSupportsElementUris: boolean,
    enableDuplicatedLabelValuesInAttributeFilter: boolean,
): IInsight {
    return FullVisualizationCatalog.forInsight(insight).applyDrillDown(
        insight,
        {
            drillDefinition,
            event: drillEvent,
        },
        backendSupportsElementUris,
        enableDuplicatedLabelValuesInAttributeFilter,
    );
}

/**
 * @internal
 */
export function getInsightVisualizationMeta(
    insight: IInsightDefinition,
    settings?: ISettings,
): IVisualizationMeta {
    return FullVisualizationCatalog.forInsight(insight).getMeta(settings);
}

export * from "./internal/components/dialogs/userManagementDialogs/index.js";

export * from "./internal/components/attributeHierarchies/index.js";

export * from "./internal/components/pluggableVisualizations/alerts.js";

export { NotificationsPanel } from "./notificationsPanel/NotificationsPanel/NotificationsPanel.js";
export type {
    INotificationsPanelProps,
    INotificationsPanelCustomComponentsProps,
} from "./notificationsPanel/NotificationsPanel/NotificationsPanel.js";
export { DefaultNotificationsPanel } from "./notificationsPanel/NotificationsPanel/DefaultNotificationsPanel.js";
export type { INotificationsPanelComponentProps } from "./notificationsPanel/NotificationsPanel/DefaultNotificationsPanel.js";
export { DefaultNotificationsPanelButton } from "./notificationsPanel/NotificationsPanel/DefaultNotificationsPanelButton.js";
export type { INotificationsPanelButtonComponentProps } from "./notificationsPanel/NotificationsPanel/DefaultNotificationsPanelButton.js";
export { DefaultNotificationsPanelHeader } from "./notificationsPanel/NotificationsPanel/DefaultNotificationsPanelHeader.js";
export type { INotificationsPanelHeaderComponentProps } from "./notificationsPanel/NotificationsPanel/DefaultNotificationsPanelHeader.js";
export { DefaultNotificationsList } from "./notificationsPanel/NotificationsList/DefaultNotificationsList.js";
export type { INotificationsListComponentProps } from "./notificationsPanel/NotificationsList/DefaultNotificationsList.js";
export { DefaultNotificationsListEmptyState } from "./notificationsPanel/NotificationsList/DefaultNotificationsListEmptyState.js";
export type { INotificationsListEmptyStateComponentProps } from "./notificationsPanel/NotificationsList/DefaultNotificationsListEmptyState.js";
export { DefaultNotificationsListErrorState } from "./notificationsPanel/NotificationsList/DefaultNotificationsListErrorState.js";
export type { INotificationsListErrorStateComponentProps } from "./notificationsPanel/NotificationsList/DefaultNotificationsListErrorState.js";
export { DefaultNotification } from "./notificationsPanel/Notification/DefaultNotification.js";
export type { INotificationComponentProps } from "./notificationsPanel/Notification/DefaultNotification.js";
export { DefaultNotificationSkeletonItem } from "./notificationsPanel/NotificationsList/DefaultSkeletonItem.js";
export type { INotificationSkeletonItemComponentProps } from "./notificationsPanel/NotificationsList/DefaultSkeletonItem.js";
export type { INotificationsPanelView } from "./notificationsPanel/types.js";
