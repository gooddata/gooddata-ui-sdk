// (C) 2025-2026 GoodData Corporation

import { type ComponentType, type PropsWithChildren, createContext, useContext, useMemo } from "react";

import { DefaultDisclaimer } from "./customized/Disclaimer.js";
import { DefaultLandingScreen } from "./customized/LandingScreen.js";
import { useFullscreenCheck } from "./hooks/useFullscreenCheck.js";

export type CustomizationContext = {
    landingScreenComponentProvider?: (props: {
        isFullscreen: boolean;
        isBigScreen: boolean;
        isSmallScreen: boolean;
    }) => ComponentType;
    disclaimerComponentProvider?: () => ComponentType | null;
};

const defaultCustomizationContext: Required<CustomizationContext> = {
    landingScreenComponentProvider:
        (props: { isFullscreen: boolean; isBigScreen: boolean; isSmallScreen: boolean }) => () => (
            <DefaultLandingScreen {...props} />
        ),
    disclaimerComponentProvider: () => DefaultDisclaimer,
};

const customizationContext = createContext(defaultCustomizationContext);

export function CustomizationProvider({
    children,
    landingScreenComponentProvider,
    disclaimerComponentProvider,
}: PropsWithChildren<CustomizationContext>) {
    const { isFullscreen, isBigScreen, isSmallScreen } = useFullscreenCheck();
    const value = useMemo(
        () => ({
            ...defaultCustomizationContext,
            ...(landingScreenComponentProvider
                ? {
                      landingScreenComponentProvider: () => () => (
                          <DefaultLandingScreen
                              LandingScreen={landingScreenComponentProvider({
                                  isFullscreen,
                                  isBigScreen,
                                  isSmallScreen,
                              })}
                              isFullscreen={isFullscreen}
                              isBigScreen={isBigScreen}
                              isSmallScreen={isSmallScreen}
                          />
                      ),
                  }
                : {}),
            ...(disclaimerComponentProvider ? { disclaimerComponentProvider } : {}),
        }),
        [
            landingScreenComponentProvider,
            disclaimerComponentProvider,
            isFullscreen,
            isBigScreen,
            isSmallScreen,
        ],
    );

    return <customizationContext.Provider value={value}>{children}</customizationContext.Provider>;
}

export const useCustomization = () => {
    const { landingScreenComponentProvider, disclaimerComponentProvider } = useContext(customizationContext);
    const { isFullscreen, isBigScreen, isSmallScreen } = useFullscreenCheck();

    return useMemo(
        () => ({
            LandingScreenComponent: landingScreenComponentProvider({
                isFullscreen,
                isBigScreen,
                isSmallScreen,
            }),
            DisclaimerComponent: disclaimerComponentProvider(),
        }),
        [
            landingScreenComponentProvider,
            disclaimerComponentProvider,
            isFullscreen,
            isBigScreen,
            isSmallScreen,
        ],
    );
};
