---
legacy_path: architecture/architecture_overview/compatibility
title: Version compatibility
description: Check the lifecycle phase and support dates of each GoodData.UI major version for GoodData Cloud, GoodData.CN, and GoodData Legacy.
category: Integrations / Platform
diataxis_type: reference
related_pages:
  - /docs/getting-started/platform-compatibility
  - /docs/integrations/platform/supported-frameworks
  - /docs/integrations/platform/api-maturity
  - /docs/integrations/platform/esm-only
ai_generated_description: true
type: docs
weight: 101
section: Integrations
subsection: Platform
aliases:
  - "../../architecture/architecture_overview/compatibility/"
---

Each GoodData.UI major version goes through lifecycle phases, and the phase decides which fixes and support the version gets. This page lists the phases and the dates for every major, separately for GoodData Cloud and GoodData.CN, and for GoodData Legacy.

For the Node.js, React, TypeScript, and bundler versions that GoodData.UI needs, see [Platform compatibility](../../../getting-started/platform-compatibility/).

Use the latest version of GoodData.UI to get the newest features and security fixes.

## Lifecycle phases

Each version of GoodData.UI goes through the following phases:

1. **General Availability** (GA)
    - **When it starts:** When a major version is publicly released. To get notified about a new version, watch the [GoodData.UI releases on GitHub](https://github.com/gooddata/gooddata-ui-sdk/releases).
    - **What it means:** A version in GA is in active development and receives all new features and bug fixes, which are applied on top of the last minor version.

2. **End-of-Development** (EOD)
    - **When it starts:** When a newer major version is publicly released.
    - **What it means:** A version in EOD receives only security fixes (unless they can be resolved by a SemVer-compatible upgrade) and fixes for critical issues. Only production dependencies receive the security fixes. These fixes are applied on top of the last minor version. No new features are added.

3. **End-of-Support** (EOS)
    - **When it starts:** The date is defined by GoodData.
    - **What it means:** A version in EOS receives neither new features nor bug fixes, and no technical support is provided. The version is still available on npm, but don't use it.

## GoodData Cloud and GoodData.CN

GoodData.UI is versioned and usually released together with GoodData Cloud. If you run GoodData.CN, keep both GoodData.UI and GoodData.CN on their newest versions.

| Major version | Status              | GA                 | EOD                | EOS                |
| :------------ | :------------------ | :----------------- | :----------------- | :----------------- |
| 11            | Generally available | September 22, 2025 | _Not yet defined_  | _Not yet defined_  |
| 10            | End-of-Support      | April 18, 2024     | September 22, 2025 | March 26, 2026     |
| 9             | End-of-Support      | July 27, 2023      | October 18, 2024   | September 22, 2025 |
| 8             | End-of-Support      | October 8, 2020    | July 27, 2023      | October 18, 2024   |
| 7             | End-of-Support      | May 21, 2019       | October 8, 2020    | March 31, 2022     |

## GoodData Legacy

GoodData Legacy (the deprecated GoodData Platform) is supported only by GoodData.UI version 9. Stay on version 9 and don't upgrade to version 10 or higher. From version 10 onwards, GoodData.UI supports only GoodData Cloud and GoodData.CN.

| Major version | Status              | GA              | EOD               | EOS               |
| :------------ | :------------------ | :-------------- | :---------------- | :---------------- |
| 9             | Generally available | July 27, 2023   | _Not yet defined_ | _Not yet defined_ |
| 8             | End-of-Support      | October 8, 2020 | July 27, 2023     | October 18, 2024  |
| 7             | End-of-Support      | May 21, 2019    | October 8, 2020   | March 31, 2022    |
