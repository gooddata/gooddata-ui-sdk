---
title: useTheme
category: Integrations / Hooks
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-theme-provider:useTheme"
  - "@gooddata/sdk-ui-theme-provider:useThemeIsLoading"
  - "@gooddata/sdk-ui-theme-provider:useIsDarkTheme"
source_files:
  - src/ThemeProvider/Context.tsx
related_pages:
  - /docs/integrations/embedding/apply-theming
  - /docs/integrations/hooks/use-backend
  - /docs/integrations/hooks/use-workspace
  - /docs/visualisations/chart-config
description: Read the current theme from ThemeProvider context, with companion hooks for loading state and dark-mode detection.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 99
section: Integrations
subsection: Hooks
---

`useTheme` returns the current theme from `ThemeProvider`. If you pass a theme, the hook returns that theme instead. The companion hooks `useThemeIsLoading`, `useThemeStatus`, and `useIsDarkTheme` report the loading state and whether the theme is dark. See [Apply theming](../../embedding/apply-theming/) for setting up `ThemeProvider`.

## Basic usage

```tsx
import type { ITheme } from "@gooddata/sdk-model";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

function MyComponent({ theme: themeProp }: { theme?: ITheme }) {
    // Uses themeProp if defined, otherwise falls back to the context value
    const theme = useTheme(themeProp);

    const primaryColor = theme?.palette?.primary?.base ?? "#14b2a9";

    return <div style={{ color: primaryColor }}>Themed content</div>;
}
```

### Wait for the theme to load

`useThemeIsLoading` tells you whether `ThemeProvider` is still loading the theme from the backend:

```tsx
import { useTheme, useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";

function MyComponent() {
    const theme = useTheme();
    const isLoading = useThemeIsLoading();

    if (isLoading) {
        return <div>Loading theme...</div>;
    }

    return <div style={{ color: theme?.palette?.primary?.base }}>Ready</div>;
}
```

### Detect a dark theme

`useIsDarkTheme` tells you whether the current theme is dark:

```tsx
import { useIsDarkTheme } from "@gooddata/sdk-ui-theme-provider";

function MyComponent() {
    const isDark = useIsDarkTheme();

    return <div className={isDark ? "dark-mode" : "light-mode"}>Content</div>;
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `theme` | `ITheme \| undefined` | Optional theme override for `useTheme`. If defined, the hook returns it instead of the context value. |

`useThemeIsLoading`, `useThemeStatus`, and `useIsDarkTheme` take no parameters.

## Return value

- `useTheme`: `ITheme | undefined`
- `useThemeIsLoading`: `boolean | undefined`
- `useThemeStatus`: `"pending" | "loading" | "success" | undefined`
- `useIsDarkTheme`: `boolean`

## Notes

- Without a `ThemeProvider` up the tree, `useTheme` returns `undefined`, so guard palette lookups with optional chaining or a fallback value.
- `useThemeStatus` tells apart `"pending"` (no load started), `"loading"` (the theme is being fetched), and `"success"` (the theme is resolved). Use it when `useThemeIsLoading` isn't precise enough.
- `useIsDarkTheme` returns `false` when there is no theme, so it's safe to call outside `ThemeProvider`.
