// (C) 2025 GoodData Corporation
import React, { ReactElement } from "react";
import { IShowAsTableButtonProps } from "../types.js";
import { ShowAsTableButton } from "./ShowAsTableButton.js";

/**
 * @internal
 */
export const DefaultShowAsTableButton = (props: IShowAsTableButtonProps): ReactElement => {
    return <ShowAsTableButton {...props} />;
};
