// (C) 2025-2026 GoodData Corporation

import { type MouseEvent, type ReactNode, type Ref, useCallback, useId } from "react";

import { type ObjRef } from "@gooddata/sdk-model";

import { Dropdown } from "../../../Dropdown/Dropdown.js";
import { UiIcon } from "../../UiIcon/UiIcon.js";
import { UiIconButton } from "../../UiIconButton/UiIconButton.js";
import { UiTooltip } from "../../UiTooltip/UiTooltip.js";
import { e } from "../asyncTableBem.js";
import {
    type IUiAsyncTableColumn,
    type IUiAsyncTableColumnAccessibilityConfig,
    type IUiAsyncTableRowProps,
    type UiAsyncTableMenuRenderer,
} from "../types.js";

import {
    AsyncTableCellProvider,
    useAsyncTableGridRef,
    useAsyncTableInteraction,
} from "./asyncTableGridContext.js";
import { UiAsyncTableCheckbox } from "./UiAsyncTableCheckbox.js";
import { UiAsyncTableIconRenderer } from "./UiAsyncTableIconRenderer.js";
import {
    getCellId,
    getColumnWidth,
    getItemKey,
    getRowId,
    getRowLabelId,
    isFromCellControl,
} from "./utils.js";
import { WithConditionalAnchor } from "./WithConditionalAnchor.js";

export function UiAsyncTableRow<T extends { id: string } | { ref: ObjRef }>({
    tableId,
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
    tooltip,
    isTooltipOpen,
}: IUiAsyncTableRowProps<T>) {
    const { renderCellContent } = useRenderCellContent<T>({ isLarge: isLarge ?? false });
    const { isInteractionMode, activeCellId, isKeyboardActivationRef } = useAsyncTableInteraction();
    const isRowFocused = isFocused && focusedColumnIndex === undefined;
    const tooltipId = useId();
    const itemId = getItemKey(item);
    const resolvedColumns = columns.map((column) => ({
        column,
        multiLineTextContent:
            column.renderButton || column.renderMenu ? undefined : column.getMultiLineTextContent?.(item),
    }));
    const firstColumn = columns[0];
    const firstMultiLineTextContent = resolvedColumns[0]?.multiLineTextContent;
    const rowLabelId =
        firstColumn &&
        !firstColumn.renderButton &&
        !firstColumn.renderMenu &&
        (firstMultiLineTextContent === undefined
            ? firstColumn.getTextContent || firstColumn.key !== undefined
            : firstMultiLineTextContent.length > 0)
            ? getRowLabelId(tableId, itemIndex)
            : undefined;

    const handleRowClick = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            // Check if the click originated from a menu button
            // We can't stop event propagation on dropdown button as we would lose
            // dropdown closeOnOutsideClick functionality, causing menu dropdowns to overlap
            const target = e.target as HTMLElement;
            if (target.closest('[data-id="menu-button"]')) {
                return;
            }
            if (isKeyboardActivationRef.current) {
                return;
            }
            const cell = target.closest<HTMLElement>("[role='gridcell']");
            if (isInteractionMode && cell && cell.id === activeCellId && isFromCellControl(cell, target)) {
                return;
            }
            onClick?.(item);
        },
        [onClick, item, isInteractionMode, activeCellId, isKeyboardActivationRef],
    );

    const row = (
        <div
            onClick={handleRowClick}
            className={e("row", {
                large: isLarge ?? false,
                focused: isRowFocused ?? false,
                active: !!onClick,
            })}
            ref={isRowFocused ? (focusedElementRef as Ref<HTMLDivElement>) : undefined}
            role="row"
            id={getRowId(tableId, itemId)}
            data-item-id={itemId}
            aria-rowindex={itemIndex + 1}
            aria-labelledby={rowLabelId}
            aria-describedby={tooltip ? tooltipId : undefined}
        >
            {hasCheckbox ? (
                <UiAsyncTableCheckbox
                    checked={isSelected}
                    onChange={() => onSelect?.(item)}
                    ariaLabel={accessibilityConfig?.getCheckboxItemAriaLabel?.(item)}
                    isCellFocused={isFocused ? focusedColumnIndex === 0 : undefined}
                    cellRef={isFocused && focusedColumnIndex === 0 ? focusedElementRef : undefined}
                    cellId={getCellId(tableId, itemId, 0)}
                />
            ) : null}
            {resolvedColumns.map(({ column, multiLineTextContent }, index) => {
                const { bold, renderMenu, width: widthProp } = column;
                const width = getColumnWidth(!!renderMenu, isLarge ?? false, widthProp);
                const totalColumnIndex = index + (hasCheckbox ? 1 : 0);
                const isCellFocused = isFocused && focusedColumnIndex === totalColumnIndex;
                const labelId = index === 0 ? rowLabelId : undefined;
                const cellId = getCellId(tableId, itemId, totalColumnIndex);
                const isCellInteractive = isInteractionMode && cellId === activeCellId;
                return (
                    <div
                        style={{ width }}
                        key={index}
                        id={cellId}
                        className={e("cell", {
                            bold: bold ?? false,
                            align: column.align ?? false,
                            focused: isCellFocused ?? false,
                        })}
                        role="gridcell"
                    >
                        <AsyncTableCellProvider value={isCellInteractive}>
                            {renderCellContent(
                                column,
                                labelId,
                                item,
                                focusedElementRef ?? (() => {}),
                                isCellFocused ?? false,
                                multiLineTextContent,
                            )}
                        </AsyncTableCellProvider>
                    </div>
                );
            })}
        </div>
    );

    return tooltip ? (
        <UiTooltip
            id={tooltipId}
            anchor={row}
            content={tooltip}
            triggerBy={["hover"]}
            // keyboard navigation opens it via the grid, see UiAsyncTableBody; otherwise hover drives it
            isOpen={isTooltipOpen || undefined}
            optimalPlacement
            anchorWrapperStyles={{ width: "100%" }}
        />
    ) : (
        row
    );
}

const useRenderCellContent = <T extends { id: string } | { ref: ObjRef }>({
    isLarge,
}: {
    isLarge: boolean;
}) => {
    const gridRef = useAsyncTableGridRef();

    // Put focus back on the grid before the menu closes. Callers routinely close the menu and open a
    // dialog in the same tick (flushSync(closeDropdown) then setState); that dialog captures whatever is
    // focused as its own return target, and the dropdown's restore is deferred to a microtask, so it would
    // land after the snapshot was taken and the dialog would return focus to <body> - i.e. the page top.
    // Restoring here keeps it synchronous, and the deferred restore then correctly sees nothing to do.
    const closeMenuAndRestoreFocus = useCallback(
        (closeDropdown: () => void) => {
            gridRef?.current?.focus();
            closeDropdown();
        },
        [gridRef],
    );

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
                    alignPoints={[{ align: "br tr" }, { align: "tr br" }]}
                    renderBody={({ closeDropdown }) =>
                        renderMenu(item, () => closeMenuAndRestoreFocus(closeDropdown))
                    }
                />
            );
        },
        [isLarge, closeMenuAndRestoreFocus],
    );

    const renderTextContent = useCallback(
        (
            item: T,
            key: keyof T | undefined,
            labelId: string | undefined,
            getTextContent: ((item: T) => string | ReactNode) | undefined,
            multiLineTextContent: string[] | undefined,
            renderSuffixIcon: ((item: T) => ReactNode) | undefined,
            isLocked: IUiAsyncTableColumn<T>["isLocked"],
        ) => {
            if (multiLineTextContent !== undefined) {
                return multiLineTextContent.map((line, index) => {
                    const isFirst = index === 0;
                    return (
                        <span className={e("text-line", { first: isFirst })} key={index}>
                            {isFirst && isLocked?.(item) ? <LockIcon /> : null}
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
            multiLineTextContent: string[] | undefined,
            getTextTitle: ((item: T) => string) | undefined,
            getTextHref: ((item: T) => string | undefined) | undefined,
            renderSuffixIcon: ((item: T) => ReactNode) | undefined,
            textColor: IUiAsyncTableColumn<T>["textColor"],
            isLocked: IUiAsyncTableColumn<T>["isLocked"],
            focusedElementRef: Ref<HTMLElement>,
            isCellFocused: boolean,
        ) => {
            const textContent = renderTextContent(
                item,
                key,
                labelId,
                getTextContent,
                multiLineTextContent,
                renderSuffixIcon,
                isLocked,
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
                        id={typeof textContent === "string" ? labelId : undefined}
                        title={title}
                        ref={
                            isActive && isCellFocused ? (focusedElementRef as Ref<HTMLDivElement>) : undefined
                        }
                        className={e("text", {
                            "multi-line": multiLineTextContent !== undefined,
                            color: multiLineTextContent === undefined && textColor ? textColor : false,
                        })}
                    >
                        {multiLineTextContent === undefined && isLocked?.(item) ? <LockIcon /> : null}
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
                getTextTitle,
                getTextHref,
                getAccessibilityConfig,
                textColor,
                isLocked,
                key,
            }: IUiAsyncTableColumn<T>,
            labelId: string | undefined,
            item: T,
            focusedElementRef: Ref<HTMLElement>,
            isCellFocused: boolean,
            multiLineTextContent: string[] | undefined,
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
                        multiLineTextContent,
                        getTextTitle,
                        getTextHref,
                        renderSuffixIcon,
                        textColor,
                        isLocked,
                        focusedElementRef,
                        isCellFocused,
                    )}
                    {renderBadge ? renderBadgeWithWrapper(renderBadge, item) : null}
                    {multiLineTextContent === undefined
                        ? renderSuffixIcon && renderSuffixIconWithWrapper(renderSuffixIcon, item)
                        : null}
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

function LockIcon() {
    return (
        <span className={e("lock-icon")}>
            <UiIcon type="lock" size={14} color="complementary-6" layout="block" />
        </span>
    );
}
