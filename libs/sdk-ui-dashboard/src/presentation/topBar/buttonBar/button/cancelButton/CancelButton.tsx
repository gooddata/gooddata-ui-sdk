// (C) 2021-2025 GoodData Corporation

import { ReactElement } from "react";

import { DefaultCancelButton } from "./DefaultCancelButton.js";
import { ICancelButtonProps } from "./types.js";

/**
 * @internal
 */
export function CancelButton(props: ICancelButtonProps): ReactElement {
    // No customization from useDashboardComponentsContext for now
    return <DefaultCancelButton {...props} />;
}
