---
title: Track user interactions
description: Track how people use the dashboards, visualizations, and AI Assistant in your GoodData.UI application, and send the events to an external service for further analytics.
category: Integrations / Interactivity
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-ui-dashboard:DashboardEventHandler"
  - "@gooddata/sdk-ui:IVisualizationCallbacks"
  - "@gooddata/sdk-ui-gen-ai:ChatEventHandler"
related_pages:
  - /docs/dashboard-plugins/dashboard-events
  - /docs/integrations/interactivity/on-drill
  - /docs/integrations/interactivity/on-export-ready
  - /docs/integrations/interactivity/handle-errors
  - /docs/ai-modules/ai-assistant
type: docs
weight: 97
section: Integrations
subsection: Interactivity
ai_generated_body: true
aliases:
  - "event-tracking-guide/"
---

Build a small event tracking layer on top of your React application. When users interact with GoodData components, the components report events, and the tracking layer forwards them to an external service of your choice. The following table lists common uses for the tracked events.

| Purpose | Example services |
| --- | --- |
| Traffic analytics | Google Analytics 4, Adobe Analytics, Matomo, Plausible, Umami |
| Product and UX analytics | Mixpanel, Amplitude, PostHog, Heap, Hotjar, Microsoft Clarity, FullStory |
| Event routing | Segment, RudderStack, Jitsu, Snowplow, mParticle, Freshpaint |
| Marketing messaging | Customer.io, Braze, Brevo, Iterable, Klaviyo |
| Sales and customer success | HubSpot, Salesforce, Gainsight PX, ChurnZero, Totango |
| Customer support | Intercom, Freshchat, Tawk.to |
| Error monitoring | Sentry, Datadog RUM, New Relic Browser |

You need:

- A React application with `BackendProvider` and `WorkspaceProvider`, such as the project from the [Quick start](../../../getting-started/quickstart/).
- A dashboard embedded with the `Dashboard` component and a visualization embedded with the `InsightView` component. See [Embed dashboards](../../embedding/embed-dashboards/) and [Embed visualizations](../../embedding/embed-visualizations/).
- An external service and its browser library, such as one of those listed in the table above. If you don't have one yet, start with a console adapter that logs the events.

{{% alert color="info" title="Respect privacy and consent" %}}
Many countries protect user privacy by law, for example with the GDPR in the EU. Before you track anything, check which laws apply to your users. They may limit what personal data you can collect, or require the user's consent first.
{{% /alert %}}

## Describe your events

Start with the list of events you want to see in your reports. Define them as one TypeScript union, so the rest of the code can only send events that exist, with the right properties.

Create `src/analytics/events.ts`:

```ts
export type AnalyticsEvent =
    | { name: "dashboard_viewed"; properties: { dashboardId: string; dashboardTitle: string } }
    | { name: "dashboard_rendered"; properties: { dashboardId: string } }
    | { name: "filter_changed"; properties: FilterChangedProperties }
    | { name: "drill_triggered"; properties: { source: string; drillTypes: string[] } }
    | { name: "export_succeeded"; properties: { format: string; durationMs?: number } }
    | { name: "export_failed"; properties: { format: string; durationMs?: number } }
    | { name: "button_clicked"; properties: { button: string } }
    | { name: "ai_question_asked"; properties: { threadId?: string } }
    | { name: "ai_feedback_given"; properties: { feedback: "POSITIVE" | "NEGATIVE" | "NONE" } };

export type FilterChangedProperties =
    | { dashboardId: string; filterType: "attribute"; displayForm: string }
    | { dashboardId: string; filterType: "date"; granularity: string };

export interface IAnalyticsContext {
    workspaceId: string;
    userId?: string;
    path: string;
}

export type TrackedEvent = AnalyticsEvent & {
    context: IAnalyticsContext;
    timestamp: string;
};

export type AnalyticsSink = (event: TrackedEvent) => void;
```

A few conventions keep the reports readable later:

- Name events in the past tense, such as `filter_changed`, and keep the names unique and stable. Put everything that varies into properties.
- Keep the shared context, such as the workspace and the user, out of the individual events. The provider in the next step adds it to every event.

## Create the tracking provider

The provider is the only place that knows about the shared context. Components get a `track` function from it and call it with an `AnalyticsEvent`. The provider adds the context and a timestamp, and passes the result to the sink.

The context includes the signed-in user. You can get the user with your own hook. The hook returns `undefined` until the user loads, and then a unique identifier for the user, such as the email or the user ID. Or you can use the user identity from GoodData, as in this `src/analytics/useCurrentUser.ts`:

```ts
import { useBackendStrict, useCancelablePromise } from "@gooddata/sdk-ui";

export function useCurrentUser(): string | undefined {
    const backend = useBackendStrict();
    const { result } = useCancelablePromise({ promise: () => backend.currentUser().getUser() }, [backend]);

    return result?.login;
}
```

Now create `src/analytics/AnalyticsProvider.tsx`:

```tsx
import { createContext, useCallback, useContext, type ReactNode } from "react";
import { useLocation } from "react-router";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { type AnalyticsEvent, type AnalyticsSink } from "./events";
import { useCurrentUser } from "./useCurrentUser";

type Track = (event: AnalyticsEvent) => void;

const AnalyticsContext = createContext<Track>((event) => {
    console.warn(`Analytics event "${event.name}" was not tracked because no AnalyticsProvider is rendered above.`);
});

interface IAnalyticsProviderProps {
    sink: AnalyticsSink;
    children: ReactNode;
}

export function AnalyticsProvider({ sink, children }: IAnalyticsProviderProps) {
    const workspaceId = useWorkspaceStrict();
    const userId = useCurrentUser();
    const { pathname: path } = useLocation(); // or the equivalent hook of your router

    const track = useCallback<Track>(
        (event) => {
            try {
                const context = { workspaceId, userId, path };
                sink({ ...event, context, timestamp: new Date().toISOString() });
            } catch (error) {
                console.warn("Analytics event was not sent", error);
            }
        },
        [sink, workspaceId, userId, path],
    );

    return <AnalyticsContext.Provider value={track}>{children}</AnalyticsContext.Provider>;
}

export const useTrack = (): Track => useContext(AnalyticsContext);
```

Two details make the provider safe to use everywhere:

- The `try`/`catch` makes sure a failing analytics library never breaks a dashboard. Tracking is a side effect, so it must not throw.
- The default context value only logs a warning. A component rendered outside the provider, for example in a unit test, still works. It doesn't track, and the console tells you why.

Besides the workspace and the user, the example adds the current URL path to the context. Add any other values you want to track and analyze in your service, such as the application version or the current tenant.

## Connect your external service

A sink is a function that receives a `TrackedEvent` and forwards it. Write one adapter per service you use. Each adapter maps the event to the service's own API, so switching services later means writing one new function.

Create `src/analytics/sinks.ts`:

```ts
import mixpanel from "mixpanel-browser";
import { type AnalyticsSink } from "./events";

// Print the events to the browser console.
export const consoleSink: AnalyticsSink = (event) => {
    console.debug(`[analytics] ${event.name}`, event);
};

// Send the events to Mixpanel.
export function createMixpanelSink(): AnalyticsSink {
    let identifiedUser: string | undefined;

    return ({ name, properties, context }) => {
        if (context.userId && context.userId !== identifiedUser) {
            mixpanel.identify(context.userId);
            identifiedUser = context.userId;
        }
        mixpanel.track(name, { ...context, ...properties });
    };
}

// Send each event to several sinks.
export function combineSinks(...sinks: AnalyticsSink[]): AnalyticsSink {
    return (event) => sinks.forEach((sink) => sink(event));
}
```

Install, initialize, and configure the service's own library the way its documentation describes.

Now pick the sink and wrap your application in the provider. Render the provider inside `BackendProvider`, `WorkspaceProvider`, and your router, because it reads from all three. Create the sink once, outside the component, so its identity never changes. The console sink is useful during development, but in production it would log every event for every user, so add it only in development builds:

```tsx
import { BrowserRouter } from "react-router";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { AnalyticsProvider } from "./analytics/AnalyticsProvider";
import { combineSinks, consoleSink, createMixpanelSink } from "./analytics/sinks";
import { backend } from "./backend";

const mixpanelSink = createMixpanelSink();
const sink = import.meta.env.DEV ? combineSinks(consoleSink, mixpanelSink) : mixpanelSink;

export function App() {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace="<workspace-id>">
                <BrowserRouter>
                    <AnalyticsProvider sink={sink}>
                        <YourApp />
                    </AnalyticsProvider>
                </BrowserRouter>
            </WorkspaceProvider>
        </BackendProvider>
    );
}
```

`backend` is the backend instance your application already creates, as described in [Installation](../../../getting-started/installation/).

## Track dashboard events

The `Dashboard` component emits an event for everything that happens inside it. Turn the events you care about into `AnalyticsEvent`s with a set of dashboard event handlers. To learn more about the events and their handlers, see [Handle dashboard events](../../../dashboard-plugins/dashboard-events/).

Create `src/analytics/useDashboardAnalytics.ts`:

```ts
import { useMemo } from "react";
import { objRefToString } from "@gooddata/sdk-model";
import {
    isDashboardAttributeFilterSelectionChanged,
    isDashboardDateFilterSelectionChanged,
    isDashboardInitialized,
    isDashboardRenderResolved,
    type DashboardAttributeFilterSelectionChanged,
    type DashboardDateFilterSelectionChanged,
    type DashboardEventHandler,
    type DashboardInitialized,
    type DashboardRenderResolved,
} from "@gooddata/sdk-ui-dashboard";
import { useTrack } from "./AnalyticsProvider";

export function useDashboardAnalytics(dashboardId: string): DashboardEventHandler[] {
    const track = useTrack();

    return useMemo(() => {
        const viewed: DashboardEventHandler<DashboardInitialized> = {
            eval: isDashboardInitialized,
            handler: (event) => {
                const dashboardTitle = event.payload.dashboard?.title ?? "";
                track({ name: "dashboard_viewed", properties: { dashboardId, dashboardTitle } });
            },
        };

        const rendered: DashboardEventHandler<DashboardRenderResolved> = {
            eval: isDashboardRenderResolved,
            handler: () => {
                track({ name: "dashboard_rendered", properties: { dashboardId } });
            },
        };

        const attributeFilterChanged: DashboardEventHandler<DashboardAttributeFilterSelectionChanged> = {
            eval: isDashboardAttributeFilterSelectionChanged,
            handler: (event) => {
                const displayForm = objRefToString(event.payload.filter.attributeFilter.displayForm);
                track({ name: "filter_changed", properties: { dashboardId, filterType: "attribute", displayForm } });
            },
        };

        const dateFilterChanged: DashboardEventHandler<DashboardDateFilterSelectionChanged> = {
            eval: isDashboardDateFilterSelectionChanged,
            handler: (event) => {
                const granularity = event.payload.filter?.dateFilter.granularity ?? "allTime";
                track({ name: "filter_changed", properties: { dashboardId, filterType: "date", granularity } });
            },
        };

        return [viewed, rendered, attributeFilterChanged, dateFilterChanged];
    }, [track, dashboardId]);
}
```

{{% alert color="info" title="Check the API maturity of the events you track" %}}
Some events are marked as `@alpha` or `@beta`. Their payloads can change in a minor release. See [API maturity](../../platform/api-maturity/).
{{% /alert %}}

The `Dashboard` component compares its `eventHandlers` prop by reference. When it gets a new array, it throws away its state and loads the dashboard again, which cancels anything in progress, such as a running export. So make sure you memoize the handlers together with everything they depend on, including the `track` function.

Now render the dashboard with the memoized handlers:

```tsx
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { useDashboardAnalytics } from "./analytics/useDashboardAnalytics";

export function DashboardPage({ dashboardId }: { dashboardId: string }) {
    const analyticsHandlers = useDashboardAnalytics(dashboardId);

    return <Dashboard dashboard={dashboardId} eventHandlers={analyticsHandlers} />;
}
```

If your application already passes its own handlers to the `Dashboard` component, merge them into the same array.

Open the page and look at the browser console. You should see `dashboard_viewed` as soon as the dashboard loads, and `dashboard_rendered` a moment later. Change a filter, and `filter_changed` follows.

## Track drills and exports on the dashboard

The `Dashboard` component reports drills and exports with events, too. Add the following imports to the existing import block from `@gooddata/sdk-ui-dashboard` in `useDashboardAnalytics.ts`, without repeating the ones that are already there:

```ts
import {
    isDashboardDrillResolved,
    isDashboardExportToPdfResolved,
    type IDashboardDrillResolved,
    type IDashboardExportToPdfResolved,
} from "@gooddata/sdk-ui-dashboard";
```

Note that some event types start with `I`, such as `IDashboardDrillResolved`, and others don't, such as `DashboardInitialized`. 
Then add the handlers inside the `useMemo` callback, next to the existing ones:

```ts
const drilled: DashboardEventHandler<IDashboardDrillResolved> = {
    eval: isDashboardDrillResolved,
    handler: (event) => {
        const drillTypes = event.payload.drillEvent.drillDefinitions.map((definition) => definition.type);
        track({ name: "drill_triggered", properties: { source: "dashboard", drillTypes } });
    },
};

const exportedToPdf: DashboardEventHandler<IDashboardExportToPdfResolved> = {
    eval: isDashboardExportToPdfResolved,
    handler: () => {
        track({ name: "export_succeeded", properties: { format: "pdf" } });
    },
};
```

And update the return line:

```ts
return [viewed, rendered, attributeFilterChanged, dateFilterChanged, drilled, exportedToPdf];
```

`drillTypes` tells you which kinds of drill people use, such as `drillToInsight`, `drillToDashboard`, or `drillDown`.

## Track standalone visualizations

Visualizations you render yourself, such as `InsightView` or `ColumnChart`, don't emit dashboard events. They report through callback props instead. Use `onDrill` for drills, `onLoadingChanged` for load time, and `onExportReady` for exports.

```tsx
import { useRef } from "react";
import { type IExportFunction, type IExtendedExportConfig } from "@gooddata/sdk-ui";
import { InsightView } from "@gooddata/sdk-ui-ext";
import { useTrack } from "./analytics/AnalyticsProvider";

export function RevenueTrend() {
    const track = useTrack();
    const exportRef = useRef<IExportFunction | null>(null);

    const onExportReady = (exportFunction: IExportFunction) => {
        exportRef.current = async (config: IExtendedExportConfig) => {
            const startedAt = performance.now();
            const format = config.format ?? "csv";
            try {
                const result = await exportFunction(config);
                const durationMs = Math.round(performance.now() - startedAt);
                track({ name: "export_succeeded", properties: { format, durationMs } });
                return result;
            } catch (error) {
                const durationMs = Math.round(performance.now() - startedAt);
                track({ name: "export_failed", properties: { format, durationMs } });
                throw error;
            }
        };
    };

    return (
        <>
            <InsightView
                insight="<visualization-id>"
                onExportReady={onExportReady}
                onDrill={(event) => {
                    const drillTypes = [event.drillContext.type];
                    track({ name: "drill_triggered", properties: { source: "revenue-trend", drillTypes } });
                }}
            />
            <button onClick={() => exportRef.current?.({ format: "xlsx" })}>Export</button>
        </>
    );
}
```

The example wraps the export function from `onExportReady` before it stores it, so every export of this visualization is tracked, wherever your code calls it from. The wrapper measures the duration and reports failures too, and it rethrows the error so your own error handling still works.

In the same way, you can track load time with `onLoadingChanged` and failures with `onError`. See [Handle errors](../handle-errors/).

## Track the AI Assistant

The `GenAIAssistant` component takes an `eventHandlers` prop. Its handlers have the same `eval` and `handler` shape as the ones you pass to the `Dashboard` component. Track the questions people ask and the feedback they give:

```tsx
import {
    GenAIAssistant,
    isChatFeedbackEvent,
    isChatUserMessageEvent,
    type ChatEventHandler,
    type ChatFeedbackEvent,
    type ChatUserMessageEvent,
} from "@gooddata/sdk-ui-gen-ai";
import { useMemo } from "react";
import { useTrack } from "./analytics/AnalyticsProvider";

export function Assistant() {
    const track = useTrack();

    const eventHandlers = useMemo<ChatEventHandler[]>(() => {
        const questionAsked: ChatEventHandler<ChatUserMessageEvent> = {
            eval: isChatUserMessageEvent,
            handler: (event) => track({ name: "ai_question_asked", properties: { threadId: event.threadId } }),
        };
        const feedbackGiven: ChatEventHandler<ChatFeedbackEvent> = {
            eval: isChatFeedbackEvent,
            handler: (event) => track({ name: "ai_feedback_given", properties: { feedback: event.feedback } }),
        };
        return [questionAsked, feedbackGiven];
    }, [track]);

    return <GenAIAssistant eventHandlers={eventHandlers} />;
}
```

`ChatUserMessageEvent` also carries the text of the question in `event.question`. Send it only if your privacy policy allows it, because people often type customer names and other sensitive data into a chat.

## Track your own controls

Not everything worth tracking happens inside a GoodData.UI component. Your navigation, tabs, and buttons are plain React, so call `track` from their event handlers, such as `onClick`:

```tsx
import { useNavigate } from "react-router";
import { useTrack } from "./analytics/AnalyticsProvider";

export function SalesReportButton() {
    const track = useTrack();
    const navigate = useNavigate();

    return (
        <button
            onClick={() => {
                track({ name: "button_clicked", properties: { button: "open-sales-report" } });
                navigate("/reports/sales");
            }}
        >
            Sales report
        </button>
    );
}
```

Because these events go through the same provider, they get the same workspace, user, and path as the events from the dashboard. You can put them side by side in one report.

---

You now have one tracking layer for your whole application. The `Dashboard` component, standalone visualizations, the AI Assistant, and your own controls all report typed events to it. The layer adds the shared context and forwards the events to the services you choose. Now you can analyze what your users do and experience. To track something new, add an event to the union and call `track`. To switch services, write one new sink.
