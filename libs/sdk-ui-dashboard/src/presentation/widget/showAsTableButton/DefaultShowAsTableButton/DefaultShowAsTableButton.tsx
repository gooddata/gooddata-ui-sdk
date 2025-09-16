// (C) 2025 GoodData Corporation

import { ReactElement } from "react";

import { ShowAsTableButton } from "./ShowAsTableButton.js";
import { IShowAsTableButtonProps } from "../types.js";

/**
 * @internal
 */
export function DefaultShowAsTableButton(props: IShowAsTableButtonProps): ReactElement {
    return <ShowAsTableButton {...props} />;
}
