// (C) 2025 GoodData Corporation

/**
 * Internal Props for GeoAreaChart
 *
 * @remarks
 * This module contains internal types used by the GeoAreaChart implementation.
 * These types are **not part of the public API** and may change without notice.
 *
 * **Why are these internal?**
 * - `ICoreGeoAreaChartProps` uses the `IDataVisualizationProps` pattern with
 *   pre-built executions. The area attribute is not included because it is
 *   resolved from the execution context (not passed as a prop).
 *
 * **When might you need these?**
 * - Building custom wrappers around the core area chart
 * - Testing internal components
 *
 * **Public alternatives:**
 * - Use {@link IGeoAreaChartProps} from `./public.js` for component props
 * - Use {@link IGeoAreaChartBaseProps} for props without required area
 *
 * @packageDocumentation
 * @internal
 */

import { IDataVisualizationProps } from "@gooddata/sdk-ui";

import { IGeoAreaChartBaseProps } from "./public.js";

/**
 * Internal props for GeoAreaChart component.
 *
 * @remarks
 * This type extends `IDataVisualizationProps` to provide the `execution` and
 * `executions` props pattern used by GoodData.UI visualization internals.
 *
 * Unlike the public `IGeoAreaChartProps`, this interface does not include
 * the area attribute. In the internal/pluggable vis context, the area is
 * resolved from the execution context rather than passed as a prop.
 *
 * Use {@link IGeoAreaChartProps} for the public-facing props interface.
 *
 * @internal
 */
export interface ICoreGeoAreaChartProps extends IGeoAreaChartBaseProps, IDataVisualizationProps {}
