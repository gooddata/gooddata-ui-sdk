// (C) 2020-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Settings are obtained from backend and are effectively a collection of feature flags or settings with
 * concrete string or numeric value.
 *
 * @remarks
 * Settings are stored and configured on the server and typically allow
 * for a more fine-grained tuning of otherwise unified behavior.
 *
 * @deprecated Use {@link @gooddata/sdk-model#ISettings}
 * @public
 */
export interface ISettings extends m.ISettings {}

/**
 * Indicates current platform edition.
 *
 * @deprecated Use {@link @gooddata/sdk-model#PlatformEdition}
 * @public
 */
export type PlatformEdition = m.PlatformEdition;

/**
 * Settings for regional number formatting
 *
 * @deprecated Use {@link @gooddata/sdk-model#ISeparators}
 * @public
 */
export interface ISeparators extends m.ISeparators {}
