// (C) 2007-2026 GoodData Corporation

import { useCallback, useEffect, useRef, useState } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { type TextFilterOperator } from "../../textFilterOperatorUtils.js";
import { getTextFilterStateParts } from "../../textFilterStateSummaryUtils.js";

/**
 * Props for TextFilterStateSummary component.
 *
 * @alpha
 */
export interface ITextFilterStateSummaryProps {
    /**
     * Current operator.
     */
    operator: TextFilterOperator;

    /**
     * Current values for arbitrary operators.
     */
    values: Array<string | null>;

    /**
     * Current literal for match operators.
     */
    literal: string;
}

const summaryMessages = defineMessages({
    rich: { id: "attributeFilter.text.summary.rich" },
});

const isArbitraryOperator = (op: TextFilterOperator) => op === "is" || op === "isNot";

/**
 * Textual representation of current text filter state.
 * Renders full summary and lets browser handle ellipsis.
 * Shows (totalCount) suffix only when text is truncated.
 *
 * @alpha
 */
export function TextFilterStateSummary(props: ITextFilterStateSummaryProps) {
    const { operator, values, literal } = props;
    const intl = useIntl();
    const state = getTextFilterStateParts(operator, values, literal, intl);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    const checkTruncation = useCallback(() => {
        const el = contentRef.current;
        if (!el) return;
        setIsTruncated(el.scrollWidth > el.clientWidth);
    }, []);

    useEffect(() => {
        const raf = requestAnimationFrame(() => checkTruncation());
        const observer = new ResizeObserver(checkTruncation);
        const el = contentRef.current;
        if (el) observer.observe(el);
        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
        };
    }, [checkTruncation, state.operator, state.value]);

    const showCount = isTruncated && isArbitraryOperator(operator) && values.length > 0;

    return (
        <div className="gd-text-filter-state-summary s-text-filter-state-summary">
            <div className="gd-text-filter-state-summary__divider" />

            <div className="gd-text-filter-state-summary__text">
                <div ref={contentRef} className="gd-text-filter-state-summary__content">
                    <FormattedMessage
                        {...summaryMessages.rich}
                        values={{
                            operator: state.operator,
                            value: state.value,
                            b: (chunks) => (
                                <span className="gd-text-filter-state-summary__value">{chunks}</span>
                            ),
                        }}
                    />
                </div>
                {showCount ? (
                    <span className="gd-text-filter-state-summary__count"> ({values.length})</span>
                ) : null}
            </div>
        </div>
    );
}
