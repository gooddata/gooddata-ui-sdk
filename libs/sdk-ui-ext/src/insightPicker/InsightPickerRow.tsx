// (C) 2026 GoodData Corporation

import { type MouseEvent, useCallback } from "react";

import { InsightListItem } from "@gooddata/sdk-ui-kit";

import { InsightPickerMenu } from "./InsightPickerMenu.js";
import { type IInsightPickerItem, type IInsightPickerProps } from "./types.js";

interface IInsightPickerRowProps {
    entry: IInsightPickerItem;
    type: string;
    width: number;
    isSelected: boolean;
    hasMenu: boolean;
    enableDescriptions?: boolean;
    metadataTimeZone?: string;
    menuActions?: IInsightPickerProps["menuActions"];
    renderMenu?: IInsightPickerProps["renderMenu"];
    onItemClick: (entry: IInsightPickerItem) => void;
    onDescriptionPanelOpen?: (description: string) => void;
}

export function InsightPickerRow({
    entry,
    type,
    width,
    isSelected,
    hasMenu,
    enableDescriptions,
    metadataTimeZone,
    menuActions,
    renderMenu,
    onItemClick,
    onDescriptionPanelOpen,
}: IInsightPickerRowProps) {
    const handleRowClick = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            const target = e.target as HTMLElement;
            if (target.closest('[data-id="menu-button"]')) {
                return;
            }
            onItemClick(entry);
        },
        [onItemClick, entry],
    );

    return (
        <div
            className={
                hasMenu
                    ? "gd-ui-ext-insight-picker-row gd-ui-ext-insight-picker-row--with-menu"
                    : "gd-ui-ext-insight-picker-row"
            }
            onClick={handleRowClick}
        >
            <InsightListItem
                title={entry.title}
                description={entry.description?.trim()}
                showDescriptionPanel={enableDescriptions}
                type={type}
                width={hasMenu ? width - 36 : width}
                updated={entry.updated ?? entry.created}
                isLocked={entry.isLocked}
                isSelected={isSelected}
                onDescriptionPanelOpen={
                    onDescriptionPanelOpen ? () => onDescriptionPanelOpen(entry.description ?? "") : undefined
                }
                metadataTimeZone={metadataTimeZone}
            />
            {hasMenu ? (
                <InsightPickerMenu item={entry} menuActions={menuActions} renderMenu={renderMenu} />
            ) : null}
        </div>
    );
}
