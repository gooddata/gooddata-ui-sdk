// (C) 2019-2025 GoodData Corporation
import identity from "lodash/identity.js";

import { IDashboardMetadataObject, ObjRef } from "@gooddata/sdk-model";

import { MetadataObjectBuilder } from "./factory.js";
import { BuilderModifications, builderFactory } from "../builder.js";

/**
 * Dashboard metadata object builder
 * See {@link Builder}
 *
 * @beta
 */
export class DashboardMetadataObjectBuilder<
    T extends IDashboardMetadataObject = IDashboardMetadataObject,
> extends MetadataObjectBuilder<T> {}

/**
 * Dashboard metadata object factory
 *
 * @param ref - dashboard reference
 * @param modifications - dashboard builder modifications to perform
 * @returns created dashboard metadata object
 * @beta
 */
export const newDashboardMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<DashboardMetadataObjectBuilder> = identity,
): IDashboardMetadataObject =>
    builderFactory(DashboardMetadataObjectBuilder, { type: "analyticalDashboard", ref }, modifications);
