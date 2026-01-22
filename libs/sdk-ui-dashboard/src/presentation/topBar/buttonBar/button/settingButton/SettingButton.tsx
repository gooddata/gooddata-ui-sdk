// (C) 2021-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type ISettingButtonProps } from "./types.js";
import { useDashboardComponentsContext } from "../../../../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function SettingButton(props: ISettingButtonProps): ReactElement {
    const { SettingButtonComponent } = useDashboardComponentsContext();
    return <SettingButtonComponent {...props} />;
}
