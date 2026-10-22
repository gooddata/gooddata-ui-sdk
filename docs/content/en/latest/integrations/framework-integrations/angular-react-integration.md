---
title: Render GoodData.UI React components in Angular
linkTitle: Angular (React components)
legacy_path: architecture/supported_frameworks/angular
description: Wrap GoodData.UI React components in Angular components with createRoot, import their styles, and bind their props from Angular templates.
category: Integrations / Framework guides
diataxis_type: howto
related_pages:
  - /docs/integrations/framework-integrations/angular-integration
  - /docs/integrations/backend-setup
  - /docs/integrations/authentication
  - /docs/integrations/platform/supported-frameworks
type: docs
weight: 42
section: Integrations
subsection: Framework guides
aliases:
  - "../../architecture/supported_frameworks/angular/"
---

To use the GoodData.UI React components in an Angular app, wrap each one in an Angular component that renders it with React's `createRoot` API. GoodData.UI needs TypeScript 5.8.3 or newer, which Angular supports from version 19.2. See [Platform compatibility](../../../getting-started/platform-compatibility/) for the rest of the toolchain.

{{% alert color="info" title="Consider Web Components" %}}
Depending on your use case, it may be easier to embed dashboards and visualizations with the GoodData [Web Components library](../angular-integration/) than to wrap React components yourself.
{{% /alert %}}

## Install the packages

Install React and the GoodData.UI packages. GoodData.UI works with React 18 and 19:

```bash
npm install react react-dom @gooddata/sdk-ui-all @gooddata/sdk-backend-tiger
npm install --save-dev @types/react @types/react-dom
```

`@gooddata/sdk-ui-all` re-exports the model, core UI, charts, geo, pivot, filters, and `InsightView` packages. It doesn't include `@gooddata/sdk-ui-dashboard` or the AI packages; install those separately if you need them.

## Update the global configuration

1. Add `(window as any).global = window;` to `polyfills.ts` to provide the missing `global`.
2. Add `"skipLibCheck": true` to your `tsconfig.json` to avoid misleading errors during compilation.

## Declare the Angular wrapper component

The wrapper renders a React component into its own DOM node and renders it again when an input changes. You can wrap each GoodData.UI component separately, or write one generic wrapper that takes the React component as an input.

The following example wraps the `Kpi` component. It creates the backend with `ContextDeferredAuthProvider`, which uses the GoodData session cookie and redirects to the GoodData sign-in when the session is missing. See [Authenticate to the backend](../../authentication/) for the other options.

```ts
// kpi.component.ts
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { AfterViewInit, Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { type IFilter, type IKpiProps, Kpi, newMeasure } from "@gooddata/sdk-ui-all";
import {
    ContextDeferredAuthProvider,
    redirectToTigerAuthentication,
    tigerFactory,
} from "@gooddata/sdk-backend-tiger";

// For illustration only: create the backend once in your app and import it here.
const backend = tigerFactory()
    .onHostname("https://example.gooddata.com")
    .withAuthentication(new ContextDeferredAuthProvider(redirectToTigerAuthentication));

@Component({
    selector: "app-kpi",
    template: '<span [id]="rootDomId"></span>',
})
export class KpiComponent implements OnChanges, AfterViewInit, OnDestroy {
    @Input() measureId = "";
    @Input() format?: string;
    @Input() workspace = "";
    @Input() filters: IFilter[] = [];

    public readonly rootDomId = crypto.randomUUID();
    private root: Root | null = null;

    private getRootDomNode(): HTMLElement {
        const node = document.getElementById(this.rootDomId);
        if (!node) {
            throw new Error(`Node '${this.rootDomId}' not found.`);
        }
        return node;
    }

    private getProps(): IKpiProps {
        const { workspace, measureId, filters, format } = this;
        return {
            backend,
            workspace,
            measure: newMeasure(measureId, (m) => (format ? m.format(format) : m)),
            filters,
        };
    }

    private render(): void {
        if (!this.root && document.getElementById(this.rootDomId)) {
            this.root = createRoot(this.getRootDomNode());
        }
        this.root?.render(createElement(Kpi, this.getProps()));
    }

    ngOnChanges(): void {
        this.render();
    }

    ngAfterViewInit(): void {
        this.render();
    }

    ngOnDestroy(): void {
        this.root?.unmount();
        this.root = null;
    }
}
```

## Render charts

Charts fill their container, so give the wrapper's root DOM node a size:

```ts
// column-chart.component.ts
@Component({
    selector: "app-column-chart",
    template: '<div style="height: 300px" [id]="rootDomId"></div>',
})
export class ColumnChartComponent {
    // Same structure as KpiComponent, rendering ColumnChart from @gooddata/sdk-ui-all.
}
```

Import the chart styles into your global styles, either in `styles.css`:

```css
@import "@gooddata/sdk-ui-charts/styles/css/main.css";
```

or in `angular.json`:

```json
{
    "architect": {
        "build": {
            "options": {
                "styles": ["src/styles.css", "node_modules/@gooddata/sdk-ui-charts/styles/css/main.css"]
            }
        }
    }
}
```

If you use the pivot table, also import `@gooddata/sdk-ui-pivot/styles/css/main.css`. For more about global styles, see the [Angular workspace configuration](https://angular.dev/reference/configs/workspace-config#styles-and-scripts-configuration).

## Use the component

Use the wrapped component in your templates and bind its inputs:

```html
<app-kpi workspace="<workspace-id>" measureId="<measure-id>"></app-kpi>
```

To handle the loading and error states yourself, pass components that render nothing in `getProps`:

```ts
return {
    // ...the props above
    LoadingComponent: () => null,
    ErrorComponent: () => null,
};
```

See [LoadingComponent](../../interactivity/loading-component/) and [ErrorComponent](../../interactivity/error-component/).
