// (C) 2021-2025 GoodData Corporation

import { type ReactElement } from "react";

import { DefaultEditButton } from "./DefaultEditButton.js";
import { type IEditButtonProps } from "./types.js";

/**
 * @internal
 */
export function EditButton(props: IEditButtonProps): ReactElement {
    // No customization from useDashboardComponentsContext for now
    return <DefaultEditButton {...props} />;
}
