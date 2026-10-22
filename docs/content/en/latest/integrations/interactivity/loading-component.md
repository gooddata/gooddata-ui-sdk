---
legacy_path: learn/add_interactivity/loading_component
title: LoadingComponent
category: Integrations / Interactivity
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui:LoadingComponent"
source_files:
  - src/base/react/LoadingComponent.tsx
props_interfaces:
  - ILoadingProps
related_pages:
  - /docs/integrations/interactivity/error-component
  - /docs/visualisations/charts-and-plots
  - /docs/integrations/interactivity/handle-errors
description: Customize or disable the LoadingComponent indicator shown while a GoodData.UI visualization fetches data.
ai_generated_description: true
type: docs
weight: 96
section: Integrations
subsection: Interactivity
aliases:
  - "../../learn/add_interactivity/loading_component/"
---

The `LoadingComponent` prop lets you customize what a visualization component renders while it's loading data. To hide the loading state, pass a component that renders nothing.

All visualization components support the `LoadingComponent` prop. The default `LoadingComponent` is exported from `@gooddata/sdk-ui`, so you can also render it yourself with different props. Its defaults are a three-dot animation 8px high (`imageHeight`), animated at `speed` 1, in the theme's complementary gray (`color`), filling the available height (`height="100%"`) as a block element (`inline={false}`).

## Example: disabled LoadingComponent

In the following example, the `Kpi` component shows neither the loading indicator nor the error message.

```tsx
import { Kpi } from "@gooddata/sdk-ui";
import * as Md from "./catalog.js";

<Kpi measure={Md.$FranchiseFees} LoadingComponent={() => null} ErrorComponent={() => null} />;
```

## Example: customized LoadingComponent

In the following example, the default `LoadingComponent` is customized with a color, a fixed height, an indicator size, and an animation speed.

```tsx
import { Kpi, LoadingComponent } from "@gooddata/sdk-ui";
import * as Md from "./catalog.js";

const CustomLoading = () => <LoadingComponent color="tomato" height={300} imageHeight={16} speed={2} />;

<Kpi measure={Md.$FranchiseFees} LoadingComponent={CustomLoading} />;
```

## Props

{{% props %}}
