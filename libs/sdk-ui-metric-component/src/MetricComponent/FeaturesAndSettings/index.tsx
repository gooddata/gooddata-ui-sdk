// (C) 2022-2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo } from "react";

import { type ObjectVisibility } from "@gooddata/sdk-model";

export interface IFeaturesAndSettingsContext {
    canShowResults: boolean;
    canShowSql: boolean;
    canMaximize: boolean;
    /**
     * When set, a metric's own object-level permissions decide who may edit or share it.
     * Remove together with the enableMetricPermissions feature flag.
     */
    enableMetricPermissions: boolean;
    /** Who can view a metric once it is created. */
    defaultMetricVisibility: ObjectVisibility;
}

const Defaults: IFeaturesAndSettingsContext = {
    canShowResults: false,
    canShowSql: false,
    canMaximize: false,
    enableMetricPermissions: false,
    defaultMetricVisibility: "RESTRICTED",
};

export const FeaturesAndSettingsContext = createContext<IFeaturesAndSettingsContext>(Defaults);

export function FeaturesAndSettingsContextProvider({
    children,
    canShowResults = Defaults.canShowResults,
    canShowSql = Defaults.canShowSql,
    canMaximize = Defaults.canMaximize,
    enableMetricPermissions = Defaults.enableMetricPermissions,
    defaultMetricVisibility = Defaults.defaultMetricVisibility,
}: PropsWithChildren<Partial<IFeaturesAndSettingsContext>>) {
    const contextValue = useMemo<IFeaturesAndSettingsContext>(
        (): IFeaturesAndSettingsContext => ({
            canShowSql,
            canShowResults,
            canMaximize,
            enableMetricPermissions,
            defaultMetricVisibility,
        }),
        [canShowResults, canShowSql, canMaximize, enableMetricPermissions, defaultMetricVisibility],
    );

    return (
        <FeaturesAndSettingsContext.Provider value={contextValue}>
            {children}
        </FeaturesAndSettingsContext.Provider>
    );
}

export function useFeaturesAndSettings(): IFeaturesAndSettingsContext {
    const data = useContext(FeaturesAndSettingsContext);

    return data || Defaults;
}
