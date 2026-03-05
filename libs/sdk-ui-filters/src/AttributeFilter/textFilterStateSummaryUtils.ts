// (C) 2022-2026 GoodData Corporation

import { type IntlShape, defineMessages } from "react-intl";

import { type TextFilterOperator, isAllOperator } from "./textFilterOperatorUtils.js";

const matchOperatorMessages = defineMessages({
    contains: { id: "attributeFilter.operator.contains" },
    doesNotContain: { id: "attributeFilter.operator.doesNotContain" },
    startsWith: { id: "attributeFilter.operator.startsWith" },
    doesNotStartWith: { id: "attributeFilter.operator.doesNotStartWith" },
    endsWith: { id: "attributeFilter.operator.endsWith" },
    doesNotEndWith: { id: "attributeFilter.operator.doesNotEndWith" },
});

const arbitraryOperatorMessages = defineMessages({
    all: { id: "attributeFilter.operator.all" },
    is: { id: "attributeFilter.operator.is" },
    isNot: { id: "attributeFilter.operator.isNot" },
});

const textSummaryMessages = defineMessages({
    plain: { id: "attributeFilter.text.summary.plain" },
});

/**
 * Text filter state parts.
 *
 * @alpha
 */
export interface ITextFilterStateParts {
    operator: string;
    value: string;
}

function getMatchFilterText(operator: TextFilterOperator, intl: IntlShape): string {
    let matchFilterText = "";
    switch (operator) {
        case "contains":
            matchFilterText = intl.formatMessage(matchOperatorMessages.contains);
            break;
        case "doesNotContain":
            matchFilterText = intl.formatMessage(matchOperatorMessages.doesNotContain);
            break;
        case "startsWith":
            matchFilterText = intl.formatMessage(matchOperatorMessages.startsWith);
            break;
        case "doesNotStartWith":
            matchFilterText = intl.formatMessage(matchOperatorMessages.doesNotStartWith);
            break;
        case "endsWith":
            matchFilterText = intl.formatMessage(matchOperatorMessages.endsWith);
            break;
        case "doesNotEndWith":
            matchFilterText = intl.formatMessage(matchOperatorMessages.doesNotEndWith);
            break;
    }
    return matchFilterText;
}
/**
 * Get textual state parts for text filter state.
 *
 * @alpha
 */
export function getTextFilterStateParts(
    operator: TextFilterOperator,
    values: Array<string | null>,
    literal: string,
    intl: IntlShape,
): ITextFilterStateParts {
    if (isAllOperator(operator)) {
        return {
            operator: intl.formatMessage(arbitraryOperatorMessages.all),
            value: "",
        };
    }

    const isArbitrary = operator === "is" || operator === "isNot";
    const arbitraryFilterText = intl.formatMessage(
        operator === "is" ? arbitraryOperatorMessages.is : arbitraryOperatorMessages.isNot,
    );

    const operatorText = isArbitrary ? arbitraryFilterText : getMatchFilterText(operator, intl);

    const emptyValuePlaceholder = `(${intl.formatMessage({ id: "empty_value" })})`;
    const rawValueText = isArbitrary
        ? values
              .map((value) => {
                  if (value === null) {
                      return emptyValuePlaceholder;
                  }
                  if (value === "") {
                      return '""';
                  }
                  return value.trim();
              })
              .join(", ")
        : literal.trim();

    const valueText = rawValueText || intl.formatMessage({ id: "attributeFilter.text.isNone" });

    return {
        operator: operatorText,
        value: valueText,
    };
}

/**
 * Get textual representation for text filter state.
 *
 * @alpha
 */
export function getTextFilterStateText(
    operator: TextFilterOperator,
    values: Array<string | null>,
    literal: string,
    intl: IntlShape,
): string {
    const state = getTextFilterStateParts(operator, values, literal, intl);
    return intl.formatMessage(textSummaryMessages.plain, {
        operator: state.operator,
        value: state.value,
    });
}
