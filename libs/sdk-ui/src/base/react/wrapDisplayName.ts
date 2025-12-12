// (C) 2019-2025 GoodData Corporation

import { type ComponentType } from "react";

/**
 * Get displayName of React component
 * @internal
 */
const getDisplayName = (Component: ComponentType<any>) => {
    return Component.displayName || Component.name || "Component";
};

/**
 * Wrap displayName of React component
 * @internal
 */
export const wrapDisplayName = (
    hocName: string,
    BaseComponent?: ComponentType<any>,
): (<T>(Component: ComponentType<T>) => ComponentType<T>) => {
    return <T>(Component: ComponentType<T>) => {
        const componentName = getDisplayName(BaseComponent || Component);
        Component.displayName = `${hocName}(${componentName})`;

        return Component;
    };
};
