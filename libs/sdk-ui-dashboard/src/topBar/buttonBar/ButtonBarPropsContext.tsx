// (C) 2020 GoodData Corporation
import React, { createContext, useContext } from "react";

import { IButtonBarProps } from "./types";

// TODO throw some error ideally
const ButtonBarPropsContext = createContext<IButtonBarProps>({} as any);

/**
 * @alpha
 */
export const useButtonBarProps = (): IButtonBarProps => {
    return useContext(ButtonBarPropsContext);
};

/**
 * @internal
 */
export const ButtonBarPropsProvider: React.FC<IButtonBarProps> = (props) => {
    const { children, ...restProps } = props;
    const parentContextProps = useButtonBarProps();

    // no need to memo, rest props is new on each render anyway
    const effectiveProps = { ...parentContextProps, ...restProps };

    return <ButtonBarPropsContext.Provider value={effectiveProps}>{children}</ButtonBarPropsContext.Provider>;
};
