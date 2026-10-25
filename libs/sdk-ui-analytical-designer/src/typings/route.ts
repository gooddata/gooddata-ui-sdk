// (C) 2019-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

export interface ITagsConfiguration {
    includeObjectsWithTags?: ObjRef[];
    excludeObjectsWithTags?: ObjRef[];
}
