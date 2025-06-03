// (C) 2025 GoodData Corporation
import React from "react";
import { IShowAsTableButtonProps } from "../types.js";
import { ShowAsTableButton } from "./ShowAsTableButton.js";

/**
 * @internal
 */
export const DefaultShowAsTableButton = (props: IShowAsTableButtonProps): JSX.Element => {
    return <ShowAsTableButton {...props} />;
};
