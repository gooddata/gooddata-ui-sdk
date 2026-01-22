// (C) 2022-2026 GoodData Corporation

/**
 * This file is used to re-export internal parts of the package that are used in other GoodData applications.
 * These are not to be used, outside GoodData, as they can change or disappear at any time.
 * Do not add anything new here, instead try to remove as much as possible when you can.
 */

export {
    AUTOMATIONS_COLUMN_CONFIG,
    AUTOMATIONS_MAX_HEIGHT,
    AUTOMATION_FILTERS_GROUP_LABEL_ID,
    AUTOMATION_FILTERS_DIALOG_TITLE_ID,
    AUTOMATION_FILTERS_DIALOG_ID,
    AUTOMATION_ATTACHMENTS_DIALOG_TITLE_ID,
    AUTOMATION_ATTACHMENTS_GROUP_LABEL_ID,
} from "./presentation/constants/automations.js";
export { IGNORED_CONFIGURATION_MENU_CLICK_CLASS } from "./presentation/constants/classes.js";
export { gdColorStateBlank, gdColorDisabled, gdColorNegative } from "./presentation/constants/colors.js";
export { DASHBOARD_TITLE_MAX_LENGTH } from "./presentation/constants/dashboard.js";
export {
    ALL_SCREENS,
    SCREEN_BREAKPOINT_XS,
    SCREEN_BREAKPOINT_SM,
    SCREEN_BREAKPOINT_MD,
    SCREEN_BREAKPOINT_LG,
    SCREEN_BREAKPOINT_XL,
    SCREEN_BREAKPOINT_XXL,
    DASHBOARD_LAYOUT_BREAK_POINTS,
    DASHBOARD_LAYOUT_CONTAINER_WIDTHS,
    DASHBOARD_LAYOUT_RESPONSIVE_SMALL_WIDTH,
    DASHBOARD_LAYOUT_MAX_HEIGHT_AS_RATIO_XS,
} from "./presentation/constants/layout.js";
export {
    DASHBOARD_OVERLAYS_Z_INDEX,
    DASHBOARD_HEADER_OVERLAYS_Z_INDEX,
    DASHBOARD_OVERLAYS_FILTER_Z_INDEX,
    DASHBOARD_DIALOG_OVERS_Z_INDEX,
    DASHBOARD_TOASTS_OVERLAY_Z_INDEX,
    DASHBOARD_DRILL_MENU_Z_INDEX,
} from "./presentation/constants/zIndex.js";

export type {
    IDashboardLayoutItemKeyGetter,
    IDashboardLayoutItemKeyGetterProps,
    IDashboardLayoutItemRenderProps,
    IDashboardLayoutItemRenderer,
    IDashboardLayoutRenderer,
    IDashboardLayoutSectionHeaderRenderProps,
    IDashboardLayoutSectionHeaderRenderer,
    IDashboardLayoutSectionKeyGetter,
    IDashboardLayoutSectionKeyGetterProps,
    IDashboardLayoutSectionRenderProps,
    IDashboardLayoutSectionRenderer,
    IDashboardLayoutWidgetRenderProps,
    IDashboardLayoutWidgetRenderer,
    IDashboardLayoutGridRowRenderProps,
    IDashboardLayoutGridRowRenderer,
    IDashboardLayoutRenderProps,
} from "./presentation/flexibleLayout/DefaultDashboardLayoutRenderer/interfaces.js";
export { DashboardLayout } from "./presentation/flexibleLayout/DefaultDashboardLayoutRenderer/./DashboardLayout.js";
export {
    DashboardLayoutItem,
    type IDashboardLayoutItemProps,
} from "./presentation/flexibleLayout/DefaultDashboardLayoutRenderer/./DashboardLayoutItem.js";
export { DashboardLayoutItemRenderer } from "./presentation/flexibleLayout/DefaultDashboardLayoutRenderer/./DashboardLayoutItemRenderer.js";
export { DashboardLayoutItemViewRenderer } from "./presentation/flexibleLayout/DefaultDashboardLayoutRenderer/./DashboardLayoutItemViewRenderer.js";
export {
    type IDashboardLayoutSectionProps,
    DashboardLayoutSection,
} from "./presentation/flexibleLayout/DefaultDashboardLayoutRenderer/./DashboardLayoutSection.js";
export { DashboardLayoutEditSectionHeader } from "./presentation/flexibleLayout/DefaultDashboardLayoutRenderer/./DashboardLayoutEditSectionHeader.js";
export { DashboardLayoutSectionHeaderRenderer } from "./presentation/flexibleLayout/DefaultDashboardLayoutRenderer/./DashboardLayoutSectionHeaderRenderer.js";
export { DashboardLayoutSectionRenderer } from "./presentation/flexibleLayout/DefaultDashboardLayoutRenderer/./DashboardLayoutSectionRenderer.js";
export { DashboardLayoutWidgetRenderer } from "./presentation/flexibleLayout/DefaultDashboardLayoutRenderer/./DashboardLayoutWidgetRenderer.js";
export { isGeoPushpin } from "./presentation/flexibleLayout/DefaultDashboardLayoutRenderer/./utils/legacy.js";
export {
    getDashboardLayoutItemHeightForRatioAndScreen,
    getDashboardLayoutItemMaxGridWidth,
    getDashboardLayoutWidgetDefaultGridWidth,
    validateDashboardLayoutWidgetSize,
} from "./presentation/flexibleLayout/DefaultDashboardLayoutRenderer/./utils/sizing.js";
export { DashboardLayoutBuilder } from "./_staging/dashboard/flexibleLayout/builder/layout.js";
export { DashboardLayoutFacade } from "./_staging/dashboard/flexibleLayout/facade/layout.js";
export type {
    DashboardLayoutItemModifications,
    DashboardLayoutItemsSelector,
    DashboardLayoutModifications,
    DashboardLayoutSectionModifications,
    DashboardLayoutSectionsSelector,
    IDashboardLayoutBuilder,
    IDashboardLayoutItemBuilder,
    IDashboardLayoutSectionBuilder,
} from "./_staging/dashboard/flexibleLayout/builder/interfaces.js";
export type {
    IDashboardLayoutItemFacade,
    IDashboardLayoutItemsFacade,
    IDashboardLayoutFacade,
    IDashboardLayoutSectionFacade,
    IDashboardLayoutSectionsFacade,
} from "./_staging/dashboard/flexibleLayout/facade/interfaces.js";
export { GridLayoutElement } from "./presentation/flexibleLayout/DefaultDashboardLayoutRenderer/GridLayoutElement.js";
export { DashboardItem } from "./presentation/presentationComponents/DashboardItems/DashboardItem.js";
export { DashboardItemBase } from "./presentation/presentationComponents/DashboardItems/DashboardItemBase.js";
export { DashboardItemContent } from "./presentation/presentationComponents/DashboardItems/DashboardItemContent.js";
export { DashboardItemHeadline } from "./presentation/presentationComponents/DashboardItems/DashboardItemHeadline.js";
export { DashboardItemHeadlineContainer } from "./presentation/presentationComponents/DashboardItems/DashboardItemHeadlineContainer.js";
export { DashboardItemKpi } from "./presentation/presentationComponents/DashboardItems/DashboardItemKpi.js";
export { DashboardItemVisualization } from "./presentation/presentationComponents/DashboardItems/DashboardItemVisualization.js";
export { getVisTypeCssClass } from "./presentation/presentationComponents/DashboardItems/utils.js";
export { ThemedLoadingEqualizer } from "./presentation/presentationComponents/ThemedLoadingEqualizer.js";

export {
    DefaultScheduledEmailDialog,
    ScheduledMailDialogRenderer,
} from "./presentation/scheduledEmail/DefaultScheduledEmailDialog/DefaultScheduledEmailDialog.js";
export { ScheduledEmailManagementDialog as DefaultScheduledEmailManagementDialog } from "./presentation/scheduledEmail/DefaultScheduledEmailManagementDialog/DefaultScheduledEmailManagementDialog.js";
export { ScheduledEmailDialog } from "./presentation/scheduledEmail/ScheduledEmailDialog.js";
export { ScheduledEmailManagementDialog } from "./presentation/scheduledEmail/ScheduledEmailManagementDialog.js";
export type {
    CustomScheduledEmailDialogComponent,
    CustomScheduledEmailManagementDialogComponent,
    IScheduledEmailDialogProps,
    IScheduledEmailManagementDialogProps,
    IScheduledEmailDialogPropsContext,
} from "./presentation/scheduledEmail/types.js";
export { PLATFORM_DATE_FORMAT } from "./presentation/scheduledEmail/DefaultScheduledEmailDialog/constants.js";
export { getBrokenAlertFiltersBasicInfo } from "./model/utils/alertsUtils.js";
export {
    DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT,
    DASHBOARD_LAYOUT_GRID_SINGLE_COLUMN,
} from "./_staging/dashboard/flexibleLayout/config.js";
export {
    type MeasurableWidgetContent,
    getSizeInfo,
    getInsightPlaceholderSizeInfo,
    getDashboardLayoutWidgetDefaultHeight,
    getDashboardLayoutWidgetMinGridHeight,
    getDashboardLayoutWidgetMaxGridHeight,
    getContainerHeight,
    getMinHeight,
    getMaxHeight,
    getDashboardLayoutWidgetMinGridWidth,
    getMinWidth,
    normalizeItemSizeToParent,
    calculateWidgetMinHeight,
    getDashboardLayoutItemHeight,
    getDashboardLayoutItemHeightForGrid,
    determineSizeForScreen,
    determineWidthForScreen,
    implicitLayoutItemSizeFromXlSize,
    splitDashboardLayoutItemsAsRenderedGridRows,
} from "./_staging/layout/sizing.js";
export {
    matchDateFilterToDateFilterOptionWithPreference,
    matchDateFilterToDateFilterOption,
    flattenDateFilterOptions,
    findDateFilterOptionByValue,
} from "./_staging/dateFilterConfig/dateFilterOptionMapping.js";
export { convertDateFilterConfigToDateFilterOptions } from "./_staging/dateFilterConfig/dateFilterConfigConverters.js";
export {
    dashboardAttributeFilterToAttributeFilter,
    attributeFilterToDashboardAttributeFilter,
    dateFilterOptionToDashboardDateFilter,
} from "./_staging/dashboard/dashboardFilterConverter.js";
export type {
    IKdaDateOptions,
    IKdaItem,
    IKdaItemGroup,
    IKdaState,
    KdaAsyncStatus,
} from "./kdaDialog/internalTypes.js";
export { KdaStateProvider, useKdaState } from "./kdaDialog/providers/KdaState.js";
export { KdaStoreProvider } from "./kdaDialog/providers/KdaStore.js";
export { type IKdaProps, KdaProvider } from "./kdaDialog/providers/Kda.js";
export { KdaDialog } from "./kdaDialog/dialog/KdaDialog.js";
export { KdaDialogController } from "./kdaDialog/dialog/KdaDialogController.js";
export { type IIntlWrapperProps, IntlWrapper } from "./presentation/localization/IntlWrapper.js";
