---
title: Platform compatibility
description: Which GoodData.UI major works with GoodData Cloud, GoodData.CN, and
  GoodData Legacy, the Node.js, React, and TypeScript versions it needs, and
  which frameworks it supports.
category: Getting Started
diataxis_type: reference
related_pages:
  - /docs/integrations/platform/compatibility
  - /docs/integrations/platform/esm-only
  - /docs/integrations/platform/supported-frameworks
  - /docs/integrations/platform/api-maturity
  - /docs/getting-started/installation
type: docs
weight: 3
section: Getting Started
---

Use this page to confirm that your GoodData platform, your toolchain, and your frontend framework all work with the GoodData.UI version you are about to install.

## GoodData platform

| GoodData.UI | GoodData Cloud | GoodData.CN | GoodData Legacy |
| :---------- | :------------- | :---------- | :-------------- |
| **11**      | Yes            | Yes         | No              |
| **10**      | Yes            | Yes         | No              |
| **9**       | Yes            | Yes         | Yes             |

Version 11 is the current major and the one this documentation describes. Version 10 reached end of support on March 26, 2026, and no longer receives fixes.

{{% alert color="warning" title="GoodData Legacy" %}}
GoodData Legacy (the deprecated GoodData Platform) is supported only by GoodData.UI version 9. Stay on version 9 and do not upgrade to version 10 or higher. From version 10 onwards, GoodData.UI supports only GoodData Cloud and GoodData.CN.
{{% /alert %}}

## Toolchain

| Technology     | Requirement                               |
| :------------- | :---------------------------------------- |
| **Node.js**    | `>=24.12.0` (an LTS release is recommended) |
| **React**      | 18 or 19                                  |
| **TypeScript** | 5.8.3 or newer                            |
| **Bundler**    | Resolves ES modules and the `exports` field: Vite, webpack 5, Rollup, esbuild, Parcel 2, or Next.js |

With `skipLibCheck` turned off, TypeScript older than 5.8.3 reports errors in the package typings.

Every `@gooddata` package is published as [ES modules only](../../integrations/platform/esm-only/). There is no CommonJS build, so TypeScript needs `moduleResolution` set to `NodeNext` or `Bundler`, and Jest needs its ESM mode. The project that `@gooddata/app-toolkit` scaffolds is already configured this way.

## Frameworks

GoodData.UI directly supports React, which is what the SDK is written for, and Web Components. The `gd-dashboard-embed`, `gd-insight-embed`, and `gd-ai-assistant` custom elements load from your GoodData server with one `<script>` tag. They run GoodData.UI under the hood in an isolated scope, so they work in any framework or in plain HTML. See the [Web Components overview](../../integrations/web-components/web-components-overview/).

Other frameworks go through one of those two. Each has a guide:

| Framework | Guide |
| :-------- | :---- |
| Angular   | [Web Components](../../integrations/framework-integrations/angular-integration/) or [hosting React components](../../integrations/framework-integrations/angular-react-integration/) |
| Vue       | [Vue integration](../../integrations/framework-integrations/vue-integration/) |
| Next.js   | [Next.js integration](../../integrations/framework-integrations/nextjs-integration/) |
| SvelteKit | [Blog post](https://www.gooddata.ai/blog/frontend-integration-series-sveltekit/) from the frontend integration series |

If you have no framework at all, [embed a dashboard in an iframe](https://www.gooddata.ai/docs/cloud/embed-visualizations/iframes/) and talk to it over [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage). You install nothing.

## Upgrading to version 11

Upgrade every `@gooddata/*` dependency in `package.json` to the same latest stable version, and make sure the app runs on React 18 or 19.

Coming from version 10, you can delete the `provideCreateRoot` call that React 18 used to need. It is still exported from `@gooddata/sdk-ui-ext` as a deprecated no-op, so leaving it in place also works. Coming from version 9, also remove `@gooddata/sdk-backend-bear`. It connected to GoodData Legacy, which versions 10 and 11 don't support.

## Version lifecycle

Each major moves through General Availability, End-of-Development, and End-of-Support. The dates for every major, and what each phase means for fixes and support, are in [Version lifecycle and compatibility](../../integrations/platform/compatibility/).
