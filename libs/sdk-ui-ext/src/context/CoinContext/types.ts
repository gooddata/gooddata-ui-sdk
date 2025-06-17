// (C) 2025 GoodData Corporation

/**
 * @alpha
 */
export interface ICoinContextProps {
    coinCount: number;
    setCoinCount: (count: number) => void;
    children?: React.ReactNode;
}

/**
 * @alpha
 */
export interface ICoinContextValue {
    coinCount: number;
    setCoinCount: (count: number) => void;
    addCoin: () => void;
}
