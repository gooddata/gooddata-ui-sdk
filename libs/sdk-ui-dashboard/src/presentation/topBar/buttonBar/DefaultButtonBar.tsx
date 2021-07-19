// (C) 2021 GoodData Corporation
import React from "react";

import { IButtonBarProps } from "./types";
import { ButtonBarPropsProvider } from "./ButtonBarPropsContext";

/**
 * @internal
 */
export const DefaultButtonBarInner = (): JSX.Element | null => {
    return null;
};

/**
 * @alpha
 */
export const DefaultButtonBar = (_props: IButtonBarProps): JSX.Element => {
    return (
        <ButtonBarPropsProvider>
            <DefaultButtonBarInner />
        </ButtonBarPropsProvider>
    );
};
