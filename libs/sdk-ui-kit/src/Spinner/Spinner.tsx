// (C) 2007-2025 GoodData Corporation
import { memo, ReactNode } from "react";
import cx from "classnames";
import { ISpinnerProps } from "./typings.js";

/**
 * @internal
 */
export const Spinner = memo(function Spinner({ className = "" }: ISpinnerProps) {
    const generateSpinnerTicks = (): ReactNode[] => {
        const items = [];

        for (let i = 1; i <= 8; i += 1) {
            const className = `gd-dot-spinner-${i}`;
            items.push(<div className={className} key={className} />);
        }

        return items;
    };

    const spinnerClasses = cx({
        "gd-dot-spinner": true,
        [className]: !!className,
    });

    return <div className={spinnerClasses}>{generateSpinnerTicks()}</div>;
});
