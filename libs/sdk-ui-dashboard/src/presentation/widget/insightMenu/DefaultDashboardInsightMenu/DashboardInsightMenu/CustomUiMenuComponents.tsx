// (C) 2025 GoodData Corporation
import React, { ReactElement } from "react";
import cx from "classnames";
import {
    IUiMenuInteractiveItemProps,
    DefaultUiMenuHeader,
    typedUiMenuContextStore,
    getItemInteractiveParent,
    UiIconButton,
    IUiMenuContentItemProps,
    DefaultUiMenuContent,
    IUiMenuContentProps,
} from "@gooddata/sdk-ui-kit";
import { DashboardInsightMenuItemButton } from "./DashboardInsightMenuItemButton.js";
import { DashboardInsightMenuTitle } from "../../DashboardInsightMenuTitle.js";
import { IDashboardInsightMenuTitleProps } from "../../types.js";
import { useIntl } from "react-intl";
import { DashboardInsightSubmenuContainer } from "./DashboardInsightSubmenuContainer.js";

export type FocusableItemData = {
    icon?: ReactElement | string;
    className?: string;
    tooltip?: string | React.ReactNode;
    onClick?: (event: React.MouseEvent) => void;
    subMenu?: boolean;
    renderSubmenuComponentOnly?: boolean;
};

export type IMenuItemData = {
    interactive: FocusableItemData;
    content: FocusableItemData;
};

export type IMenuData = IDashboardInsightMenuTitleProps;

const FocusableItemComponent: React.FC<{
    item: IUiMenuInteractiveItemProps<IMenuItemData>["item"] | IUiMenuContentItemProps<IMenuItemData>["item"];
    isFocused: boolean;
    onClick: (event: React.MouseEvent) => void;
}> = ({ item, isFocused, onClick }) => {
    const { id, isDisabled, stringTitle } = item;
    const { icon, className, subMenu, tooltip } = item.data ?? {};

    const itemClassName = cx("gd-menu-item", className, {
        "gd-ui-kit-menu__item--isFocused": isFocused,
        "is-disabled": isDisabled,
    });

    return (
        <DashboardInsightMenuItemButton
            key={id}
            itemId={id}
            itemName={stringTitle}
            disabled={isDisabled}
            submenu={subMenu}
            icon={icon}
            className={itemClassName}
            onClick={isDisabled ? undefined : onClick}
            tooltip={tooltip}
        />
    );
};

export const CustomUiMenuInteractiveItemComponent: React.FC<IUiMenuInteractiveItemProps<IMenuItemData>> = ({
    item,
    isFocused,
    onSelect,
}) => {
    return <FocusableItemComponent item={item} isFocused={isFocused} onClick={onSelect} />;
};

export const CustomUiMenuContentItemComponent: React.FC<IUiMenuContentItemProps<IMenuItemData>> = ({
    item,
    isFocused,
    onSelect,
}) => {
    return <FocusableItemComponent item={item} isFocused={isFocused} onClick={onSelect} />;
};

export const CustomUiMenuContentComponent: React.FC<IUiMenuContentProps<IMenuItemData>> = ({ item }) => {
    const { useContextStore, createSelector } = typedUiMenuContextStore<IMenuItemData>();
    const selector = createSelector((ctx) => ({
        onClose: ctx.onClose,
        setShownCustomContentItemId: ctx.setShownCustomContentItemId,
    }));

    const { onClose, setShownCustomContentItemId } = useContextStore(selector);

    const handleBack = React.useCallback(() => {
        setShownCustomContentItemId(undefined);
    }, [setShownCustomContentItemId]);

    if (item.showComponentOnly === true) {
        return <DefaultUiMenuContent item={item} />;
    }

    const itemWithoutDefaultHeader = {
        ...item,
        showComponentOnly: true,
    };

    return (
        <DashboardInsightSubmenuContainer title={item.stringTitle} onClose={onClose!} onBack={handleBack}>
            <DefaultUiMenuContent item={itemWithoutDefaultHeader} />
        </DashboardInsightSubmenuContainer>
    );
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
                dataId="s-configuration-panel-header-close-button"
                dataTestId="s-configuration-panel-header-close-button"
            />
        </div>
    ) : (
        <DefaultUiMenuHeader />
    );
};
