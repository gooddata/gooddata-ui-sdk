---
title: What's New in Version 9.0
sidebar_label: What's New in Version 9.0
copyright: (C) 2023 GoodData Corporation
id: whats_new_9
weight: 29
---

{{% alert color="warning" title="Version 9 vs Versions 10+" %}}
GoodData Platform users must stay on GoodData.UI version 9, do not update to version 10 or higher!
From version 10 onwards, the GoodData.UI SDK solely supports only GoodData Cloud and GoodData.CN.
{{% /alert %}}

Overall, GoodData.UI v9 does not bring too many breaking changes at the API level, but rather at the technology support level and the [migration](../migration_guide/) should be relatively simple in most cases.

## React 18

We are happy to announce that GoodData.UI now supports React 18. React 16 and 17 are still supported to allow for a smoother transition. We plan to drop support for React 16 and 17 in the next major SDK release. Note that there is required one additional step to run SDK 9 with React 18, [learn more in the migration guide](../migration_guide/).

## Accelerator Toolkit

We've developed a new tool, `@gooddata/app-toolkit`, for bootstrapping new applications, replacing the `@gooddata/create-gooddata-react-app`, which will no longer receive updates and is deprecated. The older tool was based on the [no longer recommended](https://github.com/facebook/create-react-app/issues/13072) `create-react-app`. The fresh `@gooddata/app-toolkit` is designed to bootstrap new applications using templates, allowing for potential future extensions. Its first release includes a lightweight template for React applications. This template, based on a streamlined webpack setup, doesn't constrain you, enabling customization to suit your needs. Try and explore it by running `npx @gooddata/app-toolkit@latest init` from your terminal.

## New Features and Components

We're thrilled to introduce also few new features arriving with GoodData.UI v9: AttributeFilter now comes with a single selection mode, we've added new chart types including [DependencyWheel](../../references/visual_components/dependency_wheel_chart/), [SankeyChart](../../references/visual_components/sankey_chart/), and [FunnelChart](../../references/visual_components/funnel_chart/). We've also expanded the options for totals and subtotals in PivotTable.

# Breaking Changes

## ECMAScript Modules

GoodData.UI is moving exclusively to [ECMAScript Modules](https://nodejs.org/api/esm.html) (ESM), discontinuing support for [CommonJS](https://nodejs.org/api/modules.html) builds. The use of ESM, enabling advanced features like [tree-shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking), enhances performance by eliminating unnecessary code. This move also simplifies maintenance, streamlining our build and release processes, which allows us to focus more on developing features and fixing bugs. Moreover, aligning with the wider JavaScript ecosystem's shift towards ESM helps secure our future compatibility with evolving tools and libraries.

## Browsers

GoodData.UI is ending support for Internet Explorer 11. This move enables us to accelerate our adoption of modern web technologies and deliver a more efficient, robust, and future-ready library. Thank you for evolving with us towards a modern and improved browsing experience.

## TypeScript

We're excited to announce that GoodData.UI is now compatible with TypeScript 5. We're also updating our support approach to incorporate the latest TypeScript minor versions between SDK minor version updates. This change is a response to TypeScript's practice of introducing breaking changes between minor versions. This strategy enables us to enhance the type-safety and integrate new TypeScript features with greater speed.

## Dashboard Plugins

Starting with GoodData.UI v9, we've initiated a lifecycle for dashboard plugins. It's important for developers to understand that support for dashboard plugins isn't indefinite. We encourage developers to update the SDK version in their dashboard plugins regularly. Due to our platform's continuous evolution and the direct incorporation of plugins, we can guarantee compatibility with only the latest 3 minor versions of GoodData.UI. Plugins created with v8 should transition to v9 by the end of this year, after which they'll lose support. Be aware that we're planning to improve the way dashboard plugins integrate into our platform, so anticipate changes in the near future.

## Catalog Export Changes

We changed some default values and parameter names, as well as the way `@gooddata/catalog-export` is configured. For more details, check its [documentation](../../learn/visualize_data/export_catalog/), or the [migration guide](../migration_guide/).

## Namespaces Removal

We've made structural changes in the `@gooddata/api-model-bear` and `@gooddata/sdk-embedding` packages by removing TypeScript namespaces. Despite the alterations, we've preserved the consistency of type and type guard names. Now, they're showcased in an uncluttered, flat export structure. To resolve any potential naming conflicts, certain types have been prefixed. These adjustments were necessary as these packages were the only ones in our library still utilizing namespaces. By bringing them in line with our other packages, we're boosting consistency, enhancing readability, and simplifying usage across the entirety of our library.

## Deprecated APIs Removal

In this major release, we took the opportunity to remove almost all deprecated APIs. Each of these deprecated APIs should have a TSDoc description of what you should replace them with, so this change should be pretty simple.
