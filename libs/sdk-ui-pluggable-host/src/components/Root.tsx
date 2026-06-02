// (C) 2026 GoodData Corporation

import { useEffect } from "react";

import { FormattedMessage } from "react-intl";
import { useLocation, useNavigate } from "react-router";

import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";
import { DEFAULT_LANGUAGE, resolveLocale } from "@gooddata/sdk-ui";
import { bemFactory } from "@gooddata/sdk-ui-kit";

import { useLoadPlatformContext } from "../platformContext/useLoadPlatformContext.js";
import { usePluggableApplications } from "../registry/pluggableApplicationsRegistry.js";
import { HostIntlProvider } from "../ui/HostIntlProvider.js";

import { FullScreenLoader } from "./FullScreenLoader.js";
import { HostUiContainer } from "./HostUiContainer.js";
import { useRedirectNavigation } from "./useRedirectNavigation.js";
import { useRedirectTarget } from "./useRedirectTarget.js";
import "../styles/global.css";

import "./Root.scss";

const { e } = bemFactory("gd-host-root");

/**
 * @alpha
 */
export interface IRootCallbacks {
    onReady?: (ctx: IPlatformContext) => void;
    onError?: (error: string, context: string) => void;
}

/**
 * @alpha
 */
export function Root({ callbacks }: { callbacks?: IRootCallbacks }) {
    const platformContext = useLoadPlatformContext();

    if (platformContext.state === "loading") {
        return <FullScreenLoader />;
    }

    if (platformContext.state === "error") {
        return (
            <HostIntlProvider locale={DEFAULT_LANGUAGE}>
                <main className={e("error")}>
                    <h1>
                        <FormattedMessage id="gs.host.error.failedToLoad" />
                    </h1>
                    <p>{platformContext.error}</p>
                </main>
            </HostIntlProvider>
        );
    }

    return <ReadyRoot ctx={platformContext.ctx} callbacks={callbacks} />;
}

function ReadyRoot({ ctx, callbacks }: { ctx: IPlatformContext; callbacks?: IRootCallbacks }) {
    useEffect(() => {
        callbacks?.onReady?.(ctx);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps -- run once on mount

    const { pathname } = useLocation();
    const routerNavigate = useNavigate();
    const apps = usePluggableApplications(ctx);
    const redirect = useRedirectTarget(apps, ctx, pathname);
    useRedirectNavigation(redirect, routerNavigate);

    useEffect(() => {
        if (redirect.state === "not-found") {
            callbacks?.onError?.("Page not found", pathname);
        } else if (redirect.state === "error") {
            callbacks?.onError?.(redirect.error, "redirect");
        }
    }, [redirect]); // eslint-disable-line react-hooks/exhaustive-deps -- pathname is intentionally omitted; redirect already encapsulates path evaluation

    if (redirect.state === "loading" || redirect.state === "redirect") {
        return <FullScreenLoader />;
    }

    if (redirect.state === "not-found") {
        return (
            <HostIntlProvider locale={resolveLocale(ctx.preferredLocale)}>
                <main className={e("error")}>
                    <h1>
                        <FormattedMessage id="gs.host.error.pageNotFound" />
                    </h1>
                    <p>
                        <FormattedMessage id="gs.host.error.pageNotFoundDescription" />
                    </p>
                </main>
            </HostIntlProvider>
        );
    }

    if (redirect.state === "error") {
        return (
            <HostIntlProvider locale={resolveLocale(ctx.preferredLocale)}>
                <main className={e("error")}>
                    <h1>
                        <FormattedMessage id="gs.host.error.somethingWentWrong" />
                    </h1>
                    <p>{redirect.error}</p>
                </main>
            </HostIntlProvider>
        );
    }

    return <HostUiContainer ctx={ctx} apps={apps} pathname={pathname} routerNavigate={routerNavigate} />;
}
