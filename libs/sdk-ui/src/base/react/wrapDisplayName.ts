// (C) 2019-2020 GoodData Corporation

/**
 * Get displayName of React component
 * @internal
 */
const getDisplayName = (Component: React.ComponentType<any>) => {
    return Component.displayName || Component.name || "Component";
};

/**
 * Wrap displayName of React component
 * @internal
 */
export const wrapDisplayName = (
    hocName: string,
    BaseComponent?: React.ComponentType<any>,
): (<T>(Component: React.ComponentType<T>) => React.ComponentType<T>) => {
    return <T>(Component: React.ComponentType<T>) => {
        const componentName = getDisplayName(BaseComponent || Component);
        Component.displayName = `${hocName}(${componentName})`;

        return Component;
    };
};
