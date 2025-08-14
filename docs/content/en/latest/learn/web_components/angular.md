---
title: Using WebComponents with Angular
linkTitle: Angular integration
copyright: (C) 2007-2022 GoodData Corporation
---

Angular has good interoperability with WebComponents and, specifically, Custom Elements. There are a few steps that
you need to do in order to integrate the GoodData dashboards or visualizations with the Angular app.

The guide below is based on the Angular template workspace generated using `ng new my-app`, but you should be
able to adopt it to existing Angular projects easily.

## Load WebComponents library

Add a new `<script>` tag to your main HTML file (`src/index.html`).

```diff
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>NgApp</title>
      <base href="/">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="icon" type="image/x-icon" href="favicon.ico">
+     <script type="module" async src="{your-gd-server-url}/components/{workspace-id}.js?auth=sso"></script>
    </head>
    <body>
      <app-root></app-root>
    </body>
    </html>
```

See [WebComponents introduction](../) page. Make sure to go through the
[Prerequisites and limitations](../#prerequisites-and-limitations) section.

## Add custom elements schema

Add `CUSTOM_ELEMENTS_SCHEMA` to your main module (`src/app/app.module.ts`). Otherwise, Angular will warn you about
unknown components.

```diff
-   import { NgModule } from '@angular/core';
+   import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
    import { BrowserModule } from '@angular/platform-browser';

    import { AppComponent } from './app.component';

    @NgModule({
      declarations: [
        AppComponent
      ],
      imports: [
        BrowserModule
      ],
      providers: [],
      bootstrap: [AppComponent],
+     schemas: [
+       CUSTOM_ELEMENTS_SCHEMA,
+     ]
    })
    export class AppModule { }
```

## Embed visualizations

You can now use `gd-insight`, `gd-dashboard`, and `gd-ai-assistant` elements anywhere in your `src/app/app.component.html` template.

```html
<gd-insight insight="my-visualization-id" style="height:500px"></gd-insight>
<gd-dashboard dashboard="my-dashboard-id"></gd-dashboard>
<gd-ai-assistant></gd-ai-assistant>
```

You can copy the _visualization id_ and _dashboard id_ from the URL bar of your web browser,
from the Analyze and Dashboards pages respectively. At this point you should see an visualization and a dashboard rendering
on the screen.

We set the height of the `gd-insight` to a static value as it's expecting a flex layout and would collapse to a `0` height
otherwise.

## Define dashboardId and visualizationId dynamically

You can use attribute binding to define the IDs dynamically from the Angular component code.

Define component variables in `src/app/app.component.ts`:

```diff
    import { Component } from "@angular/core";

    @Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.css']
    })
    export class AppComponent {
      title = 'ng-app';
+     dashboardId = 'my-dashboard-id';
+     visualizationId = 'my-visualization-id';
+     workspaceId = 'my-workspace-id';
    }
```

Update the `src/app/app.component.html` template:

```html
<gd-insight [attr.insight]="visualizationId" style="height:500px"></gd-insight>
<gd-dashboard [attr.dashboard]="dashboardId"></gd-dashboard>
<gd-ai-assistant [attr.workspace]="workspaceId"></gd-ai-assistant>
```

## Add event listeners

Both `gd-insight`, `gd-dashboard`, and `gd-ai-assistant` are dispatching custom events.

### Visualization event listener

In case of `gd-insight` you can use the Angular event binding syntax. Define an event listener function in
your component code (`src/app/app.component.ts`):

```diff
    import { Component } from "@angular/core";

    @Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.css']
    })
    export class AppComponent {
      title = 'ng-app';
      dashboardId = 'my-dashboard-id';
      visualizationId = 'my-visualization-id';
      workspaceId = 'my-workspace-id';
+
+     onInsightLoaded(e: Event) {
+       console.log((e as CustomEvent).detail);
+     }
    }
```

Attach the event listener to the visualization at `src/app/app.component.html`:

```html
<gd-insight
    [attr.insight]="visualizationId"
    style="height:500px"
    (insightLoaded)="onInsightLoaded($event)"
></gd-insight>
```

[Read more about visualization events](../##supported-events).

### Dashboard event listener

The setup for `gd-dashboard` is more complicated, as event names do not follow Angular naming convention. You would
need to obtain a reference to the DOM object and add event listeners directly.

First, use the template reference variable to mark the dashboard element in `src/app/app.component.html`:

```html
<gd-dashboard [attr.dashboard]="dashboardId" #dashboard></gd-dashboard>
```

Now you can obtain the element and attach event listeners in `src/app/app.component.ts`. Keep in mind that you
also need to remove the listeners on the component unmount.

```diff
-   import { Component } from "@angular/core";
+   import { Component, ViewChild } from "@angular/core";
+
+   const EVENT_NAME = 'GDC.DASH/EVT.INITIALIZED';
+
    @Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.css']
    })
    export class AppComponent {
      title = 'ng-app';
      dashboardId = 'my-dashboard-id';
      visualizationId = 'my-visualization-id';
      workspaceId = 'my-workspace-id';
+     private myDashboardElement?: HTMLElement;

      onInsightLoaded(e: Event) {
        console.log((e as CustomEvent).detail);
      }
+
+     onDashboardLoaded(e: Event) {
+       console.log((e as CustomEvent).detail);
+     }
+
+     @ViewChild("dashboard")
+     set dashboard(d: any) {
+       this.myDashboardElement = d.nativeElement;
+       this.myDashboardElement?.addEventListener(EVENT_NAME, this.onDashboardLoaded);
+     }
+
+     ngOnDestroy() {
+       this.myDashboardElement?.removeEventListener(EVENT_NAME, this.onDashboardLoaded);
+     }
    }
```

[Read more about Dashboard events](../dashboard_custom_element/#supported-events).

### AI Assistant event listener

Similar to the dashboard, the `gd-ai-assistant` component requires direct DOM event listeners.

First, use the template reference variable to mark the AI Assistant element in `src/app/app.component.html`:

```html
<gd-ai-assistant [attr.workspace]="workspaceId" #aiChat></gd-ai-assistant>
```

Now you can obtain the element and attach event listeners in `src/app/app.component.ts`:

```diff
    import { Component, ViewChild, OnDestroy } from "@angular/core";

    const EVENT_NAME = 'GDC.DASH/EVT.INITIALIZED';
+   const CHAT_EVENT_NAME = 'linkClick';

    @Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.css']
    })
    export class AppComponent implements OnDestroy {
      title = 'ng-app';
      dashboardId = 'my-dashboard-id';
      visualizationId = 'my-visualization-id';
      workspaceId = 'my-workspace-id';
      private myDashboardElement?: HTMLElement;
+     private myAiChatElement?: HTMLElement;

      onInsightLoaded(e: Event) {
        console.log((e as CustomEvent).detail);
      }

      onDashboardLoaded(e: Event) {
        console.log((e as CustomEvent).detail);
      }
+
+     onChatLinkClick(e: Event) {
+       console.log((e as CustomEvent).detail);
+     }

      @ViewChild("dashboard")
      set dashboard(d: any) {
        this.myDashboardElement = d.nativeElement;
        this.myDashboardElement?.addEventListener(EVENT_NAME, this.onDashboardLoaded);
      }
+
+     @ViewChild("aiChat")
+     set aiChat(c: any) {
+       this.myAiChatElement = c.nativeElement;
+       this.myAiChatElement?.addEventListener(CHAT_EVENT_NAME, this.onChatLinkClick);
+     }

      ngOnDestroy() {
        this.myDashboardElement?.removeEventListener(EVENT_NAME, this.onDashboardLoaded);
+       this.myAiChatElement?.removeEventListener(CHAT_EVENT_NAME, this.onChatLinkClick);
      }
    }
```

[Read more about AI Assistant events](./ai_assistant_custom_element.md#supported-events).
