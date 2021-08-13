// (C) 2021 GoodData Corporation
import React from "react";

import { IButtonBarProps } from "./types";
import { ButtonBarPropsProvider } from "./ButtonBarPropsContext";

/**
 * @internal
 */
export const DefaultButtonBarInner = (props: IButtonBarProps): JSX.Element | null => {
    if (React.Children.count(props.children) > 0) {
        return <div className="dash-control-buttons">{props.children}</div>;
    }
    return null;
};

/**
 * @alpha
 */
export const DefaultButtonBar = (props: IButtonBarProps): JSX.Element => {
    return (
        <ButtonBarPropsProvider>
            <DefaultButtonBarInner {...props} />
        </ButtonBarPropsProvider>
    );
};
