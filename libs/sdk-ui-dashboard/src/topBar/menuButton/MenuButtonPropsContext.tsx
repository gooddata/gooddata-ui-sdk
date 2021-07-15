// (C) 2020 GoodData Corporation
import React, { createContext, useContext } from "react";

import { IMenuButtonProps } from "./types";

// TODO throw some error ideally
const MenuButtonPropsContext = createContext<IMenuButtonProps>({} as any);

/**
 * @alpha
 */
export const useMenuButtonProps = (): IMenuButtonProps => {
    return useContext(MenuButtonPropsContext);
};

/**
 * @internal
 */
export const MenuButtonPropsProvider: React.FC<IMenuButtonProps> = (props) => {
    const { children, ...restProps } = props;
    const parentContextProps = useMenuButtonProps();

    // no need to memo, rest props is new on each render anyway
    const effectiveProps = { ...parentContextProps, ...restProps };

    return (
        <MenuButtonPropsContext.Provider value={effectiveProps}>{children}</MenuButtonPropsContext.Provider>
    );
};
