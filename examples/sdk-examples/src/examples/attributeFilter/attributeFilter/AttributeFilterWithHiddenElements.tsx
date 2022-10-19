// (C) 2007-2022 GoodData Corporation
import React, { useMemo, useState } from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import {
    IAttributeFilter,
    newNegativeAttributeFilter,
    isNegativeAttributeFilter,
    IAttributeElementsByRef,
    filterAttributeElements,
} from "@gooddata/sdk-model";
import * as Md from "../../../md/full";

const hiddenElements: string[] = [
    // Exclude Dallas
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2208/elements?id=6340130",
];

export const AttributeFilterWithHiddenElements = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(Md.LocationCity, {
            uris: [],
        }),
    );

    const resultingFilter = useMemo(() => {
        // For resulting negative attribute filter, merge its elements with the hidden elements
        if (isNegativeAttributeFilter(filter)) {
            const elements = filterAttributeElements(filter) as IAttributeElementsByRef; // this is safe - we are sure we use uris
            return newNegativeAttributeFilter(filter.negativeAttributeFilter.displayForm, {
                uris: [...elements.uris, ...hiddenElements],
            });
        }

        return filter;
    }, [filter]);

    return (
        <div>
            <AttributeFilter filter={filter} hiddenElements={hiddenElements} onApply={setFilter} />
            <div style={{ height: 300 }}>
                <ColumnChart
                    measures={[Md.$TotalSales]}
                    viewBy={Md.LocationResort}
                    filters={[resultingFilter]}
                />
            </div>
        </div>
    );
};

export default AttributeFilterWithHiddenElements;
