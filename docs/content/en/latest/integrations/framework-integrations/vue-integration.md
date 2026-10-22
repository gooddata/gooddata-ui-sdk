---
legacy_path: learn/web_components/vue
title: Embed GoodData in a Vue app
linkTitle: Vue
category: Integrations / Framework guides
diataxis_type: howto
related_pages:
  - /docs/integrations/web-components/web-components-overview
  - /docs/integrations/web-components/web-components-auth
  - /docs/integrations/framework-integrations/angular-integration
  - /docs/integrations/web-components/embed-custom-elements
  - /docs/integrations/web-components/ai-assistant-custom-element
description: Embed GoodData dashboards, visualizations, and the AI Assistant in a Vue app with the Web Components library, the Vite custom-element setting, and event listeners.
ai_generated_description: true
type: docs
weight: 44
section: Integrations
subsection: Framework guides
aliases:
  - "../../learn/web_components/vue/"
---

Vue supports Web Components out of the box. This guide embeds a GoodData dashboard, a visualization, and the AI Assistant in a Vue app built with Vite, using the `gd-dashboard-embed`, `gd-insight-embed`, and `gd-ai-assistant` custom elements.

## Load the Web Components library

Add a `<script>` tag to your main HTML file, `index.html` in the project root:

```diff
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <link rel="icon" href="/favicon.ico">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vite App</title>
+       <script type="module" async src="https://<your-gooddata-host>/components/<workspace-id>.js?auth=sso"></script>
      </head>
      <body>
        <div id="app"></div>
        <script type="module" src="/src/main.js"></script>
      </body>
    </html>
```

Read the [prerequisites and limitations](../../web-components/web-components-overview/#prerequisites-and-limitations) in the Web Components overview first. The `?auth=sso` parameter signs the user in automatically. For a programmatic flow, such as an API token or your own `NotAuthenticatedHandler`, see [Web Components authentication](../../web-components/web-components-auth/).

## Configure custom elements

Tell Vue which elements are Web Components. Otherwise, Vue looks for Vue components with those tag names and reports an error when it can't find them.

Update `vite.config.js`:

```diff
    import { fileURLToPath, URL } from 'node:url'

    import { defineConfig } from 'vite'
    import vue from '@vitejs/plugin-vue'
    import vueJsx from '@vitejs/plugin-vue-jsx'

    // https://vite.dev/config/
    export default defineConfig({
-     plugins: [vue(), vueJsx()],
+     plugins: [vue({
+       template: {
+         compilerOptions: {
+           isCustomElement: tag => tag.startsWith('gd-')
+         }
+       }
+     }), vueJsx()],
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('./src', import.meta.url))
        }
      }
    })
```

## Embed a dashboard and a visualization

Use the elements anywhere in a Vue template, for example in `src/App.vue`:

```html
<template>
    <gd-dashboard-embed dashboard="<dashboard-id>"></gd-dashboard-embed>
    <gd-insight-embed insight="<visualization-id>" style="display: block; height: 500px"></gd-insight-embed>
    <gd-ai-assistant></gd-ai-assistant>
</template>
```

Copy the visualization ID and the dashboard ID from the browser's address bar, on the Analyze and Dashboards pages. Give `gd-insight-embed` `display: block` and a fixed height; otherwise it collapses to zero height.

[Dashboard and visualization embed elements](../../web-components/embed-custom-elements/) lists every attribute, property, method, and event of the two embed elements.

## Set the IDs from component code

Bind the IDs from the component's script:

```diff
    <script setup>
+     const visualizationId = '<visualization-id>';
+     const dashboardId = '<dashboard-id>'
+     const workspaceId = '<workspace-id>';
    </script>

    <template>
-     <gd-dashboard-embed dashboard="<dashboard-id>"></gd-dashboard-embed>
-     <gd-insight-embed insight="<visualization-id>" style="display: block; height: 500px"></gd-insight-embed>
+     <gd-dashboard-embed :dashboard="dashboardId"></gd-dashboard-embed>
+     <gd-insight-embed :insight="visualizationId" style="display: block; height: 500px"></gd-insight-embed>
+     <gd-ai-assistant :workspace="workspaceId"></gd-ai-assistant>
    </template>
```

The embed elements lock the `dashboard` and `insight` identity after the first render. To show a different dashboard or visualization, render a new element, for example with a `key` bound to the ID, instead of changing the bound value.

## Listen to events

All three elements dispatch DOM custom events.

### Visualization events

Listen to `gd-insight-embed` events with Vue event binding:

```diff
    <script setup>
      const visualizationId = '<visualization-id>';
      const dashboardId = '<dashboard-id>';
      const workspaceId = '<workspace-id>';
+     const onInsightLoaded = e => console.log(e.detail);
    </script>

    <template>
-     <gd-insight-embed :insight="visualizationId" style="display: block; height: 500px"></gd-insight-embed>
+     <gd-insight-embed :insight="visualizationId" @insightLoaded="onInsightLoaded" style="display: block; height: 500px"></gd-insight-embed>
      <gd-dashboard-embed :dashboard="dashboardId"></gd-dashboard-embed>
      <gd-ai-assistant :workspace="workspaceId"></gd-ai-assistant>
    </template>
```

See the [`gd-insight-embed` events](../../web-components/embed-custom-elements/#events-1).

### Dashboard events

Dashboard event names such as `GDC.DASH/EVT.INITIALIZED` contain characters Vue event binding doesn't accept, so add the listeners on the DOM element through a template ref, and remove them when the component unmounts:

```diff
    <script setup>
      import {onMounted, onUnmounted, ref} from "vue";

      const visualizationId = '<visualization-id>';
      const dashboardId = '<dashboard-id>';
      const workspaceId = '<workspace-id>';
      const onInsightLoaded = e => console.log(e.detail);
+     const onDashboardLoaded = e => console.log(e.detail);
+     const dashboard = ref(null);
+     const EVENT_NAME = 'GDC.DASH/EVT.INITIALIZED';
+
+     onMounted(() => {
+       dashboard.value?.addEventListener(EVENT_NAME, onDashboardLoaded);
+     })
+
+     onUnmounted(() => {
+       dashboard.value?.removeEventListener(EVENT_NAME, onDashboardLoaded);
+     })
    </script>

    <template>
      <gd-insight-embed :insight="visualizationId" @insightLoaded="onInsightLoaded" style="display: block; height: 500px"></gd-insight-embed>
-     <gd-dashboard-embed :dashboard="dashboardId"></gd-dashboard-embed>
+     <gd-dashboard-embed :dashboard="dashboardId" ref="dashboard"></gd-dashboard-embed>
      <gd-ai-assistant :workspace="workspaceId"></gd-ai-assistant>
    </template>
```

`gd-dashboard-embed` also dispatches `gd-ready` and `gd-error`. See the [`gd-dashboard-embed` events](../../web-components/embed-custom-elements/#events).

### AI Assistant events

Attach `gd-ai-assistant` listeners through a template ref too:

```diff
    <script setup>
      import {onMounted, onUnmounted, ref} from "vue";

      const visualizationId = '<visualization-id>';
      const dashboardId = '<dashboard-id>';
      const workspaceId = '<workspace-id>';
      const onInsightLoaded = e => console.log(e.detail);
      const onDashboardLoaded = e => console.log(e.detail);
+     const onChatLinkClick = e => console.log(e.detail);
      const dashboard = ref(null);
+     const aiChat = ref(null);
      const EVENT_NAME = 'GDC.DASH/EVT.INITIALIZED';
+     const CHAT_EVENT_NAME = 'linkClick';

      onMounted(() => {
        dashboard.value?.addEventListener(EVENT_NAME, onDashboardLoaded);
+       aiChat.value?.addEventListener(CHAT_EVENT_NAME, onChatLinkClick);
      })

      onUnmounted(() => {
        dashboard.value?.removeEventListener(EVENT_NAME, onDashboardLoaded);
+       aiChat.value?.removeEventListener(CHAT_EVENT_NAME, onChatLinkClick);
      })
    </script>

    <template>
      <gd-insight-embed :insight="visualizationId" @insightLoaded="onInsightLoaded" style="display: block; height: 500px"></gd-insight-embed>
      <gd-dashboard-embed :dashboard="dashboardId" ref="dashboard"></gd-dashboard-embed>
+     <gd-ai-assistant :workspace="workspaceId" ref="aiChat"></gd-ai-assistant>
    </template>
```

See the [AI Assistant events](../../web-components/ai-assistant-custom-element/#supported-events).