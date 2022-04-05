// (C) 2021-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Defines properties that are used for filterable widgets. Filterable widgets allow users to specify:
 *
 * -  Date data set that should be used for date-filtering the data for the widget
 * -  An ignore-list containing references to dashboard attribute filters that should be ignored by
 *    the widget.
 * @deprecated Use {@link @gooddata/sdk-model#IFilterableWidget}
 * @alpha
 */
export interface IFilterableWidget extends m.IFilterableWidget {}

/**
 * Defines properties that are used for drillable widgets. Such widgets allow user clicking on
 * different parts of the widget and through this interaction navigate to other insights or dashboards.
 * @deprecated Use {@link @gooddata/sdk-model#IDrillableWidget}
 * @alpha
 */
export interface IDrillableWidget extends m.IDrillableWidget {}

/**
 * Defines properties that are used to store widget's descriptive metadata.
 * @deprecated Use {@link @gooddata/sdk-model#IWidgetDescription}
 * @alpha
 */
export interface IWidgetDescription extends m.IWidgetDescription {}

/**
 * Base type for dashboard widgets.
 * @deprecated Use {@link @gooddata/sdk-model#IBaseWidget}
 * @alpha
 */
export interface IBaseWidget extends m.IBaseWidget {}

/**
 * List of built-in widget types. These type names are reserved and must not be used by custom widgets.
 * @deprecated Use {@link @gooddata/sdk-model#BuiltInWidgetTypes}
 * @alpha
 */
export const BuiltInWidgetTypes: string[] = m.BuiltInWidgetTypes;
