// (C) 2007-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { type Granularity } from "../models/granularity.js";

import { type ICacheItemDisplayForm } from "./state_objects.js";

export interface IDateDatasetAttribute {
    ref: ObjRef;
    dateType: Granularity;
    dfIdentifier: string;
    dfUri: string;
    dfRef: ObjRef;
    granularity: string;
    uri: string;
    title?: string;
    displayForms: ICacheItemDisplayForm[];
}
