// (C) 2020 GoodData Corporation
import React, { createContext, useContext } from "react";

import { ITitleProps } from "./types";

// TODO throw some error ideally
const TitlePropsContext = createContext<ITitleProps>({} as any);

/**
 * @alpha
 */
export const useTitleProps = (): ITitleProps => {
    return useContext(TitlePropsContext);
};

/**
 * @internal
 */
export const TitlePropsProvider: React.FC<ITitleProps> = (props) => {
    const { children, ...restProps } = props;
    const parentContextProps = useTitleProps();

    // no need to memo, rest props is new on each render anyway
    const effectiveProps = { ...parentContextProps, ...restProps };

    return <TitlePropsContext.Provider value={effectiveProps}>{children}</TitlePropsContext.Provider>;
};
