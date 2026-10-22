---
title: Integrations
linkTitle: "Integrations"
weight: 70
description: "Connect GoodData.UI to your application environment: authentication, embedding, theming, and framework support."
diataxis_type: reference
ai_generated_body: true
type: docs
section_overview: true
aliases:
  - "learn/integrate_and_authenticate/"
---

Guides for integrating GoodData.UI into your application: authentication and cross-origin access, embedding dashboards and visualizations, theming, interactivity, the context hooks, Web Components, and framework guides for Angular, Next.js, and Vue.

On a new project, start with [Integrate into an existing application](backend-setup/) and [Authenticate to the backend](authentication/); everything else builds on them. The other sections can be adopted independently as your application grows.

To show a saved dashboard in an existing page without installing any SDK code, [embed a dashboard in an iframe](https://www.gooddata.ai/docs/cloud/embed-visualizations/iframes/). It works in any framework, supports basic customization through URL query parameters, and talks to the host page over [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage).
