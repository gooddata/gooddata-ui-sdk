---
title: "Compatibility"
linkTitle: "Compatibility"
weight: 15
---

{{% alert color="warning" title="Version 9 vs Versions 10+" %}}
GoodData Platform users must stay on GoodData.UI version 9, do not update to version 10 or higher!
From version 10 onwards, the GoodData.UI SDK solely supports only GoodData Cloud and GoodData.CN.
{{% /alert %}}

This article should inform the developers, whether their setup is compatible with using GD.UI and if so, what version.

## Compatible Technologies:

-   React >=16.8.0
-   [Angular 9+](../../supported_frameworks/angular/)
-   TypeScript >= 5.0.2
-   Node ^16.20.0 LTS

### Officially supported browsers

GoodData is tested against and supports the following desktop browsers:

-   Microsoft Windows 10 and newer
-   Google Chrome (latest stable version)
-   Firefox (latest stable version)
-   Microsoft Edge (latest stable version; Chromium-based only)

MacOS 10.12 and newer

-   Google Chrome (latest stable version)
-   Safari (latest stable version)

For best results, use the latest version of Google Chrome.

{{% alert color="warning" title="Server-side rendering" %}}
Server-side rendering is not supported.
{{% /alert %}}

### Mobile Web Browser

You can view dashboards through the following mobile browser:

Android 5 and newer

-   Google Chrome (latest stable version)

iOS 10 and newer

-   Google Chrome (latest stable version)
-   Safari (latest stable version)

Dashboard viewing only. Other functions of GoodData are not currently supported. Some functions may work now but have not been thoroughly tested yet.

## Compatibility with GoodData Cloud and GoodData.CN

The GoodData.UI is versioned and usually released in tandem with GoodData Cloud.

We strongly recommend you always work with the newest GoodData.UI and newest GoodData.CN.

## Status of GoodData.UI versions

The following table provides the lifecycle phases of GoodData.UI versions:

| Major Version | Status              | GA              | EOD               | EOS               | Last Minor Version |
| :------------ | :------------------ | :-------------- | :---------------- | :---------------- | :----------------- |
| 9             | Generally available | July 27, 2023   | _Not yet defined_ | _Not yet defined_ | 9.1                |
| 8             | Generally available | October 8, 2020 | July 27, 2023     | _Not yet defined_ | 8.12               |
| 7             | End-of-Support      | May 21, 2019    | October 8, 2020   | March 31, 2022    | 7.9                |

## Migration from v8 to v9

Since there are not many changes at the API level between v8 and v9, we believe that read [what is new in version 9](../../whats_new/) should be sufficient to process the migration.
