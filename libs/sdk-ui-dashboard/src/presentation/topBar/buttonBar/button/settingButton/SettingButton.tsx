// (C) 2021-2025 GoodData Corporation

import { type ReactElement } from "react";

import { type ISettingButtonProps } from "./types.js";
import { useDashboardComponentsContext } from "../../../../dashboardContexts/index.js";

/**
 * @internal
 */
export function SettingButton(props: ISettingButtonProps): ReactElement {
    const { SettingButtonComponent } = useDashboardComponentsContext();
    return <SettingButtonComponent {...props} />;
}
