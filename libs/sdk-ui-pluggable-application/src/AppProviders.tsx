// (C) 2026 GoodData Corporation

import { type PropsWithChildren, useMemo } from "react";

import { IntlProvider } from "react-intl";

import { type ILocale } from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";
import {
    BackendProvider,
    type ITranslations,
    WorkspaceProvider,
    resolveLocale,
    useResolveMessages,
} from "@gooddata/sdk-ui";
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";

import { createBackendForModule } from "./backend.js";
import { type IClientPlatformContext, PlatformContextProvider } from "./context.js";

/**
 * Props for {@link AppProviders}.
 *
 * @alpha
 */
export interface IAppProvidersProps {
    /**
     * Platform context snapshot provided by the host (from mount options).
     */
    ctx: IPlatformContext;

    /**
     * Package name reported to the backend for telemetry.
     */
    packageName: string;

    /**
     * Asynchronous translation message resolver — typically the memoized
     * `resolveMessages` function exported from the module's `translations.ts`.
     */
    resolveMessages: (locale: string) => Promise<ITranslations>;

    /**
     * Eagerly-loaded default messages keyed by locale.
     * Typically `{ "en-US": { ...sdkDefaults, ...appDefaults } }`.
     */
    defaultMessages: Record<string, ITranslations>;

    /**
     * Default language/locale used when `ctx.preferredLocale` is not set.
     *
     * @defaultValue `"en-US"`
     */
    defaultLanguage?: ILocale;
}

/**
 * Standard provider stack for pluggable application modules.
 *
 * @remarks
 * Wraps children with, in order:
 *
 * 1. **PlatformContextProvider** — exposes `IClientPlatformContext` (ctx + backend)
 * 2. **BackendProvider** — makes backend available to SDK UI components (`useBackendStrict`)
 * 3. **WorkspaceProvider** — conditionally mounted when a workspace ID is available
 * 4. **ThemeProvider** — applies theme CSS variables from `ctx.theme`
 * 5. **IntlProvider** — localization with async-loaded translation bundles
 *
 * @example
 * ```tsx
 * <AppProviders
 *     ctx={ctx}
 *     packageName="gdc-my-app-module"
 *     resolveMessages={resolveMessages}
 *     defaultMessages={DEFAULT_MESSAGES}
 * >
 *     <App />
 * </AppProviders>
 * ```
 *
 * @alpha
 */
export function AppProviders({
    ctx,
    packageName,
    resolveMessages: resolveMessagesFn,
    defaultMessages,
    defaultLanguage = "en-US",
    children,
}: PropsWithChildren<IAppProvidersProps>) {
    const backend = useMemo(() => createBackendForModule(ctx.auth, { packageName }), [ctx.auth, packageName]);

    const clientCtx: IClientPlatformContext = useMemo(() => ({ ...ctx, backend }), [ctx, backend]);

    const locale = resolveLocale(ctx.preferredLocale ?? defaultLanguage);
    const messages = useResolveMessages(locale, resolveMessagesFn, defaultMessages);

    return (
        <PlatformContextProvider value={clientCtx}>
            <BackendProvider backend={backend}>
                <WorkspaceProviderIfAvailable workspaceId={ctx.currentWorkspaceId}>
                    <ThemeProvider theme={ctx.theme}>
                        {messages[locale] ? (
                            <IntlProvider locale={locale} messages={messages[locale]}>
                                {children}
                            </IntlProvider>
                        ) : null}
                    </ThemeProvider>
                </WorkspaceProviderIfAvailable>
            </BackendProvider>
        </PlatformContextProvider>
    );
}

/**
 * Only mounts WorkspaceProvider when a workspace ID is available (organization-scope apps
 * may not have one). This prevents WorkspaceProvider from receiving an undefined value.
 */
function WorkspaceProviderIfAvailable({
    workspaceId,
    children,
}: PropsWithChildren<{ workspaceId: string | undefined }>) {
    if (!workspaceId) {
        return <>{children}</>;
    }
    return <WorkspaceProvider workspace={workspaceId}>{children}</WorkspaceProvider>;
}
