// (C) 2025-2026 GoodData Corporation

import { type MouseEvent, useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";

import { Dropdown, type IUiMenuItem, UiButton, UiIconButton, UiMenu } from "@gooddata/sdk-ui-kit";

import { catalogDetailActionsTrigger } from "../automation/testIds.js";
import type { ICatalogItem } from "../catalogItem/types.js";

import type { EditHandlerEvent, ICatalogDetailAction } from "./types.js";

const messages = defineMessages({
    actionsMenuAriaLabel: { id: "analyticsCatalog.catalogItem.actionsMenu.ariaLabel" },
});

type DetailActionMenuItemData = {
    interactive: { id: string; dataTestId?: string };
};

export type ICatalogDetailActionBarProps = {
    item: ICatalogItem;
    workspaceId: string;
    actions: ICatalogDetailAction[];
    onEditClick?: (event: MouseEvent, editClickEvent: EditHandlerEvent) => void;
    onActionsMenuSelect: (actionId: string) => void;
};

/**
 * Detail action bar: primary Edit button plus an optional item actions menu.
 */
export function CatalogDetailActionBar({
    item,
    workspaceId,
    actions,
    onEditClick,
    onActionsMenuSelect,
}: ICatalogDetailActionBarProps) {
    const intl = useIntl();

    const actionsMenuItems = useMemo((): IUiMenuItem<DetailActionMenuItemData>[] => {
        return actions.map((action) => ({
            type: "interactive",
            id: action.id,
            stringTitle: action.label,
            data: { id: action.id, dataTestId: action.dataTestId },
            isDestructive: action.isDestructive,
        }));
    }, [actions]);

    return (
        <div className="gd-analytics-catalog-detail__detail-actions">
            <UiButton
                label={intl.formatMessage({ id: "analyticsCatalog.edit" })}
                variant="primary"
                size="medium"
                onClick={(event) => {
                    onEditClick?.(event, {
                        item,
                        workspaceId,
                        newTab: event.metaKey || event.ctrlKey,
                        preventDefault: event.preventDefault.bind(event),
                    });
                }}
            />
            <Dropdown
                alignPoints={[{ align: "br tr" }]}
                renderButton={({ toggleDropdown, buttonRef, ariaAttributes, accessibilityConfig }) => (
                    <UiIconButton
                        ref={(element) => {
                            buttonRef.current = element;
                        }}
                        icon="ellipsis"
                        variant="secondary"
                        size="medium"
                        onClick={toggleDropdown}
                        dataTestId={catalogDetailActionsTrigger}
                        accessibilityConfig={{
                            ...accessibilityConfig,
                            ariaLabel: intl.formatMessage(messages.actionsMenuAriaLabel, {
                                name: item.title || item.identifier,
                            }),
                            ariaExpanded: ariaAttributes["aria-expanded"],
                            ariaHaspopup: ariaAttributes["aria-haspopup"],
                            ariaControls: ariaAttributes["aria-controls"],
                        }}
                    />
                )}
                renderBody={({ closeDropdown, ariaAttributes }) => (
                    <UiMenu
                        items={actionsMenuItems}
                        minWidth={140}
                        onClose={closeDropdown}
                        onSelect={(menuItem) => {
                            closeDropdown();
                            onActionsMenuSelect(menuItem.data.id);
                        }}
                        ariaAttributes={ariaAttributes}
                        itemDataTestId={getItemDataTestId}
                        containerTopPadding="small"
                        containerBottomPadding="small"
                    />
                )}
                closeOnEscape
                autofocusOnOpen
            />
        </div>
    );
}

function getItemDataTestId(menuItem: IUiMenuItem<DetailActionMenuItemData>): string | undefined {
    return menuItem.type === "interactive" ? menuItem.data.dataTestId : undefined;
}
