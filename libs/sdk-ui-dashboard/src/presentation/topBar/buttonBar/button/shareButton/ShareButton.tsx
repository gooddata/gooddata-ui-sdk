// (C) 2020-2025 GoodData Corporation

import { type ReactElement } from "react";

import { DefaultShareButton } from "./DefaultShareButton.js";
import { type IShareButtonProps } from "./types.js";

/**
 * @internal
 */
export function ShareButton(props: IShareButtonProps): ReactElement {
    // No customization from useDashboardComponentsContext for now
    return <DefaultShareButton {...props} />;
}
