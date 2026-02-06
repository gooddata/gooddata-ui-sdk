// (C) 2019-2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files */

/**
 * This is an all-in-one package that has all GoodData.UI packages as dependencies and re-exports their public API.
 *
 * @remarks
 * The primary purpose of this package is to simplify migration from previous versions of GoodData.UI
 * that were all delivered in a single `@gooddata/react-components` package.
 *
 * @packageDocumentation
 */

/* eslint-disable no-duplicate-imports,no-restricted-syntax */

export * from "@gooddata/sdk-model";
export type { IExportResult as IExportResultModel } from "@gooddata/sdk-model";
export * from "@gooddata/sdk-backend-spi";
export type { IExportResult } from "@gooddata/sdk-model";
export * from "@gooddata/sdk-ui";
export * from "@gooddata/sdk-ui-charts";
export * from "@gooddata/sdk-ui-geo";
export * from "@gooddata/sdk-ui-pivot";
export * from "@gooddata/sdk-ui-filters";
export * from "@gooddata/sdk-ui-ext";
