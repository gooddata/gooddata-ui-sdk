// (C) 2007-2025 GoodData Corporation
import React, { memo, useCallback } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import cx from "classnames";
import capitalize from "lodash/capitalize.js";
import noop from "lodash/noop.js";
import { stringUtils } from "@gooddata/util";

import { getOperatorTranslationKey, getOperatorIcon } from "./helpers/measureValueFilterOperator.js";
import { MeasureValueFilterOperator } from "./types.js";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

interface IOperatorDropdownItemOwnProps {
    selectedOperator: MeasureValueFilterOperator;
    operator: MeasureValueFilterOperator;
    bubbleText?: string;
    onClick: (identifier: MeasureValueFilterOperator) => void;
}

type IOperatorDropdownItemProps = IOperatorDropdownItemOwnProps & WrappedComponentProps;

export const OperatorDropdownItem = memo(function OperatorDropdownItem({
    intl,
    operator,
    selectedOperator,
    bubbleText = null,
    onClick = noop,
}: IOperatorDropdownItemProps) {
    const handleOnClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>): void => {
            onClick(operator);
            e.preventDefault();
        },
        [onClick, operator],
    );

    const renderBubble = useCallback((message: string) => {
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
    }, []);

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

export default injectIntl(OperatorDropdownItem);
