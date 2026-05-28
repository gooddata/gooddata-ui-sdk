// (C) 2019-2026 GoodData Corporation

import { Fragment, memo } from "react";

import cx from "classnames";
import { capitalize } from "lodash-es";
import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { FullScreenOverlay, type IAlignPoint, Overlay, Separator } from "@gooddata/sdk-ui-kit";

import { MEASURE_VALUE_FILTER_OPERATOR_DROPDOWN_BODY_CLASS } from "./constants.js";
import { getOperatorTranslationKey } from "./helpers/measureValueFilterOperator.js";
import { OperatorDropdownItem } from "./OperatorDropdownItem.js";
import { type MeasureValueFilterOperator } from "./types.js";

interface IOperatorDropdownBodyProps {
    selectedOperator: MeasureValueFilterOperator;
    onSelect: (operator: MeasureValueFilterOperator) => void;
    onClose: () => void;
    alignTo: string;
    isAllOperatorDisabled?: boolean;
    isMobile?: boolean;
}

const MOBILE_DROPDOWN_ALIGN_POINTS: IAlignPoint[] = [{ align: "tl tl" }];

// Operators grouped as they appear in the picker; a Separator is rendered between groups
// (desktop only — mobile rows already carry a bottom divider).
const OPERATOR_GROUPS: MeasureValueFilterOperator[][] = [
    ["ALL"],
    ["GREATER_THAN", "GREATER_THAN_OR_EQUAL_TO"],
    ["LESS_THAN", "LESS_THAN_OR_EQUAL_TO"],
    ["BETWEEN", "NOT_BETWEEN"],
    ["EQUAL_TO", "NOT_EQUAL_TO"],
];

// Operators that surface an explanatory hover bubble next to their label.
// Declared via `defineMessages` so static i18n analysis (e.g. i18n-toolkit) sees these IDs
// as referenced and validates their presence in translation bundles — a plain `string` map
// is invisible to the extractor because it never reaches an `intl.formatMessage({ id })` call site.
const bubbleMessages = defineMessages({
    BETWEEN: { id: "mvf.operator.between.tooltip.bubble" },
    NOT_BETWEEN: { id: "mvf.operator.notBetween.tooltip.bubble" },
});

const OPERATOR_BUBBLE_MESSAGES: Partial<Record<MeasureValueFilterOperator, MessageDescriptor>> = {
    BETWEEN: bubbleMessages.BETWEEN,
    NOT_BETWEEN: bubbleMessages.NOT_BETWEEN,
};

export const OperatorDropdownBody = memo(function OperatorDropdownBody({
    onSelect,
    onClose,
    selectedOperator,
    alignTo,
    isAllOperatorDisabled = false,
    isMobile = false,
}: IOperatorDropdownBodyProps) {
    const intl = useIntl();

    const allOperatorDisabledTooltip = isAllOperatorDisabled
        ? intl.formatMessage({ id: "mvf.operator.all.disabled.tooltip" })
        : undefined;

    const selectedOperatorTranslationKey = getOperatorTranslationKey(selectedOperator);
    const selectedOperatorTitle = capitalize(
        selectedOperatorTranslationKey === undefined
            ? selectedOperator
            : intl.formatMessage({ id: selectedOperatorTranslationKey }),
    );

    const items = (
        <div
            className={cx(MEASURE_VALUE_FILTER_OPERATOR_DROPDOWN_BODY_CLASS, "s-mvf-operator-dropdown-body", {
                "gd-is-mobile": isMobile,
            })}
            data-testid="mvf-operator-dropdown-body"
        >
            {OPERATOR_GROUPS.map((group, groupIdx) => (
                <Fragment key={groupIdx}>
                    {groupIdx > 0 && !isMobile ? <Separator /> : null}
                    {group.map((operator) => {
                        const bubbleMessage = OPERATOR_BUBBLE_MESSAGES[operator];
                        return (
                            <OperatorDropdownItem
                                key={operator}
                                operator={operator}
                                selectedOperator={selectedOperator}
                                onClick={onSelect}
                                bubbleText={bubbleMessage ? intl.formatMessage(bubbleMessage) : undefined}
                                isDisabled={operator === "ALL" ? isAllOperatorDisabled : undefined}
                                disabledTooltip={operator === "ALL" ? allOperatorDisabledTooltip : undefined}
                                isMobile={isMobile}
                            />
                        );
                    })}
                </Fragment>
            ))}
        </div>
    );

    if (isMobile) {
        return (
            <FullScreenOverlay alignTo="body" alignPoints={MOBILE_DROPDOWN_ALIGN_POINTS} onClose={onClose}>
                <div className="gd-mobile-dropdown-overlay overlay gd-flex-row-container gd-mvf-mobile-dropdown">
                    <div className="gd-mobile-dropdown-header gd-flex-item gd-mvf-mobile-dropdown-header">
                        <button
                            type="button"
                            className="gd-mvf-operator-mobile-header s-mvf-operator-mobile-header"
                            onClick={onClose}
                        >
                            <span className="gd-mvf-operator-mobile-header__label">
                                {intl.formatMessage({ id: "mvf.condition" })}
                            </span>
                            <span className="gd-mvf-operator-mobile-header__value">
                                {selectedOperatorTitle}
                            </span>
                            <span className="gd-mvf-operator-mobile-header__chevron gd-icon-navigateup" />
                        </button>
                    </div>
                    <div className="gd-mobile-dropdown-content gd-flex-item-stretch gd-mvf-mobile-dropdown-content">
                        {items}
                    </div>
                </div>
            </FullScreenOverlay>
        );
    }

    return (
        <Overlay closeOnOutsideClick alignTo={alignTo} alignPoints={[{ align: "bl tl" }]} onClose={onClose}>
            <div className="gd-dropdown overlay">{items}</div>
        </Overlay>
    );
});
