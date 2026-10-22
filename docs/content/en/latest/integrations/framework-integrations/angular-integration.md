---
legacy_path: learn/web_components/angular
title: Embed GoodData in an Angular app
linkTitle: Angular (Web Components)
category: Integrations / Framework guides
diataxis_type: howto
related_pages:
  - /docs/integrations/web-components/web-components-overview
  - /docs/integrations/web-components/web-components-auth
  - /docs/integrations/framework-integrations/vue-integration
  - /docs/integrations/framework-integrations/angular-react-integration
  - /docs/integrations/web-components/embed-custom-elements
description: Embed GoodData dashboards, visualizations, and the AI Assistant in an Angular app with the Web Components library, custom element schemas, and event listeners.
ai_generated_description: true
type: docs
weight: 41
section: Integrations
subsection: Framework guides
aliases:
  - "../../learn/web_components/angular/"
---

Angular works well with Web Components and custom elements. This guide embeds a GoodData dashboard, a visualization, and the AI Assistant in an Angular app with the `gd-dashboard-embed`, `gd-insight-embed`, and `gd-ai-assistant` custom elements. It's based on a project generated with `ng new my-app`, with standalone components; adapt the file names to your project.

## Load the Web Components library

Add a `<script>` tag to your main HTML file, `src/index.html`:

```diff
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>MyApp</title>
      <base href="/">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="icon" type="image/x-icon" href="favicon.ico">
+     <script type="module" async src="https://<your-gooddata-host>/components/<workspace-id>.js?auth=sso"></script>
    </head>
    <body>
      <app-root></app-root>
    </body>
    </html>
```

The `?auth=sso` parameter signs the user in automatically. For a programmatic flow, such as an API token or your own `NotAuthenticatedHandler`, see [Web Components authentication](../../web-components/web-components-auth/). The [Web Components overview](../../web-components/web-components-overview/) explains the script URL.

## Allow custom elements

Add `CUSTOM_ELEMENTS_SCHEMA` to the component that uses the GoodData elements. Otherwise, Angular reports them as unknown elements:

```diff
-   import { Component } from "@angular/core";
+   import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

    @Component({
      selector: "app-root",
      templateUrl: "./app.component.html",
+     schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    export class AppComponent {}
```

If your app still uses `NgModule`, add `schemas: [CUSTOM_ELEMENTS_SCHEMA]` to the module instead.

## Embed a dashboard and a visualization

Use the elements anywhere in the component's template, `src/app/app.component.html`:

```html
<gd-dashboard-embed dashboard="<dashboard-id>"></gd-dashboard-embed>
<gd-insight-embed insight="<visualization-id>" style="display: block; height: 500px"></gd-insight-embed>
<gd-ai-assistant></gd-ai-assistant>
```

Copy the visualization ID and the dashboard ID from the browser's address bar, on the Analyze and Dashboards pages. Give `gd-insight-embed` `display: block` and a fixed height; otherwise it collapses to zero height.

[Dashboard and visualization embed elements](../../web-components/embed-custom-elements/) lists every attribute, property, method, and event of the two embed elements.

## Set the IDs from component code

Bind the attributes to component fields:

```ts
// src/app/app.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
    dashboardId = "<dashboard-id>";
    visualizationId = "<visualization-id>";
    workspaceId = "<workspace-id>";
}
```

```html
<gd-dashboard-embed [attr.dashboard]="dashboardId"></gd-dashboard-embed>
<gd-insight-embed [attr.insight]="visualizationId" style="display: block; height: 500px"></gd-insight-embed>
<gd-ai-assistant [attr.workspace]="workspaceId"></gd-ai-assistant>
```

The embed elements lock the `dashboard` and `insight` identity after the first render. To show a different dashboard or visualization, render a new element, for example with `@if` or `@for` keyed on the ID, instead of changing the bound value.

## Listen to events

All three elements dispatch DOM custom events.

### Visualization events

Event names without dots or slashes work with Angular event binding. Add a handler to the component:

```ts
onInsightLoaded(event: Event) {
    console.log((event as CustomEvent).detail);
}
```

and bind it in the template:

```html
<gd-insight-embed
    [attr.insight]="visualizationId"
    style="display: block; height: 500px"
    (insightLoaded)="onInsightLoaded($event)"
></gd-insight-embed>
```

See the [`gd-insight-embed` events](../../web-components/embed-custom-elements/#events-1).

### Dashboard events

Dashboard event names such as `GDC.DASH/EVT.INITIALIZED` contain characters Angular event binding doesn't accept, so add the listeners on the DOM element. Mark the element with a template reference variable:

```html
<gd-dashboard-embed [attr.dashboard]="dashboardId" #dashboard></gd-dashboard-embed>
```

Then get the element in the component, attach the listener, and remove it when the component is destroyed:

```ts
// src/app/app.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnDestroy, ViewChild } from "@angular/core";

const DASHBOARD_EVENT = "GDC.DASH/EVT.INITIALIZED";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnDestroy {
    dashboardId = "<dashboard-id>";
    private dashboardElement?: HTMLElement;

    private onDashboardInitialized = (event: Event) => {
        console.log((event as CustomEvent).detail);
    };

    @ViewChild("dashboard")
    set dashboard(ref: ElementRef<HTMLElement>) {
        this.dashboardElement = ref.nativeElement;
        this.dashboardElement.addEventListener(DASHBOARD_EVENT, this.onDashboardInitialized);
    }

    ngOnDestroy() {
        this.dashboardElement?.removeEventListener(DASHBOARD_EVENT, this.onDashboardInitialized);
    }
}
```

`gd-dashboard-embed` also dispatches `gd-ready` and `gd-error`. See the [`gd-dashboard-embed` events](../../web-components/embed-custom-elements/#events).

### AI Assistant events

Attach `gd-ai-assistant` listeners the same way. Mark the element:

```html
<gd-ai-assistant [attr.workspace]="workspaceId" #aiAssistant></gd-ai-assistant>
```

and add the listener in the component:

```ts
private onLinkClick = (event: Event) => {
    console.log((event as CustomEvent).detail);
};

@ViewChild("aiAssistant")
set aiAssistant(ref: ElementRef<HTMLElement>) {
    ref.nativeElement.addEventListener("linkClick", this.onLinkClick);
}
```

Remove the listener in `ngOnDestroy`, as for the dashboard. See the [AI Assistant events](../../web-components/ai-assistant-custom-element/#supported-events).
