// (C) 2020-2025 GoodData Corporation
import { DefaultShareButton } from "./DefaultShareButton.js";
import { IShareButtonProps } from "./types.js";

/**
 * @internal
 */
export function ShareButton(props: IShareButtonProps) {
    // No customization from useDashboardComponentsContext for now
    return <DefaultShareButton {...props} />;
}
