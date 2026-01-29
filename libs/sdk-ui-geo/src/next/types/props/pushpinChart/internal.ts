// (C) 2025-2026 GoodData Corporation

/**
 * Internal props for GeoPushpinChart
 *
 * @remarks
 * This module contains internal types used by the GeoPushpinChart implementation.
 * These types are **not part of the public API** and may change without notice.
 *
 * **Why are these internal?**
 * - `ICoreGeoPushpinChartProps` uses the `IDataVisualizationProps` pattern with
 *   pre-built executions. The latitude/longitude attributes are not included because
 *   they are resolved from the execution context (not passed as props).
 *
 * **When might you need these?**
 * - Building custom wrappers around the core pushpin chart
 * - Testing internal components
 *
 * **Public alternatives:**
 * - Use {@link IGeoPushpinChartProps} from `./public.js` for component props
 * - Use {@link IGeoPushpinChartBaseProps} for props without required latitude/longitude
 *
 * @packageDocumentation
 * @internal
 */

import { type IDataVisualizationProps } from "@gooddata/sdk-ui";

import { type IGeoPushpinChartBaseProps } from "./public.js";

/**
 * Internal props for GeoPushpinChart component.
 *
 * @remarks
 * This type extends `IDataVisualizationProps` to provide the `execution` and
 * `executions` props pattern used by GoodData.UI visualization internals.
 *
 * Unlike the public `IGeoPushpinChartProps`, this interface does not include
 * the latitude and longitude attributes. In the internal/pluggable vis context,
 * these are resolved from the execution context rather than passed as props.
 *
 * Use {@link IGeoPushpinChartProps} for the public-facing props interface.
 *
 * @internal
 */
export interface ICoreGeoPushpinChartProps extends IGeoPushpinChartBaseProps, IDataVisualizationProps {}
