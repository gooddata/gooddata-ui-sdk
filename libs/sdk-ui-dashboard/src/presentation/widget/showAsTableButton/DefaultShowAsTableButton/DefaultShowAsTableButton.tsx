// (C) 2025-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IShowAsTableButtonProps } from "../types.js";
import { ShowAsTableButton } from "./ShowAsTableButton.js";

/**
 * @internal
 */
export function DefaultShowAsTableButton(props: IShowAsTableButtonProps): ReactElement {
    return <ShowAsTableButton {...props} />;
}
