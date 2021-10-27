// (C) 2021 GoodData Corporation
import React, { createContext, useContext } from "react";

import { IShareButtonProps } from "./types";

const ShareButtonPropsContext = createContext<IShareButtonProps>({} as any);

/**
 * @alpha
 */
export const useShareButtonProps = (): IShareButtonProps => {
    return useContext(ShareButtonPropsContext);
};

/**
 * @internal
 */
export const ShareButtonPropsProvider: React.FC<IShareButtonProps> = (props) => {
    const { children, ...restProps } = props;
    const parentContextProps = useShareButtonProps();

    // no need to memo, rest props is new on each render anyway
    const effectiveProps = { ...parentContextProps, ...restProps };

    return (
        <ShareButtonPropsContext.Provider value={effectiveProps}>{children}</ShareButtonPropsContext.Provider>
    );
};
