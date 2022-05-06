// (C) 2020 GoodData Corporation
import React from "react";
import { DefaultShareButton } from "./DefaultShareButton";
import { IShareButtonProps } from "./types";

/**
 * @internal
 */
export const ShareButton = (props: IShareButtonProps): JSX.Element => {
    // No customization from useDashboardComponentsContext for now
    return <DefaultShareButton {...props} />;
};
