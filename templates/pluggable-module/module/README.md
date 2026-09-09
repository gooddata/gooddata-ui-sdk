# gdc-app-template-name-module

Pluggable application module for **gdc-app-template-name**.

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
2. Do **not** add the keys to the other locale JSON files. They are owned by the
   post-merge Crowdin pipeline, which overwrites any manual edit on its next
   download. A key that exists only in `en-US.json` is the expected state of a
   feature PR; the translation PR adds the other locales, usually within the
   next business day. See `sdk/dev_docs/localisation.md` and
   `.claude/l10n-workflow.md`.
3. Make sure the module's `en-US.json` is listed in the root `crowdin.yml`, or
   its strings are never uploaded for translation.
4. The `translations.ts` async loader and `Record<ILocale, ...>` type ensure a
   JSON file exists for every locale at build time. They do not check that each
   file contains every key — missing keys fall back to the message id until the
   pipeline fills them.

## Localization enforcement

The `asyncComponentTranslations` map is typed as `Record<ILocale, ...>`. If a new locale is added to `ILocale` in `@gooddata/sdk-model`, the build will fail until a matching JSON file and map entry are added here.
