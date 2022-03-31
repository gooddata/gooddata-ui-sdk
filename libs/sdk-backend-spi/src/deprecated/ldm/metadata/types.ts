// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * @deprecated Use {@link @gooddata/sdk-model#IMetadataObjectIdentity}
 * @internal
 */
export interface IMetadataObjectIdentity extends m.IMetadataObjectIdentity {}

/**
 * @deprecated Use {@link @gooddata/sdk-model#IMetadataObjectBase}
 * @internal
 */
export interface IMetadataObjectBase extends m.IMetadataObjectBase {}

/**
 * @deprecated Use {@link @gooddata/sdk-model#IMetadataObject}
 * @public
 */
export interface IMetadataObject extends m.IMetadataObject {}

/**
 * Type guard checking whether input is an instance of {@link IMetadataObject}.
 * @deprecated Use {@link @gooddata/sdk-model#isMetadataObject}
 * @public
 */
export const isMetadataObject = m.isMetadataObject;
