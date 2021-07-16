// (C) 2020 GoodData Corporation
import React, { createContext, useContext } from "react";

import { IScheduledEmailDialogProps } from "./types";

// TODO throw some error ideally
const ScheduledEmailPropsContext = createContext<IScheduledEmailDialogProps>({} as any);

/**
 * @alpha
 */
export const useScheduledEmailDialogProps = (): IScheduledEmailDialogProps => {
    return useContext(ScheduledEmailPropsContext);
};

/**
 * @internal
 */
export const ScheduledEmailDialogPropsProvider: React.FC<IScheduledEmailDialogProps> = (props) => {
    const { children, ...restProps } = props;
    const parentContextProps = useScheduledEmailDialogProps();

    // no need to memo, rest props is new on each render anyway
    const effectiveProps = { ...parentContextProps, ...restProps };

    return (
        <ScheduledEmailPropsContext.Provider value={effectiveProps}>
            {children}
        </ScheduledEmailPropsContext.Provider>
    );
};
