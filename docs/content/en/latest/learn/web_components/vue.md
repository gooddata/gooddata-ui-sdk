---
title: Using WebComponents with Vue
linkTitle: Vue Integration
copyright: (C) 2007-2022 GoodData Corporation
---

Vue supports Web Components out of the box. There are a few steps that you need to do to integrate the GoodData visualizations
into the Vue app using WebComponents.

## Load WebComponents library

Add a new `<script>` tag to your main HTML file (`index.html` in the project root folder).

```diff
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <link rel="icon" href="/favicon.ico">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vite App</title>
+       <script type="module" async src="{your-gd-server-url}/components/{workspace-id}.js?auth=sso"></script>
      </head>
      <body>
        <div id="app"></div>
        <script type="module" src="/src/main.js"></script>
      </body>
    </html>
```

See the [WebComponents introduction page](../). Make sure to go through the
[Prerequisites and limitations](../) section.

## Configure Custom Elements

We need to tell Vue which elements are implemented using WebComponents. Otherwise, Vue will try to find Vue components
by the tag name and will throw an error when not found.

Update your `vite.config.js` file:

```diff
    import { fileURLToPath, URL } from 'node:url'

    import { defineConfig } from 'vite'
    import vue from '@vitejs/plugin-vue'
    import vueJsx from '@vitejs/plugin-vue-jsx'

    // https://vitejs.dev/config/
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

## Embed visualizations

You can now use `gd-insight`, `gd-dashboard`, and `gd-ai-assistant` elements anywhere in your Vue template.
For example, in `src/App.vue` file.

```html
<template>
    <gd-insight insight="my-visualization-id" style="height:500px"></gd-insight>
    <gd-dashboard dashboard="my-dashboard-id"></gd-dashboard>
    <gd-ai-assistant></gd-ai-assistant>
</template>
```

You can copy the _visualization id_ and _dashboard id_ from the URL bar of your web browser,
from the Analyze and Dashboards pages respectively. At this point you should see an visualization and a dashboard rendering
on the screen.

We set the height of the `gd-insight` to a static value as it's expecting a flex layout and would collapse to a `0` height
otherwise.

## Define dashboardId and visualizationId dynamically

You can use attribute binding to define the IDs dynamically from the Vue component code.

```diff
    <script setup>
+     const visualizationId = 'my-visualization-id';
+     const dashboardId = 'my-dashboard-id'
+     const workspaceId = 'my-workspace-id';
    </script>

    <template>
-     <gd-insight insight="my-visualization-id" style="height:500px"></gd-insight>
-     <gd-dashboard dashboard="my-dashboard-id"></gd-dashboard>
+     <gd-insight :insight="visualizationId" style="height:500px"></gd-insight>
+     <gd-dashboard :dashboard="dashboardId"></gd-dashboard>
+     <gd-ai-assistant :workspace="workspaceId"></gd-ai-assistant>
    </template>
```

## Add event listeners

Both `gd-insight`, `gd-dashboard`, and `gd-ai-assistant` are dispatching custom events.

### Visualization event listener

In case of `gd-insight` you can use the Vue event binding syntax.

```diff
    <script setup>
      const insightId = 'my-visualization-id';
      const dashboardId = 'my-dashboard-id';
      const workspaceId = 'my-workspace-id';
+     const onInsightLoaded = e => console.log(e.detail);
    </script>

    <template>
-     <gd-insight :insight="visualizationId" style="height:500px"></gd-insight>
+     <gd-insight :insight="visualizationId" @insightLoaded="onInsightLoaded" style="height:500px"></gd-insight>
      <gd-dashboard :dashboard="dashboardId"></gd-dashboard>
      <gd-ai-assistant :workspace="workspaceId"></gd-ai-assistant>
    </template>
```

[Read more about visualization events](../).

### Dashboard event listener

The setup for `gd-dashboard` is more complicated, as our event names do not follow the Vue naming convention. You would
need to obtain a reference to the DOM object and add event listeners directly. Keep in mind that you
also need to remove the listeners on the component unmount.

```diff
    <script setup>
      import {onMounted, onUnmounted, ref} from "vue";

      const insightId = 'my-visualization-id';
      const dashboardId = 'my-dashboard-id';
      const workspaceId = 'my-workspace-id';
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
      <gd-insight :insight="visualizationId" @insightLoaded="onInsightLoaded" style="height:500px"></gd-insight>
-     <gd-dashboard :dashboard="dashboardId"></gd-dashboard>
+     <gd-dashboard :dashboard="dashboardId" ref="dashboard"></gd-dashboard>
      <gd-ai-assistant :workspace="workspaceId"></gd-ai-assistant>
    </template>
```

[Read more about Dashboard events]webcomponents_dashboard#supported-events.

### AI Assistant event listener

Similar to the dashboard, the `gd-ai-assistant` component requires direct DOM event listeners:

```diff
    <script setup>
      import {onMounted, onUnmounted, ref} from "vue";

      const insightId = 'my-visualization-id';
      const dashboardId = 'my-dashboard-id';
      const workspaceId = 'my-workspace-id';
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
      <gd-insight :insight="visualizationId" @insightLoaded="onInsightLoaded" style="height:500px"></gd-insight>
      <gd-dashboard :dashboard="dashboardId" ref="dashboard"></gd-dashboard>
+     <gd-ai-assistant :workspace="workspaceId" ref="aiChat"></gd-ai-assistant>
    </template>
```

[Read more about AI Assistant events](./ai_assistant_custom_element.md#supported-events).
