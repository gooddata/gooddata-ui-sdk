// (C) 2025 GoodData Corporation

import { MouseEvent, ReactElement, ReactNode, useCallback } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import {
    DefaultUiMenuContent,
    DefaultUiMenuHeader,
    IUiMenuContentItemProps,
    IUiMenuContentProps,
    IUiMenuInteractiveItemProps,
    UiIconButton,
    getItemInteractiveParent,
    typedUiMenuContextStore,
} from "@gooddata/sdk-ui-kit";

import { DashboardInsightMenuItemButton } from "./DashboardInsightMenuItemButton.js";
import { DashboardInsightSubmenuContainer } from "./DashboardInsightSubmenuContainer.js";
import { DashboardInsightMenuTitle } from "../../DashboardInsightMenuTitle.js";
import { IDashboardInsightMenuTitleProps } from "../../types.js";

export type FocusableItemData = {
    icon?: ReactElement | string;
    className?: string;
    tooltip?: string | ReactNode;
    onClick?: (event: MouseEvent) => void;
    subMenu?: boolean;
    renderSubmenuComponentOnly?: boolean;
};

export type IMenuItemData = {
    interactive: FocusableItemData;
    content: FocusableItemData;
};

export type IMenuData = IDashboardInsightMenuTitleProps;

function FocusableItemComponent({
    item,
    isFocused,
    onClick,
}: {
    item: IUiMenuInteractiveItemProps<IMenuItemData>["item"] | IUiMenuContentItemProps<IMenuItemData>["item"];
    isFocused: boolean;
    onClick: (event: MouseEvent) => void;
}) {
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
            isFocused={isFocused}
        />
    );
}

export function CustomUiMenuInteractiveItemComponent({
    item,
    isFocused,
    onSelect,
}: IUiMenuInteractiveItemProps<IMenuItemData>) {
    return <FocusableItemComponent item={item} isFocused={isFocused} onClick={onSelect} />;
}

export function CustomUiMenuContentItemComponent({
    item,
    isFocused,
    onSelect,
}: IUiMenuContentItemProps<IMenuItemData>) {
    return <FocusableItemComponent item={item} isFocused={isFocused} onClick={onSelect} />;
}

export function CustomUiMenuContentComponent({ item }: IUiMenuContentProps<IMenuItemData>) {
    const { useContextStore, createSelector } = typedUiMenuContextStore<IMenuItemData>();
    const selector = createSelector((ctx) => ({
        onClose: ctx.onClose,
        setShownCustomContentItemId: ctx.setShownCustomContentItemId,
    }));

    const { onClose, setShownCustomContentItemId } = useContextStore(selector);

    const handleBack = useCallback(() => {
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
}

export function CustomUiMenuHeaderComponent() {
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
}
