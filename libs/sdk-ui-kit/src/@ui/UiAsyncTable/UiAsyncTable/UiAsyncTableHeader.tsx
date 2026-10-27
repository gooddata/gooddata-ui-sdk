// (C) 2025-2026 GoodData Corporation

import { type Ref, useId } from "react";

import { useIntl } from "react-intl";

import { UiIcon } from "../../UiIcon/UiIcon.js";
import { UiTooltip } from "../../UiTooltip/UiTooltip.js";
import { e } from "../asyncTableBem.js";
import { messages } from "../locales.js";
import { type IUiAsyncTableHeaderProps } from "../types.js";

import { useAsyncTableHeaderNavigation } from "./asyncTableGridContext.js";
import { getColumnHeaderId, getColumnWidth } from "./utils.js";

const arrowIcon = <UiIcon type="dropDown" size={11} color="complementary-6" />;

export function UiAsyncTableHeader<T>({
    columns,
    handleColumnClick,
    sortBy,
    sortDirection,
    hasCheckbox,
    width,
    small,
    largeRow,
}: IUiAsyncTableHeaderProps<T>) {
    const navigation = useAsyncTableHeaderNavigation();
    const intl = useIntl();
    const tableId = useId();
    const columnHeaderId = (index: number) =>
        navigation?.getHeaderId(index) ?? `${getColumnHeaderId(String(index))}-${tableId}`;
    const isFocused = (index: number) => navigation?.focusedColumnIndex === index;

    return (
        <div
            className={e("header", { small: small ?? false })}
            role="row"
            aria-rowindex={1}
            aria-label={intl.formatMessage(messages["headerAriaLabel"])}
            style={{ width }}
        >
            {hasCheckbox ? (
                <div
                    className={e("cell", { checkbox: true, isFocused: isFocused(0) })}
                    role="columnheader"
                    id={columnHeaderId(0)}
                    aria-colindex={1}
                    aria-label={intl.formatMessage(messages["checkboxHeaderAriaLabel"])}
                    aria-sort="none"
                />
            ) : null}

            {columns.map((column, index) => {
                const width = getColumnWidth(!!column.renderMenu, largeRow ?? false, column.width);
                const sorted = sortBy && sortBy === column.key;
                const desc = sorted && sortDirection === "desc";
                const { sortable, renderMenu, headerTooltip } = column;
                const columnIndex = index + (hasCheckbox ? 1 : 0);
                const label = <span className={e("text")}>{column.label}</span>;
                return (
                    <div
                        key={index}
                        onClick={() => sortable && handleColumnClick(column.key)}
                        className={e("cell", {
                            sorted: sorted ?? false,
                            desc: desc ?? false,
                            sortable: sortable ?? false,
                            isFocused: isFocused(columnIndex),
                            align: column.align ?? false,
                        })}
                        style={{ width }}
                        role="columnheader"
                        id={columnHeaderId(columnIndex)}
                        aria-colindex={columnIndex + 1}
                        ref={
                            isFocused(columnIndex)
                                ? (navigation?.focusedElementRef as Ref<HTMLDivElement>)
                                : undefined
                        }
                        aria-sort={sorted ? (desc ? "descending" : "ascending") : "none"}
                        aria-label={
                            renderMenu ? intl.formatMessage(messages["menuHeaderAriaLabel"]) : undefined
                        }
                        aria-description={headerTooltip}
                    >
                        {headerTooltip ? (
                            <UiTooltip
                                anchor={label}
                                content={headerTooltip}
                                triggerBy={["hover"]}
                                isOpen={(navigation?.isTooltipOpen && isFocused(columnIndex)) || undefined}
                                accessibilityHidden
                                optimalPlacement
                            />
                        ) : (
                            label
                        )}
                        {sortable ? <div className={e("sort")}>{arrowIcon}</div> : null}
                    </div>
                );
            })}
        </div>
    );
}
