// (C) 2025 GoodData Corporation
import React, { createContext, useContext, useState } from "react";

import { ICoinContextProps, ICoinContextValue } from "./types.js";

const CoinContext = createContext<ICoinContextValue>({
    coinCount: 0,
    setCoinCount: () => {},
    addCoin: () => {},
});
CoinContext.displayName = "Coin Context";

/**
 * @alpha
 */
export const CoinProvider: React.FC<Partial<ICoinContextProps>> = ({ children, ...props }) => {
    const [coinCount, setCoinCount] = useState<number>(props.coinCount ?? 10);

    const addCoin = () => {
        setCoinCount((prevCount) => prevCount + 1);
    };

    return (
        <CoinContext.Provider
            value={{
                coinCount,
                setCoinCount,
                addCoin,
                ...props,
            }}
        >
            {children}
        </CoinContext.Provider>
    );
};

/**
 * Hook that provides access to coin count state and setter function.
 * Must be used within a CoinProvider.
 *
 * @alpha
 */
export const useCoinContext = (): ICoinContextValue => {
    const context = useContext(CoinContext);
    if (context.coinCount === undefined && context.setCoinCount === undefined) {
        throw new Error("useCoinContext must be used within a CoinProvider");
    }
    return context;
};
