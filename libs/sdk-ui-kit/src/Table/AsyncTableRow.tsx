// (C) 2025 GoodData Corporation

import React, { useCallback } from "react";
import { e } from "./asyncTableBem.js";
import { AsyncTableCheckbox } from "./AsyncTableCheckbox.js";
import { UiIconButton } from "../@ui/UiIconButton/UiIconButton.js";
import { Dropdown } from "../Dropdown/Dropdown.js";
import { MENU_COLUMN_WIDTH } from "./constants.js";
import { useIntl } from "react-intl";
import { messages } from "./locales.js";
import { IAsyncTableRowProps, IColumn } from "./types.js";

export function AsyncTableRow<T extends { id: string }>({
    item,
    columns,
    onSelect,
    isSelected,
    hasCheckbox,
}: IAsyncTableRowProps<T>) {
    const { renderCellContent } = useRenderCellContent<T>();

    return (
        <div className={e("row")}>
            {hasCheckbox ? <AsyncTableCheckbox checked={isSelected} onChange={() => onSelect(item)} /> : null}
            {columns.map((column, index) => {
                const { bold, renderMenu, width: widthProp } = column;
                const width = renderMenu ? MENU_COLUMN_WIDTH : widthProp;
                const key = index;
                return (
                    <div style={{ width }} key={key} className={e("cell", { bold })}>
                        {renderCellContent(column, item)}
                    </div>
                );
            })}
        </div>
    );
}

const useRenderCellContent = <T extends { id: string }>() => {
    const intl = useIntl();

    const renderRoleIconWithWrapper = useCallback((renderRoleIcon: (item: T) => React.ReactNode, item: T) => {
        return renderRoleIcon ? <div className={e("role-icon")}>{renderRoleIcon(item)}</div> : null;
    }, []);

    const renderBadgeWithWrapper = useCallback((renderBadge: (item: T) => React.ReactNode, item: T) => {
        return renderBadge ? <div className={e("badge")}>{renderBadge(item)}</div> : null;
    }, []);

    const renderPrefixIconWithWrapper = useCallback(
        (renderPrefixIcon: (item: T) => React.ReactNode, item: T) => {
            return renderPrefixIcon ? <div className={e("prefix-icon")}>{renderPrefixIcon(item)}</div> : null;
        },
        [],
    );

    const renderSuffixIconWithWrapper = useCallback(
        (renderSuffixIcon: (item: T) => React.ReactNode, item: T) => {
            return renderSuffixIcon ? <div className={e("suffix-icon")}>{renderSuffixIcon(item)}</div> : null;
        },
        [],
    );

    const renderMenuIcon = useCallback(
        (renderMenu: (item: T) => React.ReactNode, item: T) => {
            const label = intl.formatMessage(messages.moreActions);
            return (
                <Dropdown
                    renderButton={({ toggleDropdown, isOpen }) => (
                        <UiIconButton
                            size="xlarge"
                            icon="ellipsis"
                            label={label}
                            variant="table"
                            onClick={() => toggleDropdown()}
                            isActive={isOpen}
                            accessibilityConfig={{
                                ariaLabel: label,
                            }}
                        />
                    )}
                    alignPoints={[{ align: "br tr" }]}
                    renderBody={() => renderMenu(item)}
                />
            );
        },
        [intl],
    );

    const renderCellContent = useCallback(
        (
            {
                renderButton,
                renderMenu,
                renderRoleIcon,
                renderPrefixIcon,
                renderSuffixIcon,
                renderBadge,
                key,
            }: IColumn<T>,
            item: T,
        ) => {
            const textContent = String(item[key]);

            if (renderButton) {
                return renderButton(item);
            }
            if (renderMenu) {
                return renderMenuIcon(renderMenu, item);
            }

            return (
                <>
                    {renderRoleIconWithWrapper(renderRoleIcon, item)}
                    {renderPrefixIconWithWrapper(renderPrefixIcon, item)}
                    <span title={textContent} className={e("text")}>
                        {textContent}
                    </span>
                    {renderSuffixIconWithWrapper(renderSuffixIcon, item)}
                    {renderBadgeWithWrapper(renderBadge, item)}
                </>
            );
        },
        [
            renderMenuIcon,
            renderRoleIconWithWrapper,
            renderPrefixIconWithWrapper,
            renderSuffixIconWithWrapper,
            renderBadgeWithWrapper,
        ],
    );

    return {
        renderCellContent,
    };
};
