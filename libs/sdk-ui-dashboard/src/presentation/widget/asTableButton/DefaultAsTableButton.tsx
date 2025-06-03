// (C) 2025 GoodData Corporation
import React from "react";
import { IAsTableButtonProps } from "./types.js";
import { AsTableButton } from "./AsTableButton.js";

/**
 * @internal
 */
export const DefaultAsTableButton = (props: IAsTableButtonProps): JSX.Element => {
    return <AsTableButton {...props} />;
};
