// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import { IAttributeElement, IAttributeFilter, newNegativeAttributeFilter } from "@gooddata/sdk-model";
import * as Md from "../../../md/full";

const staticElements: IAttributeElement[] = [
    {
        title: "Dallas",
        uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2208/elements?id=6340130",
    },
    {
        uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2208/elements?id=6340112",
        title: "New York",
    },
    {
        title: "San Jose",
        uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2208/elements?id=6340123",
    },
];

export const AttributeFilterWithStaticElements = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(newNegativeAttributeFilter(Md.LocationCity, []));

    return <AttributeFilter filter={filter} staticElements={staticElements} onApply={setFilter} />;
};

export default AttributeFilterWithStaticElements;
