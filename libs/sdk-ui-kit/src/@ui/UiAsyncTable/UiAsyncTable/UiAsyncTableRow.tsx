// (C) 2025-2026 GoodData Corporation

import { type MouseEvent, type ReactNode, type Ref, useCallback } from "react";

import { UiAsyncTableCheckbox } from "./UiAsyncTableCheckbox.js";
import { UiAsyncTableIconRenderer } from "./UiAsyncTableIconRenderer.js";
import { getColumnWidth, getRowLabelId } from "./utils.js";
import { WithConditionalAnchor } from "./WithConditionalAnchor.js";
import { Dropdown } from "../../../Dropdown/Dropdown.js";
import { UiIconButton } from "../../UiIconButton/UiIconButton.js";
import { e } from "../asyncTableBem.js";
import {
    type IUiAsyncTableColumn,
    type IUiAsyncTableColumnAccessibilityConfig,
    type IUiAsyncTableRowProps,
    type UiAsyncTableMenuRenderer,
} from "../types.js";

export function UiAsyncTableRow<T extends { id: string }>({
    item,
    itemIndex,
    columns,
    onSelect,
    onClick,
    isSelected,
    hasCheckbox,
    isLarge,
    isFocused,
    focusedColumnIndex,
    focusedElementRef,
    accessibilityConfig,
}: IUiAsyncTableRowProps<T>) {
    const { renderCellContent } = useRenderCellContent<T>({ isLarge: isLarge ?? false });
    const isRowFocused = isFocused && focusedColumnIndex === undefined;

    const handleRowClick = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            // Check if the click originated from a menu button
            // We can't stop event propagation on dropdown button as we would lose
            // dropdown closeOnOutsideClick functionality, causing menu dropdowns to overlap
            const target = e.target as HTMLElement;
            if (target.closest('[data-id="menu-button"]')) {
                return;
            }
            if (item) {
                onClick?.(item);
            }
        },
        [onClick, item],
    );

    return (
        <div
            onClick={handleRowClick}
            className={e("row", {
                large: isLarge ?? false,
                focused: isRowFocused ?? false,
                active: !!onClick,
            })}
            ref={isRowFocused ? (focusedElementRef as Ref<HTMLDivElement>) : undefined}
            role="row"
            aria-labelledby={getRowLabelId(itemIndex)}
        >
            {hasCheckbox && item ? (
                <UiAsyncTableCheckbox
                    checked={isSelected}
                    onChange={() => onSelect?.(item)}
                    ariaLabel={accessibilityConfig?.getCheckboxItemAriaLabel?.(item)}
                    isCellFocused={isFocused ? focusedColumnIndex === 0 : undefined}
                    cellRef={isFocused && focusedColumnIndex === 0 ? focusedElementRef : undefined}
                />
            ) : null}
            {columns.map((column, index) => {
                const { bold, renderMenu, width: widthProp } = column;
                const width = getColumnWidth(!!renderMenu, isLarge ?? false, widthProp);
                const totalColumnIndex = index + (hasCheckbox ? 1 : 0);
                const isCellFocused = isFocused && focusedColumnIndex === totalColumnIndex;
                const labelId = index === 0 ? getRowLabelId(itemIndex) : undefined;
                return (
                    <div
                        style={{ width }}
                        key={index}
                        className={e("cell", {
                            bold: bold ?? false,
                            align: column.align ?? false,
                            focused: isCellFocused ?? false,
                        })}
                        role="gridcell"
                    >
                        {item
                            ? renderCellContent(
                                  column,
                                  labelId,
                                  item,
                                  focusedElementRef ?? (() => {}),
                                  isCellFocused ?? false,
                              )
                            : null}
                    </div>
                );
            })}
        </div>
    );
}

const useRenderCellContent = <T extends { id: string }>({ isLarge }: { isLarge: boolean }) => {
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
        (
            renderMenu: UiAsyncTableMenuRenderer<T>,
            accessibilityConfig: IUiAsyncTableColumnAccessibilityConfig,
            item: T,
            focusedElementRef: Ref<HTMLElement>,
            isCellFocused: boolean,
        ) => {
            const label = accessibilityConfig?.ariaLabel;
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
                                onClick={toggleDropdown}
                                dataId="menu-button"
                                dataTestId="more"
                                isActive={isOpen}
                                isDisabled={isDisabled}
                                tabIndex={-1}
                                accessibilityConfig={{
                                    ariaHaspopup: true,
                                    ariaExpanded: isOpen,
                                    ariaLabel: label,
                                }}
                                ref={
                                    isCellFocused ? (focusedElementRef as Ref<HTMLButtonElement>) : undefined
                                }
                            />
                        );
                    }}
                    alignPoints={[{ align: "br tr" }]}
                    renderBody={({ closeDropdown }) => renderMenu(item, closeDropdown)}
                />
            );
        },
        [isLarge],
    );

    const renderTextContent = useCallback(
        (
            item: T,
            key: keyof T | undefined,
            labelId: string | undefined,
            getTextContent: ((item: T) => string | ReactNode) | undefined,
            getMultiLineTextContent: ((item: T) => Array<string>) | undefined,
            renderSuffixIcon: ((item: T) => ReactNode) | undefined,
        ) => {
            if (getMultiLineTextContent) {
                return getMultiLineTextContent(item).map((line, index) => {
                    const isFirst = index === 0;
                    return (
                        <span className={e("text-line", { first: isFirst })} key={index}>
                            <span id={isFirst ? labelId : undefined} className={e("text-line-content")}>
                                {line}
                            </span>
                            {renderSuffixIcon && isFirst
                                ? renderSuffixIconWithWrapper(renderSuffixIcon, item)
                                : null}
                        </span>
                    );
                });
            }
            if (getTextContent) {
                return <span id={labelId}>{getTextContent(item)}</span>;
            }
            return key === undefined ? "" : String(item[key]);
        },
        [renderSuffixIconWithWrapper],
    );

    const renderTextContentWithWrapper = useCallback(
        (
            item: T,
            key: keyof T | undefined,
            labelId: string | undefined,
            getTextContent: ((item: T) => string | ReactNode) | undefined,
            getMultiLineTextContent: ((item: T) => Array<string>) | undefined,
            getTextTitle: ((item: T) => string) | undefined,
            getTextHref: ((item: T) => string | undefined) | undefined,
            renderSuffixIcon: ((item: T) => ReactNode) | undefined,
            focusedElementRef: Ref<HTMLElement>,
            isCellFocused: boolean,
        ) => {
            const textContent = renderTextContent(
                item,
                key,
                labelId,
                getTextContent,
                getMultiLineTextContent,
                renderSuffixIcon,
            );
            const title = getTextTitle
                ? getTextTitle(item)
                : typeof textContent === "string"
                  ? textContent
                  : "";

            const isActive = !!getTextHref;
            return (
                <WithConditionalAnchor href={getTextHref?.(item)}>
                    <div
                        title={title}
                        ref={
                            isActive && isCellFocused ? (focusedElementRef as Ref<HTMLDivElement>) : undefined
                        }
                        className={e("text", { "multi-line": !!getMultiLineTextContent })}
                    >
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
                getAccessibilityConfig,
                key,
            }: IUiAsyncTableColumn<T>,
            labelId: string | undefined,
            item: T,
            focusedElementRef: Ref<HTMLElement>,
            isCellFocused: boolean,
        ) => {
            const accessibilityConfig = getAccessibilityConfig?.(item);

            if (renderButton) {
                return renderButton(item);
            }

            if (renderMenu) {
                return renderMenuIcon(
                    renderMenu,
                    accessibilityConfig ?? {},
                    item,
                    focusedElementRef,
                    isCellFocused,
                );
            }

            return (
                <>
                    {renderRoleIcon ? renderRoleIconWithWrapper(renderRoleIcon, item) : null}
                    {renderPrefixIcon ? renderPrefixIconWithWrapper(renderPrefixIcon, item) : null}
                    {renderTextContentWithWrapper(
                        item,
                        key,
                        labelId,
                        getTextContent,
                        getMultiLineTextContent,
                        getTextTitle,
                        getTextHref,
                        renderSuffixIcon,
                        focusedElementRef,
                        isCellFocused,
                    )}
                    {renderBadge ? renderBadgeWithWrapper(renderBadge, item) : null}
                    {getMultiLineTextContent
                        ? null
                        : renderSuffixIcon && renderSuffixIconWithWrapper(renderSuffixIcon, item)}
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
