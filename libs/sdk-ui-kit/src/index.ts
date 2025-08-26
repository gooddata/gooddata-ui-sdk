// (C) 2020-2025 GoodData Corporation
/**
 * This package provides various UI components used to build GoodData applications (such as buttons, icons, and so on).
 *
 * @remarks
 * These components are all marked as internal, and we do not recommend using them directly outside of GoodData
 * because their API can change at any time.
 *
 * @packageDocumentation
 */
export * from "./typings/utilities.js";
export * from "./typings/positioning.js";
export type * from "./typings/domUtilities.js";
export type * from "./typings/domNative.js";
export type * from "./typings/overlay.js";
export type * from "./typings/accessibility.js";
export * from "./utils/constants.js";
export * from "./utils/featureFlags.js";
export * from "./utils/drag.js";
export * from "./utils/dateTimeConfig.js";
export * from "./utils/events.js";
export * from "./utils/useId.js";
export { getFocusableElements, isElementFocusable } from "./utils/domUtilities.js";
export * from "./measureNumberFormat/index.js";
export * from "./syntaxHighlightingInput/index.js";
export * from "./Button/index.js";
export * from "./Datepicker/index.js";
export * from "./Form/index.js";
export * from "./Bubble/index.js";
export * from "./Timepicker/index.js";
export * from "./List/index.js";
export * from "./Tabs/index.js";
export * from "./Header/index.js";
export * from "./Messages/index.js";
export * from "./Dialog/index.js";
export * from "./Overlay/index.js";
export * from "./ResponsiveText/index.js";
export * from "./ShortenedText/index.js";
export * from "./Typography/index.js";
export * from "./LoadingDots/index.js";
export * from "./CustomizableCheckmark/index.js";
export * from "./AutoSize/index.js";
export * from "./LoadingMask/index.js";
export * from "./NoData/index.js";
export * from "./DocumentHeader/index.js";
export * from "./Dropdown/index.js";
export * from "./responsive/index.js";
export * from "./Icon/index.js";
export * from "./LoadingSpinner/index.js";
export * from "./EditableLabel/index.js";
export * from "./Spinner/index.js";
export * from "./FlexDimensions/index.js";
export * from "./DateDatasets/index.js";
export * from "./ColorPicker/index.js";
export * from "./FilterLabel/index.js";
export * from "./Menu/index.js";
export * from "./ScrollGradient/index.js";
export * from "./ChartSorting/index.js";
export * from "./SettingWidget/index.js";
export * from "./Hyperlink/index.js";
export * from "./ScrollablePanel/index.js";
export * from "./DescriptionPanel/index.js";
export * from "./SettingItem/index.js";
export * from "./TextAreaWithSubmit/index.js";
export * from "./SeparatorLine/index.js";
export * from "./RichText/index.js";
export * from "./RecurrenceForm/index.js";
export * from "./AddButton/index.js";
export * from "./ZoomContext/ZoomContext.js";
// export * from "./Table/index.js";
/**
 * New components
 */
export { ComponentTable, propCombinationsFor } from "./@ui/@dev/ComponentTable.js";
export type { IComponentTableProps, IPropCombination } from "./@ui/@dev/ComponentTable.js";
export type { StyleProps } from "./@ui/@utils/bem.js";
export { bem, bemFactory } from "./@ui/@utils/bem.js";
export type {
    SizeXSmall,
    SizeSmall,
    SizeMedium,
    SizeLarge,
    SizeXLarge,
    SizeXXLarge,
} from "./@ui/@types/size.js";
export type {
    VariantPrimary,
    VariantSecondary,
    VariantTertiary,
    VariantPopOut,
    VariantDanger,
    VariantTooltip,
    VariantTable,
    VariantLink,
} from "./@ui/@types/variant.js";
export type { ThemeColor } from "./@ui/@types/themeColors.js";
export { useElementSize } from "./@ui/hooks/useElementSize.js";
export type { IconType } from "./@ui/@types/icon.js";
export { UiButton } from "./@ui/UiButton/UiButton.js";
export type { UiButtonProps, IUiButtonAccessibilityConfig } from "./@ui/UiButton/UiButton.js";
export { UiButtonSegmentedControl } from "./@ui/UiButtonSegmentedControl/UiButtonSegmentedControl.js";
export type { UiButtonSegmentedControlProps } from "./@ui/UiButtonSegmentedControl/UiButtonSegmentedControl.js";
export { UiIconButton } from "./@ui/UiIconButton/UiIconButton.js";
export type { UiIconButtonProps } from "./@ui/UiIconButton/UiIconButton.js";
export type { UiIconButtonPublicProps } from "./@ui/UiIconButton/UiIconButtonRenderer.js";
export { UiChip } from "./@ui/UiChip/UiChip.js";
export type { UiChipProps, IUiChipAccessibilityConfig } from "./@ui/UiChip/UiChip.js";
export { UiCheckbox } from "./@ui/UiCheckbox/UiCheckbox.js";
export type { UiCheckboxProps } from "./@ui/UiCheckbox/UiCheckbox.js";
export { UiIcon } from "./@ui/UiIcon/UiIcon.js";
export type { UiIconProps } from "./@ui/UiIcon/UiIcon.js";
export type { BackgroundType, BackgroundShape } from "./@ui/@types/background.js";
export { iconPaths } from "./@ui/UiIcon/icons.js";
export { UiSkeleton } from "./@ui/UiSkeleton/UiSkeleton.js";
export type { UiSkeletonProps } from "./@ui/UiSkeleton/UiSkeleton.js";
export { UiPagedVirtualList } from "./@ui/UiPagedVirtualList/UiPagedVirtualList.js";
export type {
    UiPagedVirtualListProps,
    UiPagedVirtualListSkeletonItemProps,
} from "./@ui/UiPagedVirtualList/UiPagedVirtualList.js";
export { UiFocusManager, useUiFocusManagerConnectors } from "./@ui/UiFocusManager/UiFocusManager.js";
export type { IUiFocusManagerProps } from "./@ui/UiFocusManager/UiFocusManager.js";
export { UiFocusTrap, useUiFocusTrapConnectors } from "./@ui/UiFocusManager/UiFocusTrap.js";
export { UiTabOutHandler, useUiTabOutHandlerConnectors } from "./@ui/UiFocusManager/UiTabOutHandler.js";
export { UiAutofocus, useUiAutofocusConnectors } from "./@ui/UiFocusManager/UiAutofocus.js";
export type { IUiAutofocusOptions } from "./@ui/UiFocusManager/UiAutofocus.js";
export {
    UiReturnFocusOnUnmount,
    useUiReturnFocusOnUnmountConnectors,
} from "./@ui/UiFocusManager/UiReturnFocusOnUnmount.js";
export type { IUiReturnFocusOnUnmountOptions } from "./@ui/UiFocusManager/UiReturnFocusOnUnmount.js";
export {
    resolveRef,
    getNextFocusableElement,
    focusAndEnsureReachableElement,
    defaultFocusCheckFn,
    isNotDocumentFocused,
    programaticFocusManagement,
} from "./@ui/UiFocusManager/utils.js";
export type { IUiFocusHelperConnectors, NavigationDirection } from "./@ui/UiFocusManager/types.js";
export { UiLink } from "./@ui/UiLink/UiLink.js";
export type { IUiLinkProps } from "./@ui/UiLink/UiLink.js";
export type {
    IAccessibilityConfigBase,
    IMenuAccessibilityConfig,
    IMenuContainerAccessibilityConfig,
} from "./typings/accessibility.js";
export { UiListbox } from "./@ui/UiListbox/UiListbox.js";
export { DefaultUiListboxInteractiveItemComponent } from "./@ui/UiListbox/defaults/DefaultUiListboxInteractiveItemComponent.js";
export {
    separatorStaticItem,
    DefaultUiListboxStaticItemComponent,
} from "./@ui/UiListbox/defaults/DefaultUiListboxStaticItemComponent.js";
export type {
    UiListboxProps,
    IUiListboxContext,
    IUiListboxItem,
    IUiListboxStaticItem,
    UiListboxStaticItemProps,
    IUiListboxInteractiveItem,
    UiListboxInteractiveItemProps,
    UiListboxAriaAttributes,
} from "./@ui/UiListbox/types.js";
export { UiLeveledTreeview, UiStaticTreeview } from "./@ui/UiTreeview/UiTreeview.js";
export {
    UiTreeViewEventsProvider,
    useUiTreeViewEventPublisher,
    useUiTreeViewEventSubscriber,
    type UiTreeViewEventType,
    type UiTreeViewEvents,
} from "./@ui/UiTreeview/UiTreeViewEvents.js";
export { DefaultUiTreeViewItemComponent } from "./@ui/UiTreeview/defaults/DefaultUiTreeViewItemComponent.js";
export type {
    IUiStaticTreeViewProps,
    IUiTreeViewItem,
    IUiLeveledTreeViewProps,
    IUiTreeviewItemProps,
    IUiTreeViewProps,
    IUiTreeviewContext,
    IUiTreeViewSelectionMods,
    OnLeveledSelectFn,
    OnStaticSelectFn,
    UiStaticTreeView,
    UiLeveledTreeView,
    LevelTypesUnion,
    UiRefsTree,
    UiStateTreeItem,
    UiTreeViewAriaAttributes,
    UiTreeViewItemAriaAttributes,
    UiTreeViewAddLevel,
    UiTreeViewNode,
    UiTreeViewTree,
} from "./@ui/UiTreeview/types.js";

export { UiMenu } from "./@ui/UiMenu/UiMenu.js";
export {
    DefaultUiMenuInteractiveItem,
    DefaultUiMenuInteractiveItemWrapper,
} from "./@ui/UiMenu/components/defaults/DefaultUiMenuInteractiveItem.js";
export { DefaultUiMenuStaticItem } from "./@ui/UiMenu/components/defaults/DefaultUiMenuStaticItem.js";
export { DefaultUiMenuHeader } from "./@ui/UiMenu/components/defaults/DefaultUiMenuHeader.js";
export { DefaultUiMenuContent } from "./@ui/UiMenu/components/defaults/DefaultUiMenuContent.js";
export {
    DefaultUiMenuContentItem,
    DefaultUiMenuContentItemWrapper,
} from "./@ui/UiMenu/components/defaults/DefaultUiMenuContentItem.js";
export { DefaultUiMenuGroupItem } from "./@ui/UiMenu/components/defaults/DefaultUiMenuGroupItem.js";
export { typedUiMenuContextStore, getSelectedMenuId } from "./@ui/UiMenu/context.js";
export {
    getItemInteractiveParent,
    getSiblingItems,
    getNextSiblings,
    getPreviousSiblings,
    getClosestFocusableSibling,
    unwrapGroupItems,
    findItem,
    getItem,
    findInteractiveItem,
    getInteractiveItem,
    getItemsByInteractiveParent,
} from "./@ui/UiMenu/itemUtils.js";
export type {
    UiMenuProps,
    IUiMenuContext,
    IUiMenuItem,
    IUiMenuFocusableItem,
    IUiMenuStaticItem,
    IUiMenuStaticItemProps,
    IUiMenuInteractiveItem,
    IUiMenuInteractiveItemProps,
    IUiMenuGroupItem,
    IUiMenuGroupItemProps,
    IUiMenuInteractiveItemWrapperProps,
    IUiMenuContentItem,
    IUiMenuContentItemWrapperProps,
    IUiMenuContentItemProps,
    IUiMenuContentProps,
    IUiMenuItemProps,
    IUiMenuControlType,
    IUiMenuPluggableComponents,
    IUiMenuItemData,
} from "./@ui/UiMenu/types.js";
export { UiTabs } from "./@ui/UiTabs/UiTabs.js";
export type { UiTabsProps, UiTab, UiTabsAccessibilityConfig } from "./@ui/UiTabs/UiTabs.js";
export { UiTooltip } from "./@ui/UiTooltip/UiTooltip.js";
export type { UiTooltipProps, TooltipArrowPlacement } from "./@ui/UiTooltip/types.js";
export { UiDropdownIconButton } from "./@ui/UiDropdownIconButton/UiDropdownIconButton.js";
export type { UiDropdownIconButtonProps } from "./@ui/UiDropdownIconButton/UiDropdownIconButton.js";
export { UiBadge } from "./@ui/UiBadge/UiBadge.js";
export type { UiBadgeProps } from "./@ui/UiBadge/UiBadge.js";

export {
    makeMenuKeyboardNavigation,
    makeLinearKeyboardNavigation,
    makeKeyboardNavigation,
    makeTabsKeyboardNavigation,
    makeHorizontalKeyboardNavigation,
    modifierNegator,
} from "./@ui/@utils/keyboardNavigation.js";
export type { IHandleActionOptions, IModifier } from "./@ui/@utils/keyboardNavigation.js";
export { useKeyboardNavigationTarget } from "./@ui/@utils/useKeyboardNavigationTarget.js";
export type { IUseKeyboardNavigationTargetProps } from "./@ui/@utils/useKeyboardNavigationTarget.js";

export {
    useListWithActionsKeyboardNavigation,
    SELECT_ITEM_ACTION,
} from "./@ui/hooks/useListWithActionsKeyboardNavigation.js";

export { UiNavigationBypass } from "./@ui/UiNavigationBypass/UiNavigationBypass.js";
export type {
    IUiNavigationBypassProps,
    IUiNavigationItem,
} from "./@ui/UiNavigationBypass/UiNavigationBypass.js";

export type {
    UiAsyncTableProps,
    UiAsyncTableColumn,
    UiAsyncTableFilter,
    UiAsyncTableFilterOption,
    UiAsyncTableBulkAction,
    UiAsyncTableMenuRenderer,
} from "./@ui/UiAsyncTable/types.js";

export type { UiAsyncTableTitleProps, UiAsyncTableTitleAction } from "./@ui/UiAsyncTable/types.js";

export { UiAsyncTable } from "./@ui/UiAsyncTable/UiAsyncTable/UiAsyncTable.js";
export { UiAsyncTableTitle } from "./@ui/UiAsyncTable/UiAsyncTableTitle/UiAsyncTableTitle.js";

export { UiTags } from "./@ui/UiTags/UiTags.js";
export type { UiTagsProps, UiTagDef } from "./@ui/UiTags/types.js";

export { UiTag } from "./@ui/UiTag/UiTag.js";
export type { UiTagProps, IUiTagAccessibilityConfig } from "./@ui/UiTag/UiTag.js";

export { UiPopover } from "./@ui/UiPopover/UiPopover.js";
export type { UiPopoverProps } from "./@ui/UiPopover/UiPopover.js";

export {
    UiSearchResultsAnnouncement,
    DETAILED_ANNOUNCEMENT_THRESHOLD,
} from "./@ui/UiSearchResultsAnnouncement/UiSearchResultsAnnouncement.js";
export type { ISearchResultsAnnouncementProps } from "./@ui/UiSearchResultsAnnouncement/UiSearchResultsAnnouncement.js";

export { UiDate } from "./@ui/UiDate/UiDate.js";
export type { UiDateProps } from "./@ui/UiDate/UiDate.js";
