// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import * as classNames from "classnames";
import noop = require("lodash/noop");

export interface IAddTotalButtonProps {
    onClick: () => void;
    hidden: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export class AddTotalButton extends React.PureComponent<IAddTotalButtonProps> {
    public static defaultProps: Partial<IAddTotalButtonProps> = {
        onClick: noop,
        onMouseEnter: noop,
        onMouseLeave: noop,
        hidden: false,
    };

    public render() {
        const className = classNames(
            {
                hidden: this.props.hidden,
            },
            "s-total-add-row",
            "indigo-totals-add-row-button",
        );

        return (
            <div
                className={className}
                onClick={this.props.onClick}
                onMouseEnter={this.props.onMouseEnter}
                onMouseLeave={this.props.onMouseLeave}
            />
        );
    }
}
