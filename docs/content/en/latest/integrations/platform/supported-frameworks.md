---
legacy_path: architecture/supported_frameworks
title: Supported frameworks
category: Integrations / Platform
diataxis_type: reference
related_pages:
  - /docs/integrations/framework-integrations/angular-integration
  - /docs/integrations/framework-integrations/nextjs-integration
  - /docs/integrations/framework-integrations/vue-integration
  - /docs/integrations/web-components/web-components-overview
  - /docs/integrations/platform/compatibility
description: Review officially supported frameworks (React, Web Components) plus Angular, Next.js, and Vue guides, with an external reference for SvelteKit.
ai_generated_description: true
type: docs
weight: 103
section: Integrations
subsection: Platform
aliases:
  - "../../architecture/supported_frameworks/"
---

GoodData.UI directly supports [React](../../../getting-started/quickstart/), which the SDK is written for, and [Web Components](../../web-components/).

GoodData.UI also works in other JavaScript and TypeScript applications. Your toolchain has to resolve [ES modules](../esm-only/), and a non-React framework hosts GoodData.UI either through the Web Components or by rendering the React components itself. The [framework guides](../../framework-integrations/) cover these frameworks:

- Angular: [Web Components guide](../../framework-integrations/angular-integration/) or [React components guide](../../framework-integrations/angular-react-integration/)
- Next.js: [Next.js guide](../../framework-integrations/nextjs-integration/)
- Vue: [Vue guide](../../framework-integrations/vue-integration/)
- SvelteKit: [frontend integration series blog post](https://www.gooddata.ai/blog/frontend-integration-series-sveltekit/)
