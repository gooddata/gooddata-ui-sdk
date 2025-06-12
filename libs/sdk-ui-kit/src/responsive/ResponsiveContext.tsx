// (C) 2020 GoodData Corporation
import React, { useContext } from "react";
import {
    SCREEN_BREAKPOINT_XS,
    SCREEN_BREAKPOINT_SM,
    SCREEN_BREAKPOINT_MD,
    SCREEN_BREAKPOINT_LG,
    SCREEN_BREAKPOINT_XL,
    SCREEN_BREAKPOINT_XXL,
} from "./constants/breakpoints.js";
import { IResponsiveConfig } from "./interfaces.js";

const defaultResponsiveContext: IResponsiveConfig = {
    breakpoints: {
        xs: SCREEN_BREAKPOINT_XS,
        sm: SCREEN_BREAKPOINT_SM,
        md: SCREEN_BREAKPOINT_MD,
        lg: SCREEN_BREAKPOINT_LG,
        xl: SCREEN_BREAKPOINT_XL,
        xxl: SCREEN_BREAKPOINT_XXL,
    },
};

const responsiveContext = React.createContext(defaultResponsiveContext);

responsiveContext.displayName = "ResponsiveContext";

/**
 * @internal
 */
export const ResponsiveContextProvider = responsiveContext.Provider;

/**
 * Hook to consume responsive context.
 *
 * @internal
 */
export const useResponsiveContext = (): IResponsiveConfig => useContext<IResponsiveConfig>(responsiveContext);
