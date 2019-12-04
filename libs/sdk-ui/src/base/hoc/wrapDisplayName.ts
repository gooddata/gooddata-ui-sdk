// (C) 2019 GoodData Corporation

/**
 * Get displayName of React component
 * @internal
 */
const getDisplayName = (Component: React.ComponentType) => {
    return Component.displayName || Component.name || "Component";
};

/**
 * Wrap displayName of React component
 * @internal
 */
export const wrapDisplayName = (hocName: string, BaseComponent?: React.ComponentType) => <T>(
    Component: React.ComponentType<T>,
) => {
    const displayName = `${hocName}(${getDisplayName(BaseComponent || Component)})`;
    Component.displayName = displayName;
    return Component;
};
