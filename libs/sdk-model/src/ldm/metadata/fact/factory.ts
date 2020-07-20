// (C) 2019-2020 GoodData Corporation
import identity from "lodash/identity";
import { ObjRef } from "../../../objRef";
import { BuilderModifications, builderFactory } from "../../../base/builder";
import { MetadataObjectBuilder } from "../factory";
import { IFactMetadataObject } from ".";

/**
 * Fact metadata object builder
 * See {@link Builder}
 *
 * @public
 */
export class FactMetadataObjectBuilder<
    T extends IFactMetadataObject = IFactMetadataObject
> extends MetadataObjectBuilder<T> {}

/**
 * Fact metadata object factory
 *
 * @param ref - fact reference
 * @param modifications - fact builder modifications to perform
 * @returns created fact metadata object
 * @public
 */
export const newFactMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<FactMetadataObjectBuilder> = identity,
): IFactMetadataObject => builderFactory(FactMetadataObjectBuilder, { type: "fact", ref }, modifications);
