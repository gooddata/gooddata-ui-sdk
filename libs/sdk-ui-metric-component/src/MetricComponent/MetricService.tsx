// (C) 2021-2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { LanguageServiceProvider } from "../MaqlEditor/languageService/LanguageServiceContext.js";
import { MetricsReloadContextProvider } from "../shared/metrics/MetricsReloadContext.js";

import {
    FeaturesAndSettingsContextProvider,
    type IFeaturesAndSettingsContext,
} from "./FeaturesAndSettings/index.js";

export interface IMetricServiceProps {
    settings?: Partial<IFeaturesAndSettingsContext>;
}

export function MetricService({ children, settings = {} }: PropsWithChildren<IMetricServiceProps>) {
    return (
        <FeaturesAndSettingsContextProvider {...settings}>
            <MetricsReloadContextProvider>
                <LanguageServiceProvider>{children}</LanguageServiceProvider>
            </MetricsReloadContextProvider>
        </FeaturesAndSettingsContextProvider>
    );
}
