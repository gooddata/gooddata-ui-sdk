// (C) 2007-2022 GoodData Corporation
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
// eslint-disable-next-line import/no-unassigned-import
import "./polyfills";
// new exports

export * from "./base";
export * from "./execution";
export * from "./kpi";

/**
 * Common interface uses to specify number separators for the different SDK components.
 * @public
 */
export { ISeparators } from "@gooddata/sdk-model";
