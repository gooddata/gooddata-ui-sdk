// (C) 2021 GoodData Corporation
import React, { PropsWithChildren } from "react";

import { IButtonBarProps } from "./types";
import { ButtonBarPropsProvider, useButtonBarProps } from "./ButtonBarPropsContext";
import { ShareButtonPropsProvider, DefaultShareButtonInner } from "../shareButton";

/**
 * @internal
 */
export const DefaultButtonBarInner = (): JSX.Element | null => {
    const { shareButtonProps, buttons } = useButtonBarProps();
    // TODO INE allow customization of buttons via getter from props
    return (
        <div className="dash-control-buttons">
            {buttons}
            <ShareButtonPropsProvider {...shareButtonProps}>
                <DefaultShareButtonInner />
            </ShareButtonPropsProvider>
        </div>
    );
};

/**
 * @alpha
 */
export const DefaultButtonBar: React.FC<PropsWithChildren<IButtonBarProps>> = (props): JSX.Element => {
    const { children, ...restProps } = props;
    return (
        <ButtonBarPropsProvider {...restProps} buttons={children}>
            <DefaultButtonBarInner />
        </ButtonBarPropsProvider>
    );
};
