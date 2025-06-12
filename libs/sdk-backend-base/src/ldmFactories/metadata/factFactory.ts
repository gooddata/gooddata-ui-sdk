// (C) 2019-2022 GoodData Corporation
import identity from "lodash/identity.js";
import { ObjRef, IFactMetadataObject } from "@gooddata/sdk-model";
import { MetadataObjectBuilder } from "./factory.js";
import { builderFactory, BuilderModifications } from "../builder.js";

/**
 * Fact metadata object builder
 * See {@link Builder}
 *
 * @beta
 */
export class FactMetadataObjectBuilder<
    T extends IFactMetadataObject = IFactMetadataObject,
> extends MetadataObjectBuilder<T> {}

/**
 * Fact metadata object factory
 *
 * @param ref - fact reference
 * @param modifications - fact builder modifications to perform
 * @returns created fact metadata object
 * @beta
 */
export const newFactMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<FactMetadataObjectBuilder> = identity,
): IFactMetadataObject => builderFactory(FactMetadataObjectBuilder, { type: "fact", ref }, modifications);
