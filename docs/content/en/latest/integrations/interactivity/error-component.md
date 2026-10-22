---
legacy_path: learn/add_interactivity/error_component
title: ErrorComponent
category: Integrations / Interactivity
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui:ErrorComponent"
source_files:
  - src/base/react/ErrorComponent.tsx
props_interfaces:
  - IErrorProps
related_pages:
  - /docs/integrations/interactivity/loading-component
  - /docs/integrations/interactivity/handle-errors
  - /docs/visualisations/charts-and-plots
description: Customize or disable the ErrorComponent indicator shown when a GoodData.UI visualization fails to render.
ai_generated_description: true
type: docs
weight: 95
section: Integrations
subsection: Interactivity
aliases:
  - "../../learn/add_interactivity/error_component/"
---

The `ErrorComponent` prop lets you customize what a visualization component renders when it's in its error state. The component you pass receives `IErrorProps`: the `message` and `description` already localized for the error code, the `code` itself, and the `icon` class name. To hide the error state, pass a component that renders nothing.

All visualization components support the `ErrorComponent` prop. The default `ErrorComponent` is exported from `@gooddata/sdk-ui`, so you can also render it yourself; by default it uses the `gd-icon-warning` icon and fills the available height.

To react differently to an empty result, a canceled request, or an expired session instead of replacing the message, handle the `onError` callback and narrow the error with the type guards; see [Handle errors](../handle-errors/).

## Example: disabled ErrorComponent

In the following example, the `Kpi` component shows neither the loading indicator nor the error message.

```tsx
import { Kpi } from "@gooddata/sdk-ui";
import * as Md from "./catalog.js";

<Kpi
    measure={Md.$FranchiseFees}
    LoadingComponent={() => null}
    ErrorComponent={() => null}
/>
```

## Example: customized ErrorComponent

In the following example, the default `ErrorComponent` is replaced by a custom component.

```tsx
import { Kpi, type IErrorProps } from "@gooddata/sdk-ui";
import * as Md from "./catalog.js";

const CustomError = ({ message, description, icon }: IErrorProps) => (
    <p>
        <span className={icon} /> <strong>{message}</strong>
        <br />
        {description}
    </p>
);

<Kpi
    measure={Md.$FranchiseFees}
    ErrorComponent={CustomError}
/>
```

## Props

{{% props %}}
