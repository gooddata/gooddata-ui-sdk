---
title: "Compatibility"
linkTitle: "Compatibility"
weight: 15
aliases:
    - "../../architecture/architecture_overview/supported_versions"
---

This article contains information on whether your development setup is compatible with using GD.UI and if so, what version.

## Supported JavaScript Technologies

We develop GoodData.UI with the following javascript libraries in mind:

-   React >=16.8.0
-   TypeScript >= 5.0.2
-   Node ^16.20.0 LTS

## Supported Web Browsers

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

### Mobile Web Browsers

You can view dashboards through the following mobile browser:

Android 5 and newer

-   Google Chrome (latest stable version)

iOS 10 and newer

-   Google Chrome (latest stable version)
-   Safari (latest stable version)

Dashboard viewing only. Other functions of GoodData are not currently supported. Some functions may work now but have not been thoroughly tested yet.

## Supported Versions

Different versions of GoodData.UI go through the life cycle phases and they recieve a different level of support depending on what stage of their life cycle they're in.

As a general recommendation, we encourage you to always use the latest available version of GoodData.UI to make the user experience with integrating GoodData.UI as smooth and secure as possible and to ensure that GoodData.UI always uses the latest features of GoodData.

### Life cycle phases

Each version of GoodData.UI goes through the following phases:

1. **General Availability** (GA)

    - **When it starts:** When a major version is publicly released. To get notified about a new version, subscribe to the [Release Notes](https://support.gooddata.com/hc/en-us/sections/203564877).
    - **What it means:** A version in GA is going through active development, receives all new features and bug fixes, which are applied on top of the last minor version.

2. **End-of-Development** (EOD)

    - **When it starts:** When a newer major version is publicly released.
    - **What it means:** A version in EOD receives only security fixes (unless they can be resolved by a SemVer-compatible upgrade) and fixes for critical issues. Only production dependencies receive the security fixes. These fixes are applied on top of the last minor version. No new features are added.

3. **End-of-Support** (EOS)
    - **When it starts:** The date is defined by GoodData.
    - **What it means:** A version in EOS receives neither new features nor bug fixes. No technical support is provided. Although the version is still available on NPM, we do not recommend that you use it.

### GoodData Cloud & GoodData.CN

The GoodData.UI is versioned and usually released in tandem with GoodData Cloud.

We strongly recommend you always work with the newest version of GoodData.UI, and newest GoodData.CN, if you are using this self-deployed version of GoodData.

The following table provides the lifecycle phases of GoodData.UI versions:

| Major Version | Status              | GA              | EOD               | EOS               |
| :------------ | :------------------ | :-------------- | :---------------- | :---------------- |
| 10            | Generally available | April 18, 2023  | _Not yet defined_ | _Not yet defined_ |
| 9             | End-of-Development  | July 27, 2023   | October 18, 2023  | _Not yet defined_ |
| 8             | End-of-Support      | October 8, 2020 | July 27, 2023     | October 18, 2023  |
| 7             | End-of-Support      | May 21, 2019    | October 8, 2020   | March 31, 2022    |

### GoodData Platform

GoodData Platform users must stay on GoodData.UI version 9, do not update to version 10 or higher. From version 10 onwards, the GoodData.UI SDK only supports GoodData Cloud and GoodData.CN.

| Major Version | Status              | GA              | EOD               | EOS               |
| :------------ | :------------------ | :-------------- | :---------------- | :---------------- |
| 9             | Generally available | July 27, 2023   | _Not yet defined_ | _Not yet defined_ |
| 8             | End-of-Support      | October 8, 2020 | July 27, 2023     | October 18, 2023  |
| 7             | End-of-Support      | May 21, 2019    | October 8, 2020   | March 31, 2022    |
