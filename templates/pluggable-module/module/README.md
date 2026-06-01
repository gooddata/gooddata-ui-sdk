# gdc-app-template-name-module

Pluggable application module for **gdc-app-template-name**.

This is a template. Run `rush init-pluggable-app` to scaffold a new application from it.

## Structure

- `src/pluggableApp.tsx` — mount/unmount lifecycle, forwards `onEvent` and `onTelemetryEvent` callbacks
- `src/AppProviders.tsx` — thin wrapper around `AppProviders` from `@gooddata/sdk-ui-pluggable-application` that binds the app's translation bundle
- `src/App.tsx` — main React component, consumes platform context, workspace, and localization
- `src/translations/` — locale JSON files and async loader (`translations.ts`) using `Record<ILocale, ...>` for compile-time enforcement

## Development

```bash
# Run tests in watch mode
rushx dev

# Run tests once
rushx test-once

# Build
rushx build
```

## Adding translations

1. Add keys to `src/translations/en-US.json` with `{ "text": "...", "crowdinContext": "..." }` format.
2. Copy the new keys to all other locale JSON files (they start as en-US copies; translators update them later).
3. The `translations.ts` async loader and `Record<ILocale, ...>` type ensure every locale is covered at build time.

## Localization enforcement

The `asyncComponentTranslations` map is typed as `Record<ILocale, ...>`. If a new locale is added to `ILocale` in `@gooddata/sdk-model`, the build will fail until a matching JSON file and map entry are added here.
