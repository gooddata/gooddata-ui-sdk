// (C) 2022 GoodData Corporation
import React, { ComponentPropsWithRef, ComponentType } from "react";
import { useDashboardSelector, selectRenderMode } from "../../model/index.js";
import { RenderMode } from "../../types.js";

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
    return function RenderModeAware(props: ComponentPropsWithRef<T>) {
        const renderMode = useDashboardSelector(selectRenderMode);
        const Component = components[renderMode] ?? components["view"];

        return <Component {...props} />;
    };
}
