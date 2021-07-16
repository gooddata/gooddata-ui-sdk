// (C) 2020 GoodData Corporation
import React, { createContext, useContext } from "react";

import { ITopBarProps } from "./types";

// TODO throw some error ideally
const TopBarPropsContext = createContext<ITopBarProps>({} as any);

/**
 * @alpha
 */
export const useTopBarProps = (): ITopBarProps => {
    return useContext(TopBarPropsContext);
};

/**
 * @internal
 */
export const TopBarPropsProvider: React.FC<ITopBarProps> = (props) => {
    const { children, ...restProps } = props;
    const parentContextProps = useTopBarProps();

    // no need to memo, rest props is new on each render anyway
    const effectiveProps = { ...parentContextProps, ...restProps };

    return <TopBarPropsContext.Provider value={effectiveProps}>{children}</TopBarPropsContext.Provider>;
};
