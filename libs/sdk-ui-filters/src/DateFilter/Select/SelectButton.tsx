// (C) 2007-2026 GoodData Corporation

import { type ReactElement } from "react";

import cx from "classnames";

import { type ISelectItemOption } from "./types.js";
import { itemToString } from "./utils.js";

// oxlint-disable-next-line @typescript-eslint/no-empty-object-type
export function SelectButton<V extends {}>({
    selectedItem,
    isOpen,
    getToggleButtonProps,
}: {
    selectedItem: ISelectItemOption<V>;
    isOpen: boolean;
    getToggleButtonProps: () => Record<string, unknown>;
}): ReactElement {
    return (
        <button
            {...getToggleButtonProps()}
            type="button"
            className={cx(
                "gd-button-primary",
                "gd-button-small",
                "button-dropdown",
                "dropdown-button",
                isOpen && "is-active",
            )}
        >
            <span className="gd-button-text">{itemToString(selectedItem)}</span>
            <span className={cx("gd-button-icon", isOpen ? "gd-icon-navigateup" : "gd-icon-navigatedown")} />
        </button>
    );
}
