// (C) 2020 GoodData Corporation
import React, { createContext, useContext } from "react";

import { ISaveAsDialogProps } from "./types";

const SaveAsPropsContext = createContext<ISaveAsDialogProps>({} as any);

/**
 * @alpha
 */
export const useSaveAsDialogProps = (): ISaveAsDialogProps => {
    return useContext(SaveAsPropsContext);
};

/**
 * @internal
 */
export const SaveAsDialogPropsProvider: React.FC<ISaveAsDialogProps> = (props) => {
    const { children, ...restProps } = props;
    const parentContextProps = useSaveAsDialogProps();

    // no need to memo, rest props is new on each render anyway
    const effectiveProps = { ...parentContextProps, ...restProps };

    return <SaveAsPropsContext.Provider value={effectiveProps}>{children}</SaveAsPropsContext.Provider>;
};
