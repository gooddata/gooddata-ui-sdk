// (C) 2007-2019 GoodData Corporation
import React from "react";
import constant from "lodash/constant.js";
import cx from "classnames";
import { unless } from "./utils.js";

type ArrowDirection = "increment" | "decrement";

const iconClassNames: { [AD in ArrowDirection]: string } = {
    decrement: "gd-icon-chevron-down",
    increment: "gd-icon-chevron-up",
};

export const ArrowButton: React.FC<{
    onClick: () => void;
    arrowDirection: ArrowDirection;
    disabled?: boolean;
}> = (props) => (
    <button
        type="button"
        className={cx(
            "gd-input-suffix",
            "gd-numeric-button",
            `gd-numeric-button-${props.arrowDirection}`,
            `s-numeric-button-${props.arrowDirection}`,
            "gd-icon",
            iconClassNames[props.arrowDirection],
        )}
        onClick={() => unless(constant(props.disabled), props.onClick)}
        aria-hidden="true"
        disabled={props.disabled}
    />
);
