// (C) 2019-2020 GoodData Corporation
import identity from "lodash/identity";
import { ObjRef } from "../../../objRef";
import { BuilderModifications, builderFactory } from "../../../base/builder";
import { MetadataObjectBuilder } from "../factory";
import { IVariableMetadataObject } from ".";

/**
 * Variable metadata object builder
 * See {@link Builder}
 *
 * @public
 */
export class VariableMetadataObjectBuilder<
    T extends IVariableMetadataObject = IVariableMetadataObject
> extends MetadataObjectBuilder<T> {}

/**
 * Variable metadata object factory
 *
 * @param ref - variable reference
 * @param modifications - variable builder modifications to perform
 * @returns created variable metadata object
 * @public
 */
export const newVariableMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<VariableMetadataObjectBuilder> = identity,
): IVariableMetadataObject =>
    builderFactory(VariableMetadataObjectBuilder, { type: "variable", ref }, modifications);
