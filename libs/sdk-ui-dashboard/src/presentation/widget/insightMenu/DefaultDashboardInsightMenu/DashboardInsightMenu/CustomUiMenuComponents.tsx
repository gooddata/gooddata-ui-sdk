// (C) 2025 GoodData Corporation
import React, { ComponentType } from "react";
import cx from "classnames";
import {
    //Button,
    Separator,
    UiMenuInteractiveItemProps,
    UiMenuStaticItemProps,
    DefaultUiMenuHeader,
    typedUiMenuContextStore,
    getItemInteractiveParent,
    UiIconButton,
    UiMenuContentItemProps,
} from "@gooddata/sdk-ui-kit";
import { DashboardInsightMenuItemButton } from "./DashboardInsightMenuItemButton.js";
import { DashboardInsightMenuTitle } from "../../DashboardInsightMenuTitle.js";
import { IDashboardInsightMenuTitleProps, IInsightMenuSubmenuComponentProps } from "../../types.js";
import { useIntl } from "react-intl";

export type FocusableItemData = {
    icon?: JSX.Element | string;
    className?: string;
    tooltip?: string | React.ReactNode;
    onClick?: (event: React.MouseEvent) => void;
    subMenu?: boolean;
    renderSubmenuComponentOnly?: boolean;
};

export type IMenuItemData = {
    interactive: FocusableItemData;
    content: FocusableItemData;
    static: ISubmenuComponentData | null;
};

export type IMenuData = IDashboardInsightMenuTitleProps;

export interface ISubmenuComponentData {
    subMenuComponent: ComponentType<IInsightMenuSubmenuComponentProps>;
}

const FocusableItemComponent: React.FC<{
    id: string;
    title: string;
    isFocused: boolean;
    isDisabled?: boolean;
    className?: string;
    icon?: JSX.Element | string;
    subMenu?: boolean;
    onClick?: (event: React.MouseEvent) => void;
}> = ({ id, title, isDisabled, isFocused, className, icon, subMenu, onClick }) => {
    const itemClassName = cx("gd-menu-item", className, {
        "is-focused": isFocused,
        "gd-ui-kit-menu__item--isFocused": isFocused,
        "is-disabled": isDisabled,
    });

    return (
        <DashboardInsightMenuItemButton
            key={id}
            itemId={id}
            itemName={title}
            disabled={isDisabled}
            submenu={subMenu}
            icon={icon}
            className={itemClassName}
            onClick={isDisabled ? undefined : onClick}
        />
    );
};

export const CustomUiMenuInteractiveItemComponent: React.FC<UiMenuInteractiveItemProps<IMenuItemData>> = ({
    item,
    isFocused,
    onSelect,
}) => {
    const { icon, className, subMenu } = item.data ?? {};
    return (
        <FocusableItemComponent
            id={item.id}
            title={item.stringTitle}
            isDisabled={item.isDisabled}
            isFocused={isFocused}
            className={className}
            icon={icon}
            subMenu={subMenu}
            onClick={onSelect}
        />
    );
};

export const CustomUiMenuContentItemComponent: React.FC<UiMenuContentItemProps<IMenuItemData>> = ({
    item,
    isFocused,
    onSelect,
}) => {
    const { icon, className, subMenu } = item.data ?? {};

    return (
        <FocusableItemComponent
            id={item.id}
            title={item.stringTitle}
            isDisabled={item.isDisabled}
            isFocused={isFocused}
            className={className}
            icon={icon}
            subMenu={subMenu}
            onClick={onSelect}
        />
    );
};

export const CustomUiMenuStaticItemComponent: React.FC<UiMenuStaticItemProps<IMenuItemData>> = () => {
    return <Separator />;
};

export const CustomUiMenuHeaderComponent: React.FC = () => {
    const { formatMessage } = useIntl();
    const { useContextStore, createSelector } = typedUiMenuContextStore<IMenuItemData, IMenuData>();
    const selector = createSelector((ctx) => ({
        menuCtxData: ctx.menuCtxData,
        onClose: ctx.onClose,
        parentItem: ctx.focusedItem ? getItemInteractiveParent(ctx.items, ctx.focusedItem.id) : undefined,
    }));
    const { menuCtxData, parentItem, onClose } = useContextStore(selector);

    if (parentItem?.data.renderSubmenuComponentOnly) {
        return null;
    }

    return !parentItem && menuCtxData ? (
        <div className="insight-configuration-panel-header">
            <DashboardInsightMenuTitle
                widget={menuCtxData.widget}
                insight={menuCtxData.insight}
                renderMode={menuCtxData.renderMode}
            />
            <UiIconButton
                size={"xsmall"}
                variant={"tertiary"}
                icon={"close"}
                label={formatMessage({ id: "menu.close" })}
                onClick={onClose}
            />
        </div>
    ) : (
        <DefaultUiMenuHeader />
    );
};
