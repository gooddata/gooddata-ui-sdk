// (C) 2025-2026 GoodData Corporation

import {
    type ComponentProps,
    type ComponentType,
    type HTMLAttributes,
    type ReactNode,
    type RefCallback,
    type RefObject,
} from "react";

import { type EmptyObject } from "@gooddata/util";

import { type IDropdownButtonRenderProps } from "../../Dropdown/Dropdown.js";
import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { type SizeLarge, type SizeMedium, type SizeSmall } from "../@types/size.js";
import { type separatorStaticItem } from "../UiListbox/defaults/DefaultUiListboxStaticItemComponent.js";

/**
 * @internal
 */
export type IUiTabAction<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
> = {
    id: string;
    label: string;
    isDisabled?: boolean;
    isDestructive?: boolean;
    tooltip?: ReactNode;
    tooltipWidth?: number;
    onSelect?: (context: { tab: IUiTab<TTabProps, TTabActionProps> }) => void;
    /**
     * Whether to close the dropdown when the action is selected.
     * - "actions" - close actions menu when action is selected
     * - "all" - close actions menu and possibly all tabs list when action is selected
     * - false - do not close anything when action is selected
     *
     * @defaultValue "actions"
     */
    closeOnSelect?: "actions" | "all" | false;
    iconRight?: ReactNode;
    iconLeft?: ReactNode;
    dataTestId?: string;
} & TTabActionProps;

/**
 * @internal
 */
export type IUiTab<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
> = {
    id: string;
    label: string;
    /**
     * @defaultValue "default"
     */
    variant?: "default" | "placeholder";
    /**
     * Optional DOM id for the tab button.
     */
    tabId?: string;
    /**
     * Optional id of the tabpanel controlled by this tab.
     */
    panelId?: string;
    /**
     * When true, focusing the tab will select it.
     */
    autoSelectOnFocus?: boolean;
    actions?: Array<IUiTabAction<TTabProps, TTabActionProps> | typeof separatorStaticItem>;
} & TTabProps;

/**
 * @internal
 */
export type IUiTabComponents<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
> = {
    Container: ComponentType;
    Tab: ComponentType<{
        tab: IUiTab<TTabProps, TTabActionProps>;
        isSelected: boolean;
        onSelect: () => void;
        /**
         * Whether this tab is the currently focused tab in keyboard navigation.
         * When true, the tab button and its actions button become tabbable (tabIndex=0).
         */
        isFocused?: boolean;
    }>;
    TabValue: ComponentType<{
        tab: IUiTab<TTabProps, TTabActionProps>;
        isSelected: boolean;
        location: "tabs" | "allList";
    }>;
    TabActions: ComponentType<{
        tab: IUiTab<TTabProps, TTabActionProps>;
        location: "tabs" | "allList";
        isOpen: boolean;
        onToggleOpen: (desiredState?: boolean) => void;
        tabIndex?: number;
        id?: string;
    }>;
    TabActionsButton: ComponentType<{
        tab: IUiTab<TTabProps, TTabActionProps>;
        isOpen: boolean;
        onClick: () => void;
        location: "tabs" | "allList";
        ariaAttributes?: IDropdownButtonRenderProps["ariaAttributes"];
        tabIndex?: number;
        id?: string;
    }>;
    AllTabs: ComponentType;
    AllTabsButton: ComponentType<{
        isOpen: boolean;
        onClick: () => void;
        ref?: RefObject<HTMLElement>;
        ariaAttributes?: IDropdownButtonRenderProps["ariaAttributes"];
    }>;
};

/**
 * @internal
 */
export type IUiTabComponentProps<
    TComponent extends keyof IUiTabComponents<TTabProps, TTabActionProps>,
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
> = ComponentProps<IUiTabComponents<TTabProps, TTabActionProps>[TComponent]>;

/**
 * @internal
 */
export type IUiTabActionEventContext<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
> = {
    action: IUiTabAction<TTabProps, TTabActionProps>;
    tab: IUiTab<TTabProps, TTabActionProps>;
    location: "tabs" | "allList";
};

/**
 * @internal
 */
export type IUiTabContext<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
> = Pick<
    IUiTabsProps<TTabProps, TTabActionProps>,
    | "tabs"
    | "selectedTabId"
    | "onTabSelect"
    | "size"
    | "accessibilityConfig"
    | "maxLabelLength"
    | "disableBottomBorder"
> & {
    isOverflowing: boolean;
    containerRef: RefCallback<Element>;
    onActionTriggered: (context: IUiTabActionEventContext<TTabProps, TTabActionProps>) => void;
    useActionListener: (
        callback: (context: IUiTabActionEventContext<TTabProps, TTabActionProps>) => void,
    ) => void;
} & IUiTabComponents<TTabProps, TTabActionProps>;

/**
 * @internal
 */
export type IUiTabsProps<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
> = {
    tabs: IUiTab<TTabProps, TTabActionProps>[];
    selectedTabId: string;
    onTabSelect: (tab: IUiTab<TTabProps, TTabActionProps>) => void;
    size?: SizeSmall | SizeMedium | SizeLarge;
    maxLabelLength?: number;
    accessibilityConfig?: IUiTabsAccessibilityConfig;
    /**
     * When true, disables the gray bottom border line.
     *
     * @defaultValue false
     */
    disableBottomBorder?: boolean;
} & Partial<IUiTabComponents<TTabProps, TTabActionProps>>;

/**
 * @internal
 */
export interface IUiTabsAccessibilityConfig extends IAccessibilityConfigBase {
    tabRole?: HTMLAttributes<HTMLElement>["role"];
}
