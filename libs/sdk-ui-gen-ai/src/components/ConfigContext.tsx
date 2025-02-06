// (C) 2024-2025 GoodData Corporation
import * as React from "react";

export type ConfigContext = {
    allowCreateVisualization: boolean;
};

const configContext = React.createContext<ConfigContext>({
    allowCreateVisualization: false,
});

export const ConfigProvider: React.FC<React.PropsWithChildren<ConfigContext>> = ({
    children,
    allowCreateVisualization,
}) => {
    return <configContext.Provider value={{ allowCreateVisualization }}>{children}</configContext.Provider>;
};

export const useConfig = (): ConfigContext => {
    return React.useContext(configContext);
};
