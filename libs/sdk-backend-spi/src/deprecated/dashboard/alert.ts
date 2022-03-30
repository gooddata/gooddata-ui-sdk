// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Common widget alert properties
 * @deprecated Use {@link @gooddata/sdk-model#IWidgetAlertBase}
 * @alpha
 */
export interface IWidgetAlertBase extends m.IWidgetAlertBase {}

/**
 * With widget alert, user can be notified to his email according to provided rules
 * (e.g. when some measure exceeds/drops below the set value)
 * @deprecated Use {@link @gooddata/sdk-model#IWidgetAlertDefinition}
 * @alpha
 */
export interface IWidgetAlertDefinition extends m.IWidgetAlertDefinition {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IWidgetAlertDefinition}.
 * @deprecated Use {@link @gooddata/sdk-model#isWidgetAlertDefinition}
 * @alpha
 */
export const isWidgetAlertDefinition = m.isWidgetAlertDefinition;

/**
 * See {@link IWidgetAlertDefinition}
 * @deprecated Use {@link @gooddata/sdk-model#IWidgetAlert}
 * @alpha
 */
export interface IWidgetAlert extends m.IWidgetAlert {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IWidgetAlert}.
 * @deprecated Use {@link @gooddata/sdk-model#isWidgetAlert}
 * @alpha
 */
export const isWidgetAlert = m.isWidgetAlert;
