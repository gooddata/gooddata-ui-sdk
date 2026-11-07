// (C) 2026 GoodData Corporation

import {
    type IPlatformContext,
    type ITelemetryProvider,
    type ITelemetryProviderEventData,
} from "@gooddata/sdk-pluggable-application-model";
import { headlessModule } from "gdc-headless-template-name-module";

// Sample values only. In the real host, the shell hashes the identifiers and resolves the identity.
const SAMPLE_DATA: ITelemetryProviderEventData = {
    sourceApplication: "gdc-dashboards",
    identifiers: { workspaceId: "3f786850e387550fdab836ed7e6dc881de23001b" },
    stats: { widgetCount: 12 },
};

const sampleContext: IPlatformContext = {
    version: "1.0",
    auth: { type: "contextDeferred" },
    user: {
        login: "harness.user@example.com",
        email: "harness.user@example.com",
        ref: { identifier: "harness-user" },
    },
    organization: { id: "harness-organization", title: "Harness organization" },
    userSettings: { userId: "harness-user", locale: "en-US", separators: { thousand: ",", decimal: "." } },
    settings: { userId: "harness-user", locale: "en-US", separators: { thousand: ",", decimal: "." } },
    whiteLabeling: undefined,
    embeddingMode: "none",
};

const providers = new Set<ITelemetryProvider>();
let unmounted = false;

function getElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Missing #${id} element in index.html.`);
    }
    return element as T;
}

const logList = getElement<HTMLOListElement>("log");

function record(message: string): void {
    const item = document.createElement("li");
    item.textContent = `${new Date().toLocaleTimeString()} ${message}`;
    logList.prepend(item);
}

function forEachProvider(call: (provider: ITelemetryProvider) => void): void {
    providers.forEach((provider) => {
        try {
            call(provider);
        } catch (error) {
            record(`provider threw: ${String(error)}`);
        }
    });
}

const handle = headlessModule.mount({
    id: "gdc-headless-template-name",
    ctx: sampleContext,
    config: HEADLESS_MODULE_CONFIG,
    registerTelemetryProvider(provider) {
        if (unmounted) {
            record("provider registration after unmount ignored");
            return () => undefined;
        }
        let connected = true;
        record("provider registered");
        void (async () => {
            try {
                await provider.identify?.({
                    userId: "sample-user-hash",
                    organizationId: "sample-organization-hash",
                });
            } catch (error) {
                record(`provider failed in identify, not connected: ${String(error)}`);
                return;
            }
            if (connected && !unmounted) {
                providers.add(provider);
                record("identify done, provider connected");
            }
        })();
        return () => {
            connected = false;
            if (providers.delete(provider)) {
                provider.dispose?.();
                record("provider unregistered");
            }
        };
    },
});
record("module mounted");

getElement<HTMLButtonElement>("send-event").addEventListener("click", () => {
    forEachProvider((provider) => provider.trackEvent("app-load-completed", { ...SAMPLE_DATA, value: 812 }));
    record("event sent: app-load-completed");
});

getElement<HTMLButtonElement>("send-page-view").addEventListener("click", () => {
    forEachProvider((provider) => provider.trackPageView("gdc-dashboards", SAMPLE_DATA));
    record("page view sent: gdc-dashboards");
});

getElement<HTMLButtonElement>("send-timing").addEventListener("click", () => {
    forEachProvider((provider) => provider.trackTiming?.("app-load-ms", 812, SAMPLE_DATA));
    record("timing sent: app-load-ms");
});

const unmountButton = getElement<HTMLButtonElement>("unmount");
unmountButton.addEventListener("click", () => {
    unmounted = true;
    forEachProvider((provider) => provider.dispose?.());
    providers.clear();
    handle.unmount();
    unmountButton.disabled = true;
    record("module unmounted");
});
