---
title: Using Angular 9+
linkTitle: Angular 9+
copyright: (C) 2007-2018 GoodData Corporation
id: ht_use_react_component_in_angular_2.x
draft: true
---

<!-- Bear specific? -->

To be able to use the visual components in your Angular 9+ environment, wrap each component into an Angular component, and then render the React component using React 18's `createRoot` API inside.

Depending on your use case, it might be easier to integrate our [WebComponents library](../../../learn/web_components/) with your Angular app.

## Step 1. Install dependencies.


Install the latest dependencies using either `npm` or `yarn`. Your application must be able to render React components from `@gooddata/sdk-ui-all` using a unique ID \(`uuid`\), and you also must be able to issue an `invariant` exception if the DOM node is not available.

```bash
npm install --save uuid invariant react@^18.0.0 react-dom@^18.0.0 @gooddata/sdk-ui-all @gooddata/sdk-backend-bear
npm install --save-dev @types/react @types/react-dom
```

or

```bash
yarn add uuid invariant react@^18.0.0 react-dom@^18.0.0 @gooddata/sdk-ui-all @gooddata/sdk-backend-bear
yarn add --dev @types/react @types/react-dom
```

## Step 2. Update the global configuration

Update your configuration to be able to use GoodData.UI in Angular:

1. Add `(window as any).global = window;` to `polyfills.ts` due to missing `global`.
2. Add `"skipLibCheck": true` to your `tsconfig.json` to avoid misleading errors during compilation.

## Step 3. Declare the Angular wrapper component.

The Angular wrapper component renders a React component and re-renders it on a property change.

The component wrapper must be able to render React components imported from `@gooddata/sdk-ui-all`.
You can import any supported components from the package, and then either put them together using multiple `React.createElement` functions, or make an abstract wrapper component that accepts a React component reference as a parameter.

The following examples are using a single KPI component:

**kpi.component.ts**:

```javascript
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import * as uuid from "uuid";
import * as invariant from "invariant";

import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  AfterViewInit,
} from "@angular/core";
import { Kpi, IKpiProps, newMeasure } from "@gooddata/sdk-ui-all";
import bearFactory, {
  ContextDeferredAuthProvider,
} from "@gooddata/sdk-backend-bear";

// Just for illustration, you would probably create this once in your app and import here
const backend = bearFactory().withAuthentication(
  new ContextDeferredAuthProvider()
);

@Component({
  selector: "app-kpi",
  template: '<span [id]="rootDomID"></span>',
})
export class KpiComponent
  implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() measureId: string;
  @Input() format: string;
  @Input() workspace: string;
  @Input() filters: any[];
  @Input() onLoadingChanged?: any;
  @Input() onError?: any;

  public rootDomID: string;
  private root: ReactDOM.Root | null = null;

  protected getRootDomNode() {
    const node = document.getElementById(this.rootDomID);
    invariant(node, `Node '${this.rootDomID}' not found!`);
    return node;
  }

  protected getProps(): IKpiProps {
    const {
      workspace,
      measureId,
      filters,
      format,
      onLoadingChanged,
      onError,
    } = this;
    return {
      workspace,
      measure: newMeasure(measureId, (m) => m.format(format)),
      filters,
      onLoadingChanged,
      onError,
      backend,
    };
  }

  private isMounted(): boolean {
    return !!this.rootDomID;
  }

  protected render() {
    if (this.isMounted()) {
      if (!this.root) {
        this.root = ReactDOM.createRoot(this.getRootDomNode());
      }
      this.root.render(React.createElement(Kpi, this.getProps()));
    }
  }

  ngOnInit() {
    this.rootDomID = uuid.v1();
  }

  ngOnChanges() {
    this.render();
  }

  ngAfterViewInit() {
    this.render();
  }

  ngOnDestroy() {
    // React 18: Use root.unmount() instead of ReactDOM.unmountComponentAtNode
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}
```

If you want to render some charts, do the following:

1. Use a root dom node with the size defined:

    **columnchart.component.ts**:

    ```javascript
    ...

    import { ColumnChart } from "@gooddata/sdk-ui-all";

    ...

    @Component({
      selector: "app-column-chart",
      template: '<div style="height: 300px" [id]="rootDomID"></div>'
    })

    ...
    }
    ```

2. Import the `main.css` file from `@gooddata/react-components` to your global styles:

    **styles.css**:

    ```css
    @import "@gooddata/sdk-ui-charts/styles/css/main.css";
    ```

    or

    **angular.json**:

    ```json
    {
      ...
      "architect": {
          "build": {
              "builder": "@angular-devkit/build-angular:browser",
              "options": {

                "styles": [
                  "src/styles.css",
                  "node_modules/@gooddata/sdk-ui-charts/styles/css/main.css"
                ],
                "scripts": []
              },
              ...
          }
      ...
    }

    ```

If you are using the Pivot Table component, import the `pivotTable.css` file into your global styles from `@gooddata/sdk-ui-pivot/styles/css/main.css`. For more details about importing global styles in an Angular app, see the [Angular documentation](https://angular.io/guide/workspace-config#styles-and-scripts-configuration).

{{% alert color="info" title="React 18 Update"%}}
The code examples have been updated to use React 18's `createRoot` API instead of the deprecated `ReactDOM.render()`.
{{% /alert %}}

The React 18 implementation properly handles component cleanup in `ngOnDestroy` by calling `root.unmount()` when the root exists.

## Step 4. Use the component.

You are now ready to use the GoodData React components in your Angular app.

You can use wrapped components across your app, pass the component props to it, and even update them using data-binding.

```javascript
<app-kpi workspace="xms7ga4tf3g3nzucd8380o2bev8oeknp" measureId="aaEGaXAEgB7U"></app-kpi>
```

If you want to handle the loading and error content yourself and you do not want to use the default LoadingComponent and ErrorComponent, pass a null explicitly:

-   `LoadingComponent={null}`
-   `ErrorComponent={null}`

For more information about including React components in Angular, see [https://www.packtpub.com/books/content/integrating-angular-2-react](https://www.packtpub.com/books/content/integrating-angular-2-react).