// (C) 2007-2023 GoodData Corporation
/**
 * This package provides base functionality useful for building React visualizations on top of GoodData.
 *
 * @remarks
 * The functionality includes functions for getting data from the Analytical Backend,
 * components and React hooks that serve as building blocks for custom visualizations,
 * visualization definition placeholders, support for drilling, and so on.
 *
 * See the other `@gooddata/sdk-ui-*` packages (for example, `@gooddata/sdk-ui-charts`) for pre-built visualizations
 * that you can use instead of building your own.
 *
 * @packageDocumentation
 */

// new exports

export * from "./base/index.js";
export * from "./execution/index.js";
export * from "./kpi/index.js";

/**
 * Common interface uses to specify number separators for the different SDK components.
 * @public
 */
export { ISeparators } from "@gooddata/sdk-model";
