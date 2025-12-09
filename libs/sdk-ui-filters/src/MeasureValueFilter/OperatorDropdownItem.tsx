// (C) 2007-2025 GoodData Corporation

import { MouseEvent, memo } from "react";

import cx from "classnames";
import { capitalize } from "lodash-es";
import { useIntl } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { getOperatorIcon, getOperatorTranslationKey } from "./helpers/measureValueFilterOperator.js";
import { MeasureValueFilterOperator } from "./types.js";

interface IOperatorDropdownItemOwnProps {
    selectedOperator: MeasureValueFilterOperator;
    operator: MeasureValueFilterOperator;
    bubbleText?: string;
    onClick: (identifier: MeasureValueFilterOperator) => void;
}

export const OperatorDropdownItem = memo(function OperatorDropdownItem({
    operator,
    selectedOperator,
    bubbleText,
    onClick = () => {},
}: IOperatorDropdownItemOwnProps) {
    const intl = useIntl();

    const handleOnClick = (e: MouseEvent<HTMLDivElement>): void => {
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
        `s-mvf-operator-${stringUtils.simplifyText(operator)}`,
        {
            "is-selected": selectedOperator === operator,
        },
    );

    const operatorTranslationKey = getOperatorTranslationKey(operator);
    const title =
        operatorTranslationKey === undefined ? operator : intl.formatMessage({ id: operatorTranslationKey });

    return (
        <div className={className} onClick={handleOnClick}>
            <div className={`gd-icon-${getOperatorIcon(operator)}`} title={title} />
            <span title={title}>{capitalize(title)}</span>
            {bubbleText ? renderBubble(bubbleText) : null}
        </div>
    );
});
