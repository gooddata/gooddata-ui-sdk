---
title: Develop your first dashboard plugin
linkTitle: Develop your first plugin
description: Scaffold a dashboard plugin, run it against a live dashboard, then build, host, register, and link it.
category: Dashboard & plugins
diataxis_type: tutorial
api_symbols:
  - "@gooddata/sdk-ui-dashboard:DashboardPluginV1"
  - "@gooddata/sdk-ui-dashboard:IDashboardCustomizer"
related_pages:
  - /docs/dashboard-plugins/dashboard-plugins
  - /docs/dashboard-plugins/dashboard-plugins-api
  - /docs/dashboard-plugins/customize-widgets
  - /docs/dashboard-plugins/dashboard-events
  - /docs/dashboard-plugins/dashboard-plugins-upgrade
type: docs
weight: 31
section: Dashboard & plugins
ai_generated_body: true
---

Let's build a dashboard plugin and run it on a real dashboard. You start from the project that the plugin toolkit generates, change what it renders, and try it in a local development harness. Then you build it, host it, and attach it to a dashboard in your workspace. For the concepts behind plugins, such as the contract, lifecycle, and runtime guarantees, see [Dashboard plugins](../dashboard-plugins/).

You need:

- Node.js `^24.12.0` LTS and npm. See [Platform compatibility](../../getting-started/platform-compatibility/#toolchain).
- A GoodData Cloud or GoodData.CN account with an [API token](https://www.gooddata.ai/docs/cloud/manage-organization/user-token/).
- The IDs of a workspace and of a dashboard in it to develop against.
- A place to host static files over HTTPS where you control the response headers.

## Create the plugin project

Run the toolkit's `init` command with a name for your plugin:

```bash
npx @gooddata/plugin-toolkit@latest dashboard-plugin init hello-plugin
```

It asks for your GoodData hostname, a language (TypeScript or JavaScript), and the workspace and dashboard IDs. Then it creates the project in a new directory named after your plugin and installs its dependencies. To skip the prompts, pass the values as options: `--hostname`, `--language`, `--workspace-id`, and `--dashboard-id`.

The toolkit derives a plugin identifier from the name: `hello-plugin` becomes `dp_hello_plugin`. This tutorial uses `dp_hello_plugin` in paths and URLs, so replace it with your own identifier.

The toolkit writes your hostname, workspace, and dashboard into `.env`. The one thing left is your credentials. Open `.env.secrets`, uncomment the `TIGER_API_TOKEN` line, and paste your API token:

```bash
TIGER_API_TOKEN=<your-api-token>
```

Both files are used only by the development harness and the toolkit commands, and they never end up in the plugin build. Once the plugin runs inside a GoodData dashboard, the dashboard handles authentication for it.

{{% alert color="warning" title="Keep credentials out of the plugin code" %}}
Never put tokens, passwords, or other secrets in the plugin source or its assets. The built plugin is publicly hosted, so anyone can read it.
{{% /alert %}}

## Run the plugin locally

Start the development harness:

```bash
cd hello-plugin
npm start
```

Open `https://127.0.0.1:3001`. The harness serves HTTPS with a self-signed certificate, so the browser warns you the first time. Accept the warning to continue. If your GoodData hostname uses `http://`, the harness uses `http://` too.

You see your dashboard with a new section at the top, titled **Section Added By Plugin** and containing the text "Hello from custom widget". That section comes from the plugin, so you've got it running against live data already.

## Look at the plugin code

Your code lives in `src/dp_hello_plugin/`, and the main file is `src/dp_hello_plugin/Plugin.tsx` (`Plugin.jsx` if you chose JavaScript). Add as many files and folders as you need under `src/dp_hello_plugin/`. Don't rename or edit `src/dp_hello_plugin_engine/`, `src/dp_hello_plugin_entry/`, or `src/harness/`, because the build and the runtime loading depend on their names.

The `Plugin` class has three lifecycle methods:

- `onPluginLoaded(ctx, parameters)` runs first, after the plugin's files load. `parameters` is the string you attach to the dashboard-plugin link, if any.
- `register(ctx, customize, handlers)` is where you register customizations and event handlers. The dashboard calls it before it mounts.
- `onPluginUnload(ctx)` runs when the dashboard unmounts. Use it for cleanup.

Here's the `register()` method the toolkit generated:

```tsx
public register(
    _ctx: DashboardContext,
    customize: IDashboardCustomizer,
    handlers: IDashboardEventHandling,
): void {
    customize.customWidgets().addCustomWidget("myCustomWidget", MyCustomWidget);
    customize.layout().customizeFluidLayout((_layout, customizer) => {
        customizer.addSection(
            0,
            newDashboardSection(
                "Section Added By Plugin",
                newDashboardItem(newCustomWidget("myWidget1", "myCustomWidget"), {
                    xl: { gridWidth: 12, gridHeight: 1 },
                }),
            ),
        );
    });
    handlers.addEventHandler("GDC.DASH/EVT.INITIALIZED", (evt) => {
        console.log("### Dashboard initialized", evt);
    });
}
```

It registers a custom widget type, adds a section with one instance of that widget at the top of the layout, and logs an event once the dashboard is initialized.

## Change what the plugin renders

Let's make the custom widget read the dashboard's state. In `Plugin.tsx`, add two imports and change `MyCustomWidget`:

```diff
     newDashboardSection,
+    selectDashboardTitle,
+    useDashboardSelector,
 } from "@gooddata/sdk-ui-dashboard";

 function MyCustomWidget(_props: IDashboardWidgetProps): ReactElement {
-    return <div>Hello from custom widget</div>;
+    const title = useDashboardSelector(selectDashboardTitle);
+
+    return <div>Hello from the plugin on "{title}"</div>;
 }
```

Save the file. The harness reloads, and the section now shows your dashboard's title. [`useDashboardSelector`](../use-dashboard-selector/) gives any component rendered by the dashboard access to its full state.

The `customize` argument of `register()` is your entry point to everything else. The methods you'll reach for most often are:

- `customize.customWidgets().addCustomWidget()` registers a new widget type.
- `customize.insightWidgets().withCustomProvider()` replaces how an existing visualization widget renders, for example with your own chart that uses the same data.
- `customize.layout().customizeFluidLayout()` adds sections and items to the layout.

See the [Dashboard plugin API](../dashboard-plugins-api/) for the full list.

If you change existing widgets, decide how the plugin picks which ones to change. It can match on link parameters, on tags, on a prefix or suffix in the widget title, or on the visualization type. The [plugin examples gallery](https://github.com/gooddata/gooddata-plugin-examples) has examples to learn from.

## Build the plugin

```bash
npm run build-plugin
```

The build writes the plugin to `esm/dashboardPlugin/`. The entry file is `dp_hello_plugin.mjs`. The other files are chunks that the entry file loads on demand, and the plugin needs all of them.

## Host the plugin

GoodData doesn't host plugins, so upload the whole `esm/dashboardPlugin/` directory to your own hosting. The dashboard loads the plugin in the browser as JavaScript modules, and browsers are strict about how modules are served. Your hosting has to meet all of these requirements:

| Requirement | Why | What to set |
| --- | --- | --- |
| HTTPS | The toolkit accepts only `https://` plugin URLs, and dashboards run on HTTPS. | Serve the files from an `https://` URL. |
| CORS | Browsers always fetch JavaScript modules with CORS. The entry file and every chunk it imports are cross-origin requests from your GoodData host. | Send `Access-Control-Allow-Origin` with your GoodData origin, for example `https://your-org.cloud.gooddata.com`, or `*`, on **every** plugin file. |
| MIME type | Browsers refuse to run a JavaScript module served with a non-JavaScript content type. | Serve `.mjs` and `.js` files as `Content-Type: text/javascript`, and other files with their usual content types. |
| One directory per build | Overwriting files changes every dashboard that uses the plugin at once, and caches can mix files from two builds. | Upload each build to a new directory, for example `https://your.host/dp_hello_plugin/1.0.0/`. |

This is the opposite direction from the setup in [Resolve cross-origin errors](../../integrations/cross-origin-issues/). There, your app calls GoodData and GoodData must allow your origin. Here, the GoodData dashboard requests files from your host, so your host must allow the GoodData origin.

If you host on Amazon S3, upload in two passes. The first pass sets the content type of the JavaScript files explicitly, so the `.mjs` files don't end up with a generic binary content type. The second pass uploads everything else, such as fonts or images your plugin imports, and lets the AWS CLI pick their types. Then [configure CORS on the bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html).

```bash
aws s3 cp esm/dashboardPlugin s3://your-bucket/dp_hello_plugin/1.0.0/ --recursive \
  --exclude "*" --include "*.mjs" --include "*.js" --content-type text/javascript
aws s3 cp esm/dashboardPlugin s3://your-bucket/dp_hello_plugin/1.0.0/ --recursive \
  --exclude "*.mjs" --exclude "*.js"
```

Check the headers before you go further. This command sends a GET request with an `Origin` header, as the browser does, and prints only the response headers:

```bash
curl -s -o /dev/null -D - -H "Origin: https://your-org.cloud.gooddata.com" https://your.host/dp_hello_plugin/1.0.0/dp_hello_plugin.mjs
```

The response must include `content-type: text/javascript` (`application/javascript` works too) and `access-control-allow-origin` with your origin or `*`. Also check one chunk file from the same directory.

## Allow the host in GoodData's CSP

GoodData's Content Security Policy decides which hosts a dashboard may load scripts from. Changing it requires the `Organization.MANAGE` permission. If you don't have it, ask an organization administrator to add your hosting origin for you.

Add your hosting origin to the `script-src` directive:

- **In the UI:** on the GoodData home page, select **Settings**. Next to **Content security policy (CSP)**, click **Manage**, then add the origin to `script-src`.
- **With the API:** send a request to `/api/v1/entities/cspDirectives`:

  ```bash
  curl -X POST "https://your-org.cloud.gooddata.com/api/v1/entities/cspDirectives" \
    -H "Authorization: Bearer <your-api-token>" \
    -H "Content-Type: application/vnd.gooddata.api+json" \
    -d '{"data":{"id":"script-src","type":"cspDirective","attributes":{"sources":["https://your.host"]}}}'
  ```

  If `script-src` already exists, update it with `PUT /api/v1/entities/cspDirectives/script-src` and include the existing sources, because the request replaces the whole list.

If the plugin loads images, styles, or fonts from your host, add the origin to `img-src`, `style-src`, or `font-src` as well. The combined CSP header can't exceed 3000 characters. For details, see [Enable CSP for an organization](https://www.gooddata.ai/docs/cloud/manage-organization/set-up-csp-for-organization/).

## Add the plugin to a workspace

Register the hosted plugin in the workspace from your `.env`. Pass the URL of the entry file:

```bash
npm run add-plugin -- "https://your.host/dp_hello_plugin/1.0.0/dp_hello_plugin.mjs"
```

The toolkit prints `Created new plugin object with ID: <id>`. Copy the ID, because you need it in the next step.

{{% alert color="info" title="A successful add-plugin doesn't prove the dashboard can load the plugin" %}}
The toolkit only checks that the URL responds from your machine. It doesn't check CORS, the MIME type, or the CSP. Those are enforced by the browser when the dashboard loads the plugin, so a plugin can register fine and still fail to load.
{{% /alert %}}

## Link the plugin to a dashboard

Link the plugin to the dashboard from your `.env`:

```bash
npm run link-plugin -- <plugin-object-id>
```

Open the dashboard in GoodData. The section from your plugin appears at the top. That's the plugin running in production.

To reuse one plugin on several dashboards with different behavior, attach parameters to each link. Run `npm run link-plugin -- <plugin-object-id> --with-parameters`, and the toolkit opens an editor for the parameters. The plugin receives the string you enter as the `parameters` argument of `onPluginLoaded`. The toolkit also handles the rest of the link lifecycle:

- `npm run update-plugin-params -- <plugin-object-id>` changes the parameters of an existing link.
- `npm run remove-plugin-params -- <plugin-object-id>` removes them.
- `npm run unlink-plugin -- <plugin-object-id>` removes the plugin from the dashboard.

Every command targets the workspace and dashboard from `.env` by default. To target others, pass `--workspace-id` and `--dashboard-id`. `npm run gdc-plugins -- dashboard-plugin link --help` lists the options. To roll a plugin out to many workspaces, run these steps against the REST API in your provisioning automation rather than by hand.

### Troubleshoot plugin loading

When a plugin fails to load, the browser console on the dashboard shows why. The dashboard also logs `Dynamic Script Error: <url>` when the entry file itself fails to load. Find the browser message in this table:

| Console message | Cause | Fix |
| --- | --- | --- |
| `Access to script at '…/dp_hello_plugin.mjs' from origin '…' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.` | Your host doesn't send the CORS header. | Add `Access-Control-Allow-Origin` to every plugin file. See [Host the plugin](#host-the-plugin). |
| `Failed to fetch dynamically imported module: …/<number>.mjs`, after a CORS error for the same file | The entry file has the CORS header but the chunks don't. | Apply the CORS header to the whole directory, not just the entry file. |
| `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.` | Your host serves `.mjs` files with the wrong content type. | Serve `.mjs` and `.js` as `text/javascript`. |
| `Loading the script '…/dp_hello_plugin.mjs' violates the following Content Security Policy directive: "script-src …"` | The GoodData CSP doesn't allow your host. | Add your origin to `script-src`. See [Allow the host in GoodData's CSP](#allow-the-host-in-gooddatas-csp). |
| `Failed to load resource: the server responded with a status of 404 (Not Found)` followed by `Failed to fetch dynamically imported module: …/<number>.mjs` | Part of the build wasn't uploaded. | Upload the complete `esm/dashboardPlugin/` directory, and link the entry file from that same directory. |

## Release a new version

When you change the plugin, don't overwrite the hosted files. Build again, upload the build to a new directory, and switch the dashboard over:

```bash
npm run build-plugin
# upload esm/dashboardPlugin/ to https://your.host/dp_hello_plugin/1.0.1/
npm run add-plugin -- "https://your.host/dp_hello_plugin/1.0.1/dp_hello_plugin.mjs"
npm run unlink-plugin -- <old-plugin-object-id>
npm run link-plugin -- <new-plugin-object-id>
```

Unlink the old version first, because the toolkit refuses to link two plugins with the same entry file name to one dashboard. If the old link had parameters, add `--with-parameters` and enter them again. Keep the old directory until every dashboard has moved, so you can switch back if the new version misbehaves.

From here, you can:

- Explore the customization and event APIs in the [Dashboard plugin API](../dashboard-plugins-api/) and [Handle dashboard events](../dashboard-events/).
- Read dashboard state from your components with [useDashboardSelector](../use-dashboard-selector/), and change it by dispatching commands with [useDispatchDashboardCommand](../dashboard/#commands).
- Keep deployed plugins current with [Upgrade dashboard plugins](../dashboard-plugins-upgrade/).
- Use your plugin in your own React application: [Embed a dashboard with plugins](../embed-dashboard-with-plugins/).
