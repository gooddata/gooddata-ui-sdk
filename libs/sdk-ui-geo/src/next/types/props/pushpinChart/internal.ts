// (C) 2025 GoodData Corporation

/**
 * Internal Props for GeoPushpinChartNext
 *
 * @remarks
 * This module contains internal types used by the GeoPushpinChartNext implementation.
 * These types are **not part of the public API** and may change without notice.
 *
 * **Why are these internal?**
 * - `ICoreGeoPushpinChartNextProps` uses the `IDataVisualizationProps` pattern with
 *   pre-built executions. The latitude/longitude attributes are not included because
 *   they are resolved from the execution context (not passed as props).
 *
 * **When might you need these?**
 * - Building custom wrappers around the core pushpin chart
 * - Testing internal components
 *
 * **Public alternatives:**
 * - Use {@link IGeoPushpinChartNextProps} from `./public.js` for component props
 * - Use {@link IGeoPushpinChartNextBaseProps} for props without required latitude/longitude
 *
 * @packageDocumentation
 * @internal
 */

import { IDataVisualizationProps } from "@gooddata/sdk-ui";

import { IGeoPushpinChartNextBaseProps } from "./public.js";

/**
 * Internal props for GeoPushpinChartNext component.
 *
 * @remarks
 * This type extends `IDataVisualizationProps` to provide the `execution` and
 * `executions` props pattern used by GoodData.UI visualization internals.
 *
 * Unlike the public `IGeoPushpinChartNextProps`, this interface does not include
 * the latitude and longitude attributes. In the internal/pluggable vis context,
 * these are resolved from the execution context rather than passed as props.
 *
 * Use {@link IGeoPushpinChartNextProps} for the public-facing props interface.
 *
 * @internal
 */
export interface ICoreGeoPushpinChartNextProps
    extends IGeoPushpinChartNextBaseProps,
        IDataVisualizationProps {}
