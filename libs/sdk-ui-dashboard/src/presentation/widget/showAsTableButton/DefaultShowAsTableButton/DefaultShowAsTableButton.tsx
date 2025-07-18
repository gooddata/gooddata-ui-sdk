// (C) 2025 GoodData Corporation
import { ReactElement } from "react";
import { IShowAsTableButtonProps } from "../types.js";
import { ShowAsTableButton } from "./ShowAsTableButton.js";

/**
 * @internal
 */
export function DefaultShowAsTableButton(props: IShowAsTableButtonProps): ReactElement {
    return <ShowAsTableButton {...props} />;
}
