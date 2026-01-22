// (C) 2022-2026 GoodData Corporation

import { type ComponentPropsWithRef, type ComponentType } from "react";

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectEnableSlideshowExports } from "../../model/store/config/configSelectors.js";
import { selectRenderMode } from "../../model/store/renderMode/renderModeSelectors.js";
import { type RenderMode } from "../../types.js";

/**
 * Returns a component that wraps components for different render modes and automatically chooses the correct one.
 * If component for current render mode is not defined, component for "view" mode is used.
 *
 * @param components - the components to choose from
 * @internal
 */
export function renderModeAware<T extends ComponentType<any>>(
    components: { view: T } & Partial<Record<RenderMode, T>>,
): ComponentType<ComponentPropsWithRef<T>> {
    function RenderModeAware(props: ComponentPropsWithRef<T>) {
        const renderMode = useDashboardSelector(selectRenderMode);
        const isExportModeEnabled = useDashboardSelector(selectEnableSlideshowExports);
        const sanitizedRenderMode = isExportModeEnabled || renderMode !== "export" ? renderMode : "view";

        const Component = components[sanitizedRenderMode] ?? components["view"];

        return <Component {...props} />;
    }

    return RenderModeAware;
}
