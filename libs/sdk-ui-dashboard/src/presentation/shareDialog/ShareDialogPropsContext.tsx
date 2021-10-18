// (C) 2020 GoodData Corporation
import React, { createContext, useContext } from "react";

import { IShareDialogProps } from "./types";

const ShareDialogPropsContext = createContext<IShareDialogProps>({} as any);

/**
 * @alpha
 */
export const useShareDialogProps = (): IShareDialogProps => {
    return useContext(ShareDialogPropsContext);
};

/**
 * @internal
 */
export const ShareDialogPropsProvider: React.FC<IShareDialogProps> = (props) => {
    const { children, ...restProps } = props;
    const parentContextProps = useShareDialogProps();

    // no need to memo, rest props is new on each render anyway
    const effectiveProps = { ...parentContextProps, ...restProps };

    return (
        <ShareDialogPropsContext.Provider value={effectiveProps}>{children}</ShareDialogPropsContext.Provider>
    );
};
