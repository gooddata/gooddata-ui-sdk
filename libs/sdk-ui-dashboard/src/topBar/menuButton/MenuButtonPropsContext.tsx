// (C) 2020 GoodData Corporation
import React, { createContext, useContext, useMemo } from "react";

import { useDashboardConfigContext } from "../../dashboardContexts";

import { IMenuButtonConfiguration, IMenuButtonProps } from "./types";

// TODO throw some error ideally
const MenuButtonPropsContext = createContext<IMenuButtonProps>({} as any);

/**
 * @alpha
 */
export const useMenuButtonProps = (config: IMenuButtonConfiguration = {}): IMenuButtonProps => {
    const contextValue = useContext(MenuButtonPropsContext);
    const configContextValue = useDashboardConfigContext();
    const effectiveConfig: IMenuButtonConfiguration = { ...configContextValue?.menuButtonConfig, ...config };

    const { additionalMenuItems, menuItems } = effectiveConfig;

    const effectiveMenuItems = useMemo(() => {
        if (menuItems) {
            return menuItems;
        }

        return (additionalMenuItems ?? []).reduce((acc, [index, item]) => {
            if (index === -1) {
                acc.push(item);
            } else {
                acc.splice(index, 0, item);
            }
            return acc;
        }, contextValue?.menuItems ?? []);
    }, [menuItems, additionalMenuItems]);

    return { ...contextValue, menuItems: effectiveMenuItems };
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
