// (C) 2020-2025 GoodData Corporation

import { ReactElement } from "react";

import { DefaultShareButton } from "./DefaultShareButton.js";
import { IShareButtonProps } from "./types.js";

/**
 * @internal
 */
export function ShareButton(props: IShareButtonProps): ReactElement {
    // No customization from useDashboardComponentsContext for now
    return <DefaultShareButton {...props} />;
}
