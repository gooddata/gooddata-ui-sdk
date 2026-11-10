# gdc-host-ui-template-name-module

Host UI module for **{applicationTemplateTitle}**.

A host UI module replaces the default GoodData application chrome: the header, the navigation and the page layout. The host still owns the router, the platform context, the AI assistant chat and the loading of pluggable applications. The host loads the module with Module Federation, calls `mount` once and pushes every change into the returned handle.

## Structure

- `src/hostUiModule.tsx`: the exported `hostUiModule` (`mount`, `allowedOrganizations`, `buildTimestamp`). `mount` renders the chrome into the host container and returns the handle that the host updates.
- `src/HostUi.tsx`: the starter chrome: organization name, one menu item per application, help links of the active application, AI assistant button, new-version notice and the application slot.
- `src/HostUi.css`: the starter styles. All class names start with `gdc-host-ui-template-name`.
- `vite.config.ts`: builds `remoteEntry.js` and exposes `./hostUiModule`.
- `../harness`: runs the real host runtime against your backend with this module in place of the default chrome.

## The contract

`mount(options)` receives:

| Option                  | Use                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `container`             | The element to render the chrome into.                                                                  |
| `ctx`                   | The platform context: user, organization, current workspace, settings, preferred locale.                |
| `resolvedApplications`  | The applications that the user can open. Build the navigation from them.                                |
| `pathname`              | The current path. Use it to mark the active menu item.                                                  |
| `navigate`, `replace`   | Ask the host to navigate. Do not change `window.location` or the history yourself.                      |
| `onChatToggleRequested` | Ask the host to open or close its AI assistant.                                                         |
| `onAskAiAssistant`      | Ask the host to open its AI assistant with a question.                                                  |
| `onError`               | Report an error from the chrome. The chrome renders in its own React root, outside the host's boundary. |

The handle must return the application container from `getAppContainer()` immediately after `mount` returns. The host renders the active application into that element. The optional handle methods (`updateContext`, `updateApplications`, `updatePathname`, `updateHeader`, `updateDocumentTitle`, `updateChatState`, `openPricingDialog`, `notify`) receive the changes after mount. Use `getPluggableApplicationHref` and `getPluggableApplicationLocalizedTitle` from `@gooddata/sdk-model` to build the menu.

The host mounts the module in every mode. In the embedded (iframe) mode and in the export mode (`ctx.embeddingMode === "iframe"` or `ctx.isExportMode`), render only the application container, as the starter does.

## Develop

```bash
cd ../harness
cp .env.template .env      # set BACKEND_URL and TIGER_API_TOKEN
npm run dev
```

The harness imports the module source directly, so a change shows at once.

## Build and deploy

The host loads remote modules only from the same hostname as the host, or from the GoodData plugins bucket (`demo-dashboard-plugins.gooddata.com`). For the plugins bucket, the build must allow your organization and must be younger than 30 days.

```bash
cp .env.template .env      # set ALLOWED_ORGANIZATIONS=<your organization id>
npm run dist               # writes dist/
```

Upload the contents of `dist/` to one folder, for example `<your-prefix>/gdc-host-ui-template-name/`. Rebuild and upload again at least every 30 days. After 30 days, or in an organization that the build does not allow, the host uses its default chrome. The host checks again when the platform context changes.

## Register

Set `uiModule` in the `REGISTERED_PLUGGABLE_APPLICATIONS` organization setting. Keep the existing `applications`, `headlessModules` and other keys of the setting. The host does not use `routeBase` for a UI module, but the registry requires it.

```json
{
    "apiVersion": "1.0",
    "uiModule": {
        "url": "https://demo-dashboard-plugins.gooddata.com/<your-prefix>/gdc-host-ui-template-name/remoteEntry.js",
        "scope": "{applicationTemplateFederationName}",
        "module": "./hostUiModule",
        "routeBase": "/"
    }
}
```

To create the setting with the API, save the JSON above as `registry.json` and wrap it in the organization setting payload (use `PATCH /api/v1/entities/organizationSettings/{id}` when the setting already exists):

```bash
jq '{data: {type: "organizationSetting", id: "registeredPluggableApplications", attributes: {type: "REGISTERED_PLUGGABLE_APPLICATIONS", content: .}}}' registry.json > setting.json
curl -X POST "$GOODDATA_HOST/api/v1/entities/organizationSettings" \
  -H "Authorization: Bearer $GOODDATA_API_TOKEN" \
  -H "Content-Type: application/vnd.gooddata.api+json" \
  -d @setting.json
```

When the module fails to load, the host logs the error and uses its default chrome. To go back to the default chrome, remove `uiModule` from the setting.
