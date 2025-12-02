// (C) 2025 GoodData Corporation

import { ComponentProps, ComponentType, HTMLAttributes, ReactNode, RefCallback, RefObject } from "react";

import { EmptyObject } from "@gooddata/util";

import { IDropdownButtonRenderProps } from "../../Dropdown/index.js";
import { IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { SizeLarge, SizeMedium, SizeSmall } from "../@types/size.js";
import { SELECT_ITEM_ACTION } from "../hooks/useListWithActionsKeyboardNavigation.js";
import { separatorStaticItem } from "../UiListbox/defaults/DefaultUiListboxStaticItemComponent.js";

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
        focusedAction?: typeof SELECT_ITEM_ACTION | "selectTabActions";
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
