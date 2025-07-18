// (C) 2021-2025 GoodData Corporation
import { useDashboardComponentsContext } from "../../../../dashboardContexts/index.js";

import { ISettingButtonProps } from "./types.js";

/**
 * @internal
 */
export function SettingButton(props: ISettingButtonProps) {
    const { SettingButtonComponent } = useDashboardComponentsContext();
    return <SettingButtonComponent {...props} />;
}
