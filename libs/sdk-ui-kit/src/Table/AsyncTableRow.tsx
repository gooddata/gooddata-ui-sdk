// (C) 2025 GoodData Corporation

import React, { useCallback } from "react";
import { e } from "./asyncTableBem.js";
import { AsyncTableCheckbox } from "./AsyncTableCheckbox.js";
import { UiIconButton } from "../@ui/UiIconButton/UiIconButton.js";
import { Dropdown } from "../Dropdown/Dropdown.js";
import { useIntl } from "react-intl";
import { messages } from "./locales.js";
import { IAsyncTableRowProps, IColumn } from "./types.js";
import { getColumnWidth } from "./utils.js";

export function AsyncTableRow<T extends { id: string }>({
    item,
    columns,
    onSelect,
    isSelected,
    hasCheckbox,
    isLarge,
}: IAsyncTableRowProps<T>) {
    const { renderCellContent } = useRenderCellContent<T>({ isLarge });

    return (
        <div className={e("row", { large: isLarge })}>
            {hasCheckbox ? <AsyncTableCheckbox checked={isSelected} onChange={() => onSelect(item)} /> : null}
            {columns.map((column, index) => {
                const { bold, renderMenu, width: widthProp } = column;
                const width = getColumnWidth(!!renderMenu, isLarge, widthProp);
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

const useRenderCellContent = <T extends { id: string }>({ isLarge }: { isLarge: boolean }) => {
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
                            size={isLarge ? "xxlarge" : "xlarge"}
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
        [intl, isLarge],
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
                getMultiLineContent,
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
                    <div title={textContent} className={e("text", { "multi-line": !!getMultiLineContent })}>
                        {getMultiLineContent
                            ? getMultiLineContent(item).map((line, index) => <span key={index}>{line}</span>)
                            : textContent}
                    </div>
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
