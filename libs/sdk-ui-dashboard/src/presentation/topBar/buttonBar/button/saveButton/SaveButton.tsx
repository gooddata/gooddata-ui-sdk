// (C) 2021-2025 GoodData Corporation
import { useDashboardComponentsContext } from "../../../../dashboardContexts/index.js";
import { ISaveButtonProps } from "./types.js";

/**
 * @internal
 */
export function SaveButton(props: ISaveButtonProps) {
    const { SaveButtonComponent } = useDashboardComponentsContext();
    return <SaveButtonComponent {...props} />;
}
