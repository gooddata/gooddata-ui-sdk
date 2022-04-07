// (C) 2019-2022 GoodData Corporation
import identity from "lodash/identity";
import { ObjRef, IVariableMetadataObject } from "@gooddata/sdk-model";
import { MetadataObjectBuilder } from "./factory";
import { builderFactory, BuilderModifications } from "../builder";

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
    modifications: BuilderModifications<VariableMetadataObjectBuilder> = identity,
): IVariableMetadataObject =>
    builderFactory(VariableMetadataObjectBuilder, { type: "variable", ref }, modifications);
