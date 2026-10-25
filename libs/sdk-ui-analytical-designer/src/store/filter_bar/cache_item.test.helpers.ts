// (C) 2019-2026 GoodData Corporation

import { type ICacheItem } from "../../typings/state_objects.js";

export function buildCacheItemMock(props: Partial<ICacheItem>): ICacheItem {
    return {
        title: "Attribute",
        ref: {
            identifier: "attr.id",
        },
        identifier: "attr.id",
        uri: "/gdc/md/projectId/obj/1",
        type: "attribute",
        ...props,
    };
}
