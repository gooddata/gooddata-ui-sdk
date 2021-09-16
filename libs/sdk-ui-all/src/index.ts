// (C) 2019-2021 GoodData Corporation
/**
 * This is an all-in-one package that has all GoodData.UI packages as dependencies and re-exports their public API.
 *
 * @remarks
 * The primary purpose of this package is to simplify migration from previous versions of GoodData.UI
 * that were all delivered in a single `@gooddata/react-components` package.
 *
 * @packageDocumentation
 */
export * from "@gooddata/sdk-model";
export * from "@gooddata/sdk-backend-spi";
export * from "@gooddata/sdk-ui";
export * from "@gooddata/sdk-ui-charts";
export * from "@gooddata/sdk-ui-geo";
export * from "@gooddata/sdk-ui-pivot";
export * from "@gooddata/sdk-ui-filters";
export * from "@gooddata/sdk-ui-ext";

// override IUser, userFullName that are both in model and SPI so that the model version is used
import { IUser, userFullName } from "@gooddata/sdk-model";
export { IUser, userFullName };
