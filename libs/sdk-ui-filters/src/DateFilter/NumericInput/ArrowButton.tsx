// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import constant = require("lodash/constant");
import cx from "classnames";
import { unless } from "./utils";

type ArrowDirection = "increment" | "decrement";

const iconClassNames: { [AD in ArrowDirection]: string } = {
    decrement: "icon-chevron-down",
    increment: "icon-chevron-up",
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
        // tslint:disable-next-line:jsx-no-lambda
        onClick={() => unless(constant(props.disabled), props.onClick)}
        aria-hidden="true"
        disabled={props.disabled}
    />
);
