---
legacy_path: learn/apply_theming
title: Apply theming
category: Integrations / Embedding
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-ui-theme-provider:ThemeProvider"
source_files:
  - src/ThemeProvider/ThemeProvider.tsx
props_interfaces:
  - IThemeProviderProps
related_pages:
  - /docs/integrations/hooks/use-theme
  - /docs/integrations/embedding/embed-dashboards
  - /docs/integrations/embedding/embed-visualizations
  - /docs/visualisations/chart-config
description: Apply custom themes to GoodData.UI dashboards and visualizations by wrapping your app in ThemeProvider.
ai_generated_description: true
type: docs
weight: 87
section: Integrations
subsection: Embedding
aliases:
  - "../../learn/apply_theming/"
---

To apply theming in GoodData.UI, wrap your application in the `ThemeProvider` component. It loads the theme selected in your workspace, or a theme you pass in, and applies it to your dashboards and visualizations (see [Create custom themes](https://www.gooddata.ai/docs/cloud/customize-appearance/create-custom-themes/)).

To load a theme from your workspace, `ThemeProvider` needs a `backend` and a `workspace` — either from the surrounding providers or from its own props (see [Integrate into an existing application](../../backend-setup/)).

{{% alert color="warning" %}}
Always place `ThemeProvider` at the root of your application. A theme is applied globally to everything on the page: when you wrap one visual component in `ThemeProvider`, everything else on the page is themed too, even though it is not wrapped.
{{% /alert %}}

## Use ThemeProvider with backend and workspace providers

When `ThemeProvider` is rendered inside `BackendProvider` and `WorkspaceProvider`, you do not need to pass it any additional props.

```tsx
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";

<BackendProvider backend={backend}>
    <WorkspaceProvider workspace="your-workspace-id">
        <ThemeProvider>
            <Application />
        </ThemeProvider>
    </WorkspaceProvider>
</BackendProvider>
```

## Use ThemeProvider without backend and workspace providers

Without `BackendProvider` and `WorkspaceProvider` in the tree, pass the `backend` and `workspace` props to `ThemeProvider` directly.

```tsx
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";

<ThemeProvider backend={backend} workspace="your-workspace-id">
    <Application />
</ThemeProvider>
```

## Use ThemeProvider with a custom theme

You can define a custom theme and pass it to `ThemeProvider` through the `theme` prop; the provider then uses it instead of loading one from the workspace. For all available properties, see the `ITheme` interface (beta) in the API reference.

Usage:

```tsx
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";

<ThemeProvider theme={customTheme}>
    <Application />
</ThemeProvider>
```

Declaration:

```ts
import type { ITheme } from "@gooddata/sdk-model";

export const customTheme: ITheme = {
  button: {
    borderRadius: "15",
    dropShadow: true,
    textCapitalization: true,
  },
  modal: {
    borderColor: "#1b4096",
    borderRadius: "5",
    borderWidth: "2",
    dropShadow: false,
    outsideBackgroundColor: "#e8cda2",
    title: {
      color: "#1b4096",
      lineColor: "#000",
    },
  },
  palette: {
    error: {
      base: "#ff2e5f",
    },
    primary: {
      base: "#eba12a",
    },
    success: {
      base: "#13ed4d",
    },
    warning: {
      base: "#ddff19",
    },
  },
  tooltip: {
    backgroundColor: "#101050",
    color: "#fff",
  },
  typography: {
    font:
      "url(https://cdn.jsdelivr.net/npm/roboto-font@0.1.0/fonts/Roboto/roboto-regular-webfont.ttf)",
    fontBold:
      "url(https://cdn.jsdelivr.net/npm/roboto-font@0.1.0/fonts/Roboto/roboto-bold-webfont.ttf)",
  },
};
```

## Props

{{% props %}}
