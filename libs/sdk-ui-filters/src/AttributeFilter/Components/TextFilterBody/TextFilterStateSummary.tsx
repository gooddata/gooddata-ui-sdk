// (C) 2007-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { UiTooltip } from "@gooddata/sdk-ui-kit";

import { type TextFilterOperator } from "../../textFilterOperatorUtils.js";
import { getTextFilterStateParts, getTextFilterStateText } from "../../textFilterStateSummaryUtils.js";

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

const isArbitraryOperator = (op: TextFilterOperator) => op === "is" || op === "isNot";

/**
 * Textual representation of current text filter state.
 * Shows operator and value(s) with ellipsis truncation.
 * Tooltip with full text is shown on hover when content is truncated.
 * Shows (totalCount) suffix for arbitrary operators.
 *
 * @alpha
 */
export function TextFilterStateSummary(props: ITextFilterStateSummaryProps) {
    const { operator, values, literal } = props;
    const intl = useIntl();
    const state = getTextFilterStateParts(operator, values, literal, intl);
    const tooltipText = getTextFilterStateText(operator, values, literal, intl);

    const showCount = isArbitraryOperator(operator) && values.length > 0;

    return (
        <div className="gd-text-filter-state-summary s-text-filter-state-summary">
            <div className="gd-text-filter-state-summary__divider" />

            <div className="gd-text-filter-state-summary__text">
                <span className="gd-text-filter-state-summary__operator">
                    {state.operator}
                    {state.value ? "\xa0" : null}
                </span>
                {state.value ? (
                    <UiTooltip
                        arrowPlacement="top-start"
                        triggerBy={["hover"]}
                        content={tooltipText}
                        anchor={
                            <>
                                <span className="gd-shortened-text gd-selection-list s-text-filter-state-summary-value">
                                    {state.value}
                                </span>
                                {showCount ? `\xa0(${values.length})` : null}
                            </>
                        }
                    />
                ) : null}
            </div>
        </div>
    );
}
