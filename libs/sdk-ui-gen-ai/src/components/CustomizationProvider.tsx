// (C) 2025 GoodData Corporation

import { type ComponentType, type PropsWithChildren, createContext, useContext, useMemo } from "react";

import { DefaultLandingScreen } from "./customized/LandingScreen.js";

export type CustomizationContext = {
    landingScreenComponentProvider?: () => ComponentType;
};

const defaultCustomizationContext: Required<CustomizationContext> = {
    landingScreenComponentProvider: () => DefaultLandingScreen,
};

const customizationContext = createContext(defaultCustomizationContext);

export function CustomizationProvider({
    children,
    landingScreenComponentProvider,
}: PropsWithChildren<CustomizationContext>) {
    const value = useMemo(
        () => ({
            ...defaultCustomizationContext,
            ...(landingScreenComponentProvider
                ? {
                      landingScreenComponentProvider: () => () => (
                          <DefaultLandingScreen LandingScreen={landingScreenComponentProvider()} />
                      ),
                  }
                : {}),
        }),
        [landingScreenComponentProvider],
    );

    return <customizationContext.Provider value={value}>{children}</customizationContext.Provider>;
}

export const useCustomization = () => {
    const { landingScreenComponentProvider } = useContext(customizationContext);

    return useMemo(
        () => ({
            LandingScreenComponent: landingScreenComponentProvider(),
        }),
        [landingScreenComponentProvider],
    );
};
