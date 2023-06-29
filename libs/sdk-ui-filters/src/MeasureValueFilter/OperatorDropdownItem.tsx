// (C) 2007-2022 GoodData Corporation
import React from "react";
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

export class OperatorDropdownItem extends React.PureComponent<IOperatorDropdownItemProps> {
    public static defaultProps: any = {
        onClick: noop,
        bubbleText: null,
    };

    public render() {
        const { intl, operator, selectedOperator, bubbleText } = this.props;

        const className = cx(
            "gd-list-item",
            "gd-list-item-shortened",
            `s-mvf-operator-${stringUtils.simplifyText(operator)}`,
            {
                "is-selected": selectedOperator === operator,
            },
        );

        const title = intl.formatMessage({ id: getOperatorTranslationKey(operator) });

        return (
            <div className={className} onClick={this.handleOnClick}>
                <div className={`gd-icon-${getOperatorIcon(operator)}`} title={title} />
                <span title={title}>{capitalize(title)}</span>
                {bubbleText ? this.renderBubble(bubbleText) : null}
            </div>
        );
    }

    public handleOnClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        const { operator, onClick } = this.props;
        onClick(operator);
        e.preventDefault();
    };

    private renderBubble(message: string) {
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
    }
}

export default injectIntl(OperatorDropdownItem);
