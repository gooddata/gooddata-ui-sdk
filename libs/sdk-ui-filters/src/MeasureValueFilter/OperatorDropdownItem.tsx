// (C) 2007-2026 GoodData Corporation

import { type MouseEvent, memo } from "react";

import cx from "classnames";
import { capitalize } from "lodash-es";
import { useIntl } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { simplifyText } from "@gooddata/util";

import { getOperatorIcon, getOperatorTranslationKey } from "./helpers/measureValueFilterOperator.js";
import { type MeasureValueFilterOperator } from "./types.js";

const BUBBLE_ALIGN_POINTS = [{ align: "cr cl" }, { align: "cl cr" }];

interface IOperatorDropdownItemOwnProps {
    selectedOperator: MeasureValueFilterOperator;
    operator: MeasureValueFilterOperator;
    bubbleText?: string;
    isDisabled?: boolean;
    disabledTooltip?: string;
    onClick: (identifier: MeasureValueFilterOperator) => void;
}

export const OperatorDropdownItem = memo(function OperatorDropdownItem({
    operator,
    selectedOperator,
    bubbleText,
    isDisabled = false,
    disabledTooltip,
    onClick = () => {},
}: IOperatorDropdownItemOwnProps) {
    const intl = useIntl();

    const handleOnClick = (e: MouseEvent<HTMLDivElement>): void => {
        if (isDisabled) {
            e.preventDefault();
            return;
        }
        onClick(operator);
        e.preventDefault();
    };

    const renderBubble = (message: string) => {
        return (
            <div className="tooltip-bubble">
                <BubbleHoverTrigger tagName={"div"} showDelay={400} hideDelay={200}>
                    <div className="inlineBubbleHelp" />
                    <Bubble className="bubble-primary" alignPoints={[{ align: "tc bl" }]}>
                        {message}
                    </Bubble>
                </BubbleHoverTrigger>
            </div>
        );
    };

    const className = cx(
        "gd-list-item",
        "gd-list-item-shortened",
        `s-mvf-operator-${simplifyText(operator)}`,
        {
            "is-selected": selectedOperator === operator,
            "is-disabled": isDisabled,
        },
    );

    const operatorTranslationKey = getOperatorTranslationKey(operator);
    const title =
        operatorTranslationKey === undefined ? operator : intl.formatMessage({ id: operatorTranslationKey });

    const itemContent = (
        <div
            className={className}
            onClick={handleOnClick}
            aria-disabled={isDisabled}
            data-testid={`mvf-operator-${simplifyText(operator)}`}
        >
            <div className={`gd-icon-${getOperatorIcon(operator)}`} title={title} />
            <span title={title}>{capitalize(title)}</span>
            {bubbleText ? renderBubble(bubbleText) : null}
        </div>
    );

    // Wrap disabled item with tooltip if provided
    if (isDisabled && disabledTooltip) {
        return (
            <BubbleHoverTrigger tagName={"div"} showDelay={400} hideDelay={200}>
                {itemContent}
                <Bubble className="bubble-primary" alignPoints={BUBBLE_ALIGN_POINTS}>
                    {disabledTooltip}
                </Bubble>
            </BubbleHoverTrigger>
        );
    }

    return itemContent;
});
