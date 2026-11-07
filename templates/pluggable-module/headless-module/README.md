# gdc-headless-template-name-module

Headless module for **{applicationTemplateTitle}**.

A headless module has no UI, no route and no menu item. The GoodData host loads it with Module Federation and mounts it once per page, in the full application and in the embedded (iframe) mode. The host never mounts it in export mode. The module stays mounted while the user moves between applications, workspaces and the organization scope.

The starter module registers a telemetry provider. The host sends its telemetry, and the telemetry of every pluggable application, to that provider. Replace the starter provider with one of the recipes below to send the telemetry to Amplitude, Mixpanel, PostHog or Pendo.

## Structure

- `src/headlessModule.ts`: the exported `headlessModule` (`mount`, `allowedOrganizations`, `buildTimestamp`) and the starter provider that writes to the browser console.
- `vite.config.ts`: builds `remoteEntry.js` and exposes `./headlessModule`.
- `../harness`: a page without a backend that mounts the module and sends it sample telemetry.

## What the provider receives

| Call                                   | When                                                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `identify({ userId, organizationId })` | Once, before the first record. The host waits for a returned promise, and does not connect the provider when `identify` fails. |
| `trackEvent(eventName, data)`          | Host and application events, for example `app-load-completed`.                                                                 |
| `trackPageView(page, data)`            | Application page views. `page` is the application id.                                                                          |
| `trackTiming(variable, valueMs, data)` | Performance timings, for example `app-load-ms`.                                                                                |
| `dispose()`                            | When the host unregisters the provider.                                                                                        |

`data` contains only `sourceApplication`, `value`, `identifiers` and `stats`. The host hashes every value of `identifiers` (for example `workspaceId`) with SHA-1, the same way it does for its own telemetry. `stats` holds the string, number and boolean context values that the applications send, the same values that the platform telemetry records, for example a data source type or a widget count. The host does not forward labels or categories, and never forwards records from the AI channel.

A provider that registers soon after the page loads still receives the records from the page start. The host catches every error that a provider throws.

### Identity

Set `telemetry.identity` on the registry item. The host does not read `config`, which holds only the values for your module:

| Value              | `userId`                            | `organizationId`                            |
| ------------------ | ----------------------------------- | ------------------------------------------- |
| `hashed` (default) | Platform telemetry hash of the user | Platform telemetry hash of the organization |
| `userId`           | GoodData user id                    | Organization id                             |
| `email`            | User email                          | Organization id                             |

The `hashed` values come from the platform telemetry. When the organization has none, the host does not connect the provider and logs a warning; use `userId` in that case. With `email`, the host does not connect the provider for a user without an email. Use `userId` or `email` only when your privacy policy and your users' consent allow it.

## Develop

```bash
cd ../harness
cp .env.template .env      # set HEADLESS_MODULE_CONFIG to the config you plan to register
npm run dev
```

The harness imports the module source directly. Click the buttons to send sample records, and check the browser console and your analytics tool.

## Build and deploy

The host loads remote modules only from the same hostname as the host, or from the GoodData plugins bucket (`demo-dashboard-plugins.gooddata.com`). For the plugins bucket, the build must allow your organization and must be younger than 30 days.

```bash
cp .env.template .env      # set ALLOWED_ORGANIZATIONS=<your organization id>
npm run dist               # writes dist/
```

Upload the contents of `dist/` to one folder in the bucket, for example `<your-prefix>/gdc-headless-template-name/`. Rebuild and upload again at least every 30 days. After 30 days the host stops mounting the build.

## Register

Add the module to the `REGISTERED_PLUGGABLE_APPLICATIONS` organization setting. Keep the existing `applications`, `overrides` and other keys of the setting.

```json
{
    "apiVersion": "1.0",
    "headlessModules": [
        {
            "apiVersion": "1.0",
            "id": "gdc-headless-template-name",
            "title": "{applicationTemplateTitle}",
            "remote": {
                "url": "https://demo-dashboard-plugins.gooddata.com/<your-prefix>/gdc-headless-template-name/remoteEntry.js",
                "scope": "{applicationTemplateFederationName}",
                "module": "./headlessModule"
            },
            "telemetry": {
                "identity": "hashed"
            }
        }
    ]
}
```

To create the setting with the API, save the JSON above as `registry.json` and wrap it in the organization setting payload (use `PATCH /api/v1/entities/organizationSettings/{id}` when the setting already exists):

```bash
jq '{data: {type: "organizationSetting", id: "registeredPluggableApplications", attributes: {type: "REGISTERED_PLUGGABLE_APPLICATIONS", content: .}}}' registry.json > setting.json
curl -X POST "$GOODDATA_HOST/api/v1/entities/organizationSettings" \
  -H "Authorization: Bearer $GOODDATA_API_TOKEN" \
  -H "Content-Type: application/vnd.gooddata.api+json" \
  -d @setting.json
```

Every authenticated user of the organization can read this setting. Put only public values in `config`, for example the public project key of your analytics tool. Never put a server-side secret in it.

Optional registry keys: `isEnabled: false` stops the module without removing it. `requiredOrganizationPermissions` and `requiredEntitlements` limit who loads it. `requiredSettings` is evaluated against the organization-level settings of the user.

## Allow the analytics hosts (CSP)

The browser blocks requests to hosts that the organization's Content Security Policy does not allow. Add the hosts of your tool in the organization settings, under **Content security policy (CSP)**.

| Tool      | `connect-src` (US)                            | `connect-src` (EU)                            | `script-src`                                                   |
| --------- | --------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| Amplitude | `api2.amplitude.com`                          | `api.eu.amplitude.com`                        | none with the recipe options                                   |
| Mixpanel  | `api-js.mixpanel.com`                         | `api-eu.mixpanel.com`                         | none                                                           |
| PostHog   | `us.i.posthog.com`, `us-assets.i.posthog.com` | `eu.i.posthog.com`, `eu-assets.i.posthog.com` | none with the recipe options                                   |
| Pendo     | `data.pendo.io` (also `img-src`)              | `data.eu.pendo.io` (also `img-src`)           | `cdn.pendo.io` / `cdn.eu.pendo.io` for guides and the designer |

## Recipes

Each recipe replaces `createTelemetryProvider` in `src/headlessModule.ts`. All recipes bundle the vendor SDK from npm and turn off the vendor's automatic tracking.

The vendor SDKs also add browser context to every record on their own: the page URL, the path, the referrer and the page title. A GoodData URL contains workspace, dashboard and other object ids, and its query string can contain more. The recipes remove these properties so that the vendor receives only what the host gives the provider. Check the removed property names again after you upgrade a vendor SDK.

The recipes use this helper:

```ts
import { type ITelemetryProviderEventData } from "@gooddata/sdk-pluggable-application-model";

function toProperties({ identifiers, stats, ...rest }: ITelemetryProviderEventData): Record<string, unknown> {
    return { ...rest, ...identifiers, ...stats };
}
```

### Amplitude

```bash
npm install @amplitude/analytics-browser
```

```ts
import * as amplitude from "@amplitude/analytics-browser";

export function createTelemetryProvider(config: Record<string, unknown>): ITelemetryProvider {
    amplitude.init(String(config["apiKey"]), {
        serverZone: config["serverZone"] === "EU" ? "EU" : "US",
        autocapture: false,
        remoteConfig: { fetchRemoteConfig: false },
    });
    return {
        identify({ userId, organizationId }) {
            amplitude.setUserId(userId);
            amplitude.identify(new amplitude.Identify().set("organizationId", organizationId));
        },
        trackEvent(eventName, data) {
            amplitude.track(eventName, toProperties(data));
        },
        trackPageView(page, data) {
            amplitude.track("Page Viewed", { page, ...toProperties(data) });
        },
        trackTiming(variable, valueMs, data) {
            amplitude.track("Timing", { variable, valueMs, ...toProperties(data) });
        },
        dispose() {
            void amplitude.flush().promise;
        },
    };
}
```

`autocapture: false` also turns off `pageUrlEnrichment`, which otherwise adds the page URL to every event. Registry config: `{ "apiKey": "<public API key>", "serverZone": "EU" }`. The Amplitude **secret key** is server-side only.

### Mixpanel

```bash
npm install mixpanel-browser && npm install -D @types/mixpanel-browser
```

```ts
import mixpanel from "mixpanel-browser";

export function createTelemetryProvider(config: Record<string, unknown>): ITelemetryProvider {
    mixpanel.init(String(config["token"]), {
        api_host: config["region"] === "EU" ? "https://api-eu.mixpanel.com" : "https://api-js.mixpanel.com",
        autocapture: false,
        track_pageview: false,
        record_sessions_percent: 0,
        ip: false,
        property_blacklist: [
            "$current_url",
            "$referrer",
            "$referring_domain",
            "$initial_referrer",
            "$initial_referring_domain",
            "current_url_path",
            "current_url_search",
            "current_page_title",
        ],
    });
    return {
        identify({ userId, organizationId }) {
            mixpanel.identify(userId);
            mixpanel.register({ organizationId });
        },
        trackEvent(eventName, data) {
            mixpanel.track(eventName, toProperties(data));
        },
        trackPageView(page, data) {
            mixpanel.track("Page Viewed", { page, ...toProperties(data) });
        },
        trackTiming(variable, valueMs, data) {
            mixpanel.track("Timing", { variable, valueMs, ...toProperties(data) });
        },
    };
}
```

Registry config: `{ "token": "<project token>", "region": "EU" }`. Mixpanel service account secrets are server-side only.

### PostHog

```bash
npm install posthog-js
```

```ts
import posthog from "posthog-js";

export function createTelemetryProvider(config: Record<string, unknown>): ITelemetryProvider {
    posthog.init(String(config["token"]), {
        api_host: config["region"] === "EU" ? "https://eu.i.posthog.com" : "https://us.i.posthog.com",
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
        disable_surveys: true,
        rageclick: false,
        capture_dead_clicks: false,
        capture_exceptions: false,
        capture_heatmaps: false,
        capture_performance: false,
        advanced_disable_flags: true,
        disable_external_dependency_loading: true,
        property_denylist: [
            "$current_url",
            "$pathname",
            "$host",
            "$referrer",
            "$referring_domain",
            "$initial_current_url",
            "$initial_pathname",
            "$initial_referrer",
            "$initial_referring_domain",
            "title",
        ],
    });
    return {
        identify({ userId, organizationId }) {
            posthog.identify(userId);
            posthog.register({ organizationId });
        },
        trackEvent(eventName, data) {
            posthog.capture(eventName, toProperties(data));
        },
        trackPageView(page, data) {
            posthog.capture("Page Viewed", { page, ...toProperties(data) });
        },
        trackTiming(variable, valueMs, data) {
            posthog.capture("Timing", { variable, valueMs, ...toProperties(data) });
        },
        dispose() {
            posthog.shutdown();
        },
    };
}
```

Registry config: `{ "token": "<project token>", "region": "EU" }`. PostHog personal API keys are server-side only. Without `disable_external_dependency_loading`, PostHog loads extra scripts from `*-assets.i.posthog.com`, which then must be in `script-src`.

### Pendo

```bash
npm install @pendo/web-sdk
```

Pendo starts only when it knows the visitor and the account, so the provider holds the records until `identify` arrives. `sanitizeUrl` replaces the page URL that Pendo records with the origin. Pendo event names allow only letters, digits and `_`, at most 31 characters, and properties of at most 512 bytes.

```ts
import { initialize } from "@pendo/web-sdk";

type PendoAgent = Awaited<ReturnType<typeof initialize>>;

function pendoEventName(name: string): string {
    return name.replace(/[^A-Za-z0-9_]/g, "_").slice(0, 31);
}

export function createTelemetryProvider(config: Record<string, unknown>): ITelemetryProvider {
    let agent: PendoAgent | undefined;
    let disposed = false;
    const pending: Array<(pendo: PendoAgent) => void> = [];
    const run = (call: (pendo: PendoAgent) => void) => {
        if (disposed) {
            return;
        }
        if (agent) {
            call(agent);
        } else {
            pending.push(call);
        }
    };

    return {
        identify({ userId, organizationId }) {
            return initialize({
                publicAppId: String(config["publicAppId"]),
                env: config["region"] === "EU" ? "eu" : "io",
                visitor: { id: userId },
                account: { id: organizationId },
                analytics: { excludeEvents: ["load", "click", "focus", "submit", "change"] },
                guides: { disabled: true },
                excludeAllText: true,
                sanitizeUrl: () => window.location.origin,
            }).then((pendo) => {
                if (disposed) {
                    pendo.teardown();
                    return;
                }
                agent = pendo;
                pending.splice(0).forEach((call) => call(pendo));
            });
        },
        trackEvent(eventName, data) {
            run((pendo) => pendo.track(pendoEventName(eventName), toProperties(data)));
        },
        trackPageView(page, data) {
            run((pendo) => pendo.track("Page_Viewed", { page, ...toProperties(data) }));
        },
        trackTiming(variable, valueMs, data) {
            run((pendo) => pendo.track("Timing", { variable, valueMs, ...toProperties(data) }));
        },
        dispose() {
            disposed = true;
            pending.length = 0;
            agent?.flushNow();
            agent?.teardown();
        },
    };
}
```

Registry config: `{ "publicAppId": "<public app id>", "region": "EU" }`. The Pendo public app id is not a secret; the Track Event shared secret and integration keys are server-side only. Pendo renames its agent options between versions: check `analytics`, `guides`, `excludeAllText`, `sanitizeUrl`, `flushNow` and `teardown` against the web SDK docs for the version you install.
