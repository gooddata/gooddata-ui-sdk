// (C) 2007-2025 GoodData Corporation

import cx from "classnames";
import { constant } from "lodash-es";

import { unless } from "./utils.js";

type ArrowDirection = "increment" | "decrement";

const iconClassNames: { [AD in ArrowDirection]: string } = {
    decrement: "gd-icon-chevron-down",
    increment: "gd-icon-chevron-up",
};

export function ArrowButton(props: {
    onClick: () => void;
    arrowDirection: ArrowDirection;
    disabled?: boolean;
}) {
    return (
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
            onClick={() => unless(constant(props.disabled ?? false), props.onClick)}
            aria-hidden="true"
            disabled={props.disabled}
        />
    );
}
