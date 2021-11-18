// (C) 2021 GoodData Corporation
import React, { PropsWithChildren } from "react";

import { IButtonBarProps } from "./types";
// import { DefaultShareButton } from "../shareButton";

/**
 * @alpha
 */
export const DefaultButtonBar: React.FC<PropsWithChildren<IButtonBarProps>> = (props): JSX.Element => {
    const { children /*, ...shareButtonProps */ } = props;

    // TODO INE allow customization of buttons via getter from props
    return (
        <div className="dash-control-buttons">
            {children}
            {/* <DefaultShareButton {...shareButtonProps} /> */}
        </div>
    );
};
