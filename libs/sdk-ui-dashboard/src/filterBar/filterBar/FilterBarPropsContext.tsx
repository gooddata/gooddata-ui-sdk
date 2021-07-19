// (C) 2020 GoodData Corporation
import React, { createContext, useContext } from "react";

import { IFilterBarProps } from "./types";

// TODO throw some error ideally
const FilterBarPropsContext = createContext<IFilterBarProps>({} as any);

/**
 * @alpha
 */
export const useFilterBarProps = (): IFilterBarProps => {
    return useContext(FilterBarPropsContext);
};

/**
 * @internal
 */
export const FilterBarPropsProvider: React.FC<IFilterBarProps> = (props) => {
    const { children, ...restProps } = props;
    const parentContextProps = useFilterBarProps();

    // no need to memo, rest props is new on each render anyway
    const effectiveProps = { ...parentContextProps, ...restProps };

    return <FilterBarPropsContext.Provider value={effectiveProps}>{children}</FilterBarPropsContext.Provider>;
};
