// (C) 2007-2025 GoodData Corporation

import { memo, useMemo } from "react";

import cx from "classnames";

import { type ISpinnerProps } from "./typings.js";

/**
 * @internal
 */
export const Spinner = memo(function Spinner({ className = "" }: ISpinnerProps) {
    const spinnerTicks = useMemo(() => {
        const items = [];

        for (let i = 1; i <= 8; i += 1) {
            const tickClassName = `gd-dot-spinner-${i}`;
            items.push(<div className={tickClassName} key={tickClassName} />);
        }

        return items;
    }, []);

    const spinnerClasses = useMemo(
        () =>
            cx({
                "gd-dot-spinner": true,
                [className]: !!className,
            }),
        [className],
    );

    return <div className={spinnerClasses}>{spinnerTicks}</div>;
});
