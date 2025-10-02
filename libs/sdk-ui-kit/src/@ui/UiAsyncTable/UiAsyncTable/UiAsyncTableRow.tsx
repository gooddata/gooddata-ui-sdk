// (C) 2025 GoodData Corporation

import { ReactNode, useCallback } from "react";

import { useIntl } from "react-intl";

import { UiAsyncTableCheckbox } from "./UiAsyncTableCheckbox.js";
import { UiAsyncTableIconRenderer } from "./UiAsyncTableIconRenderer.js";
import { getColumnHeaderId, getColumnWidth, stopPropagationCallback } from "./utils.js";
import { WithConditionalAnchor } from "./WithConditionalAnchor.js";
import { Dropdown } from "../../../Dropdown/Dropdown.js";
import { UiIconButton } from "../../UiIconButton/UiIconButton.js";
import { e } from "../asyncTableBem.js";
import { messages } from "../locales.js";
import { UiAsyncTableColumn, UiAsyncTableMenuRenderer, UiAsyncTableRowProps } from "../types.js";

export function UiAsyncTableRow<T extends { id: string }>({
    item,
    columns,
    onSelect,
    onClick,
    isSelected,
    hasCheckbox,
    isLarge,
    accessibilityConfig,
}: UiAsyncTableRowProps<T>) {
    const { renderCellContent } = useRenderCellContent<T>({ isLarge });

    return (
        <div onClick={() => onClick?.(item)} className={e("row", { large: isLarge })} role="row">
            {hasCheckbox ? (
                <UiAsyncTableCheckbox
                    checked={isSelected}
                    onChange={() => onSelect(item)}
                    ariaLabel={accessibilityConfig?.getCheckboxItemAriaLabel?.(item)}
                />
            ) : null}
            {columns.map((column, index) => {
                const { bold, renderMenu, width: widthProp } = column;
                const width = getColumnWidth(!!renderMenu, isLarge, widthProp);
                const key = index;
                return (
                    <div
                        style={{ width }}
                        key={key}
                        className={e("cell", { bold, align: column.align })}
                        role="gridcell"
                        aria-labelledby={getColumnHeaderId(String(column.key ?? index))}
                    >
                        {renderCellContent(column, item)}
                    </div>
                );
            })}
        </div>
    );
}

const useRenderCellContent = <T extends { id: string }>({ isLarge }: { isLarge: boolean }) => {
    const intl = useIntl();

    const renderRoleIconWithWrapper = useCallback((renderRoleIcon: (item: T) => ReactNode, item: T) => {
        return (
            <UiAsyncTableIconRenderer renderIcon={renderRoleIcon} className={e("role-icon")} item={item} />
        );
    }, []);

    const renderBadgeWithWrapper = useCallback((renderBadge: (item: T) => ReactNode, item: T) => {
        return <UiAsyncTableIconRenderer renderIcon={renderBadge} className={e("badge")} item={item} />;
    }, []);

    const renderPrefixIconWithWrapper = useCallback((renderPrefixIcon: (item: T) => ReactNode, item: T) => {
        return (
            <UiAsyncTableIconRenderer
                renderIcon={renderPrefixIcon}
                className={e("prefix-icon")}
                item={item}
            />
        );
    }, []);

    const renderSuffixIconWithWrapper = useCallback((renderSuffixIcon: (item: T) => ReactNode, item: T) => {
        return (
            <UiAsyncTableIconRenderer
                renderIcon={renderSuffixIcon}
                className={e("suffix-icon")}
                item={item}
            />
        );
    }, []);

    const renderMenuIcon = useCallback(
        (renderMenu: UiAsyncTableMenuRenderer<T>, item: T) => {
            const label = intl.formatMessage(messages["moreActions"]);
            return (
                <Dropdown
                    renderButton={({ toggleDropdown, isOpen }) => {
                        const isDisabled = !renderMenu(item, () => toggleDropdown(false));
                        return (
                            <UiIconButton
                                size={isLarge ? "xxlarge" : "xlarge"}
                                icon="ellipsis"
                                label={label}
                                variant="table"
                                onClick={(e) => {
                                    stopPropagationCallback(e, toggleDropdown);
                                }}
                                isActive={isOpen}
                                isDisabled={isDisabled}
                                accessibilityConfig={{
                                    ariaLabel: label,
                                }}
                            />
                        );
                    }}
                    alignPoints={[{ align: "br tr" }]}
                    renderBody={({ closeDropdown }) => renderMenu(item, closeDropdown)}
                />
            );
        },
        [intl, isLarge],
    );

    const renderTextContent = useCallback(
        (
            item: T,
            key: keyof T | undefined,
            titleProvided: boolean,
            getTextContent: ((item: T) => string | ReactNode) | undefined,
            getMultiLineTextContent: ((item: T) => Array<string>) | undefined,
            renderSuffixIcon: ((item: T) => ReactNode) | undefined,
        ) => {
            if (getMultiLineTextContent) {
                return getMultiLineTextContent(item).map((line, index) => (
                    <span
                        title={titleProvided ? undefined : line}
                        className={e("text-line", { first: index === 0 })}
                        key={index}
                    >
                        <span className={e("text-line-content")}>{line}</span>
                        {renderSuffixIcon && index === 0
                            ? renderSuffixIconWithWrapper(renderSuffixIcon, item)
                            : null}
                    </span>
                ));
            }
            if (getTextContent) {
                return getTextContent(item);
            }
            return String(item[key]);
        },
        [renderSuffixIconWithWrapper],
    );

    const renderTextContentWithWrapper = useCallback(
        (
            item: T,
            key: keyof T | undefined,
            getTextContent: ((item: T) => string | ReactNode) | undefined,
            getMultiLineTextContent: ((item: T) => Array<string>) | undefined,
            getTextTitle: ((item: T) => string) | undefined,
            getTextHref: ((item: T) => string) | undefined,
            renderSuffixIcon: ((item: T) => ReactNode) | undefined,
        ) => {
            const textContent = renderTextContent(
                item,
                key,
                !!getTextTitle,
                getTextContent,
                getMultiLineTextContent,
                renderSuffixIcon,
            );
            const title = getTextTitle
                ? getTextTitle(item)
                : typeof textContent === "string"
                  ? textContent
                  : "";
            return (
                <WithConditionalAnchor href={getTextHref?.(item)}>
                    <div title={title} className={e("text", { "multi-line": !!getMultiLineTextContent })}>
                        {textContent}
                    </div>
                </WithConditionalAnchor>
            );
        },
        [renderTextContent],
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
                getTextContent,
                getMultiLineTextContent,
                getTextTitle,
                getTextHref,
                key,
            }: UiAsyncTableColumn<T>,
            item: T,
        ) => {
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
                    {renderTextContentWithWrapper(
                        item,
                        key,
                        getTextContent,
                        getMultiLineTextContent,
                        getTextTitle,
                        getTextHref,
                        renderSuffixIcon,
                    )}
                    {renderBadgeWithWrapper(renderBadge, item)}
                    {getMultiLineTextContent ? null : renderSuffixIconWithWrapper(renderSuffixIcon, item)}
                </>
            );
        },
        [
            renderMenuIcon,
            renderRoleIconWithWrapper,
            renderPrefixIconWithWrapper,
            renderSuffixIconWithWrapper,
            renderBadgeWithWrapper,
            renderTextContentWithWrapper,
        ],
    );

    return {
        renderCellContent,
    };
};
