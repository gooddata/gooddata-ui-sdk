// (C) 2020-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * A scheduled email common properties
 * @deprecated Use {@link @gooddata/sdk-model#IScheduledMailBase}
 * @alpha
 */
export interface IScheduledMailBase extends m.IScheduledMailBase {}

/**
 * A scheduled email is used to notify a user with an exported dashboard according to a specified time interval
 * @deprecated Use {@link @gooddata/sdk-model#IScheduledMailDefinition}
 * @alpha
 */
export interface IScheduledMailDefinition extends m.IScheduledMailDefinition {}

/**
 * Supported email attachments
 * @deprecated Use {@link @gooddata/sdk-model#ScheduledMailAttachment}
 * @alpha
 */
export type ScheduledMailAttachment = m.ScheduledMailAttachment;

/**
 * Email attachment - dashboard exported as pdf
 * Optionally, you can setup specific filter context to use for the dashboard export
 * @deprecated Use {@link @gooddata/sdk-model#IDashboardAttachment}
 * @alpha
 */
export interface IDashboardAttachment extends m.IDashboardAttachment {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardAttachment}.
 *
 * @deprecated Use {@link @gooddata/sdk-model#isDashboardAttachment}
 * @alpha
 */

export const isDashboardAttachment = m.isDashboardAttachment;

/**
 * Email attachment - widget exported as csv or/and xlsx
 * Optionally, you can setup specific filter context to use for the widget export
 * @deprecated Use {@link @gooddata/sdk-model#IWidgetAttachment}
 * @alpha
 */
export interface IWidgetAttachment extends m.IWidgetAttachment {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IWidgetAttachment}.
 *
 * @deprecated Use {@link @gooddata/sdk-model#isWidgetAttachment}
 * @alpha
 */

export const isWidgetAttachment = m.isWidgetAttachment;

/**
 * Configuration of the exported file
 * @deprecated Use {@link @gooddata/sdk-model#IExportOptions}
 * @alpha
 */
export interface IExportOptions extends m.IExportOptions {}

/**
 * A scheduled email is used to notify a user with an exported dashboard according to a specified time interval
 * @deprecated Use {@link @gooddata/sdk-model#IScheduledMail}
 * @alpha
 */
export interface IScheduledMail extends m.IScheduledMail {}
