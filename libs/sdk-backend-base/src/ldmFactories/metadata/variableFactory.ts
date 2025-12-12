// (C) 2019-2025 GoodData Corporation

import { type IVariableMetadataObject, type ObjRef } from "@gooddata/sdk-model";

import { MetadataObjectBuilder } from "./factory.js";
import { type BuilderModifications, builderFactory } from "../builder.js";

/**
 * Variable metadata object builder
 * See {@link Builder}
 *
 * @beta
 */
export class VariableMetadataObjectBuilder<
    T extends IVariableMetadataObject = IVariableMetadataObject,
> extends MetadataObjectBuilder<T> {}

/**
 * Variable metadata object factory
 *
 * @param ref - variable reference
 * @param modifications - variable builder modifications to perform
 * @returns created variable metadata object
 * @beta
 */
export const newVariableMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<VariableMetadataObjectBuilder> = (v) => v,
): IVariableMetadataObject =>
    builderFactory(VariableMetadataObjectBuilder, { type: "variable", ref }, modifications);
