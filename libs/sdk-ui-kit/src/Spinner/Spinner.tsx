// (C) 2007-2020 GoodData Corporation
import React, { PureComponent, ReactNode } from "react";
import cx from "classnames";
import { ISpinnerProps } from "./typings.js";

/**
 * @internal
 */
export class Spinner extends PureComponent<ISpinnerProps> {
    static defaultProps = {
        className: "",
    };

    generateSpinnerTicks(): ReactNode[] {
        const items = [];

        for (let i = 1; i <= 8; i += 1) {
            const className = `gd-dot-spinner-${i}`;
            items.push(<div className={className} key={className} />);
        }

        return items;
    }

    render(): ReactNode {
        const { className } = this.props;
        const spinnerClasses = cx({
            "gd-dot-spinner": true,
            [className]: !!className,
        });

        return <div className={spinnerClasses}>{this.generateSpinnerTicks()}</div>;
    }
}
