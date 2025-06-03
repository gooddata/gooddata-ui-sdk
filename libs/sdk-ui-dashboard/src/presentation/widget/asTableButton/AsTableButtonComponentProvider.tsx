// (C) 2025 GoodData Corporation
import React, { createContext, useContext, ReactNode } from "react";
import { IAsTableButtonProps } from "./types.js";
import { AsTableButton } from "./AsTableButton.js";

interface AsTableButtonComponentContextType {
    AsTableButtonComponent: React.FC<IAsTableButtonProps>;
}

const AsTableButtonComponentContext = createContext<AsTableButtonComponentContextType | undefined>(undefined);

export const AsTableButtonComponentProvider: React.FC<{
    AsTableButtonComponent: React.FC<IAsTableButtonProps>;
    children: ReactNode;
}> = ({ AsTableButtonComponent, children }) => {
    return (
        <AsTableButtonComponentContext.Provider value={{ AsTableButtonComponent }}>
            {children}
        </AsTableButtonComponentContext.Provider>
    );
};

export const useAsTableButtonComponent = (): AsTableButtonComponentContextType => {
    const context = useContext(AsTableButtonComponentContext);
    if (!context) {
        return { AsTableButtonComponent: AsTableButton };
    }
    return context;
};
