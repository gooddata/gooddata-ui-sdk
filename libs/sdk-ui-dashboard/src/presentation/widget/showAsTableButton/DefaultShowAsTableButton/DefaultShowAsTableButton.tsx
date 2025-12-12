// (C) 2025 GoodData Corporation

import { type ReactElement } from "react";

import { ShowAsTableButton } from "./ShowAsTableButton.js";
import { type IShowAsTableButtonProps } from "../types.js";

/**
 * @internal
 */
export function DefaultShowAsTableButton(props: IShowAsTableButtonProps): ReactElement {
    return <ShowAsTableButton {...props} />;
}
