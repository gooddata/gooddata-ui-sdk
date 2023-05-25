// (C) 2020 GoodData Corporation
import React from "react";
import { DefaultShareButton } from "./DefaultShareButton.js";
import { IShareButtonProps } from "./types.js";

/**
 * @internal
 */
export const ShareButton = (props: IShareButtonProps): JSX.Element => {
    // No customization from useDashboardComponentsContext for now
    return <DefaultShareButton {...props} />;
};
