// (C) 2026 GoodData Corporation

import { type ChangeEvent, type KeyboardEvent, forwardRef, useId, useState } from "react";

import { bem } from "../@utils/bem.js";
import { UiToolbarIconButton } from "../UiToolbarIconButton/UiToolbarIconButton.js";

/**
 * @internal
 */
export interface IUiToolbarPaginationAccessibilityConfig {
    /**
     * Name of the current page, for example "Page".
     */
    ariaLabel: string;
    /**
     * Name of the previous control, for example "Previous page".
     */
    previousLabel: string;
    /**
     * Name of the next control, for example "Next page".
     */
    nextLabel: string;
    /**
     * Spoken form of the position, for example "Page 3 of 12". Announced when the page changes.
     * Defaults to the label followed by the visible text.
     */
    valueText?: string;
    /**
     * Spoken form of the total next to the editable page, for example "of 12".
     * Defaults to the visible text.
     */
    totalLabel?: string;
}

/**
 * @internal
 */
export interface IUiToolbarPaginationProps {
    /**
     * The current page, starting at 1.
     */
    currentPage: number;
    totalPages: number;
    /**
     * Called with the page to move to. A typed page is clamped to the range from 1 to `totalPages`.
     */
    onPageChange: (page: number) => void;
    /**
     * Makes the current page a field the user can type a page into. Enter and blur go to the typed
     * page, Escape reverts it.
     * @defaultValue false
     */
    isValueEditable?: boolean;
    isDisabled?: boolean;
    accessibilityConfig: IUiToolbarPaginationAccessibilityConfig;
    dataTestId?: string;
}

const { b, e } = bem("gd-ui-kit-toolbar-pagination");

function parsePage(text: string, totalPages: number): number | undefined {
    const page = Number.parseInt(text.trim(), 10);
    if (Number.isNaN(page)) {
        return undefined;
    }
    return Math.min(Math.max(page, 1), Math.max(totalPages, 1));
}

/**
 * Previous and next controls around the current page and the total, for example "1 / 12". Each
 * control is its own toolbar stop.
 *
 * @internal
 */
export const UiToolbarPagination = forwardRef<HTMLDivElement, IUiToolbarPaginationProps>(
    function UiToolbarPagination(
        {
            currentPage,
            totalPages,
            onPageChange,
            isValueEditable = false,
            isDisabled = false,
            accessibilityConfig,
            dataTestId,
        },
        ref,
    ) {
        const totalId = useId();
        const current = String(currentPage);
        const total = String(totalPages);

        const [draft, setDraft] = useState(current);
        const [committed, setCommitted] = useState(current);
        if (committed !== current) {
            setCommitted(current);
            setDraft(current);
        }

        const goTo = (page: number) => {
            if (page !== currentPage) {
                onPageChange(page);
            }
        };

        const commitDraft = () => {
            const page = parsePage(draft, totalPages);
            setDraft(current);
            if (page !== undefined) {
                goTo(page);
            }
        };

        const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
            if (isDisabled || event.nativeEvent.isComposing) {
                return;
            }
            if (event.code === "Enter") {
                event.preventDefault();
                commitDraft();
            } else if (event.code === "Escape") {
                setDraft(current);
            }
        };

        const valueText =
            accessibilityConfig.valueText ?? `${accessibilityConfig.ariaLabel} ${current} / ${total}`;

        return (
            <div ref={ref} className={b({ isValueEditable, isDisabled })} data-testid={dataTestId}>
                <UiToolbarIconButton
                    size="small"
                    icon="navigateLeft"
                    label={accessibilityConfig.previousLabel}
                    isDisabled={isDisabled || currentPage <= 1}
                    onClick={() => goTo(currentPage - 1)}
                />
                {isValueEditable ? (
                    <>
                        <input
                            className={e("field")}
                            type="text"
                            inputMode="numeric"
                            value={draft}
                            aria-label={accessibilityConfig.ariaLabel}
                            aria-describedby={totalId}
                            aria-disabled={isDisabled || undefined}
                            readOnly={isDisabled}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value)}
                            onBlur={isDisabled ? undefined : commitDraft}
                            onKeyDown={handleKeyDown}
                        />
                        <span className={e("total")} aria-hidden>
                            {`/ ${total}`}
                        </span>
                        <span id={totalId} className="sr-only">
                            {accessibilityConfig.totalLabel ?? `/ ${total}`}
                        </span>
                    </>
                ) : (
                    <span className={e("readout")} aria-hidden>
                        {`${current} / ${total}`}
                    </span>
                )}
                <span className="sr-only" role="status">
                    {valueText}
                </span>
                <UiToolbarIconButton
                    size="small"
                    icon="navigateRight"
                    label={accessibilityConfig.nextLabel}
                    isDisabled={isDisabled || currentPage >= totalPages}
                    onClick={() => goTo(currentPage + 1)}
                />
            </div>
        );
    },
);
