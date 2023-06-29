// (C) 2007-2019 GoodData Corporation
import React from "react";
import cx from "classnames";
import { ISelectItemOption } from "./types.js";
import { itemToString } from "./utils.js";

// eslint-disable-next-line @typescript-eslint/ban-types
export const SelectButton = <V extends {}>({
    selectedItem,
    isOpen,
    getToggleButtonProps,
}: {
    selectedItem: ISelectItemOption<V>;
    isOpen: boolean;
    getToggleButtonProps: () => any;
}): JSX.Element => (
    // TODO: Replace with goodstrap Button once it supports aria props
    // This needs to be a button element, because Downshift requires something that can get focus
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
SelectButton.defaultProps = {
    selectedItem: null,
};
