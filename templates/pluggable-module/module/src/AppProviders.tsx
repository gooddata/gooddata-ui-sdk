// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";
import { AppProviders as SdkAppProviders } from "@gooddata/sdk-ui-pluggable-application";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES, resolveMessages } from "./translations/translations.js";

interface IAppProvidersProps {
    ctx: IPlatformContext;
}

export function AppProviders({ ctx, children }: PropsWithChildren<IAppProvidersProps>) {
    return (
        <SdkAppProviders
            ctx={ctx}
            packageName="gdc-app-template-name-module"
            resolveMessages={resolveMessages}
            defaultMessages={DEFAULT_MESSAGES}
            defaultLanguage={DEFAULT_LANGUAGE}
        >
            {children}
        </SdkAppProviders>
    );
}
