// (C) 2021-2026 GoodData Corporation

import { useState } from "react";

import {
    type IAttributeFilter,
    attributeDisplayFormRef,
    newNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import * as Md from "@gooddata/sdk-ui-tests-reference-workspace/current_bear";

const attributeFilter = newNegativeAttributeFilter(attributeDisplayFormRef(Md.Opportunity.Name), {
    uris: [],
});

export function AttributeFilterButtonScenario() {
    const [filter, setFilter] = useState<IAttributeFilter>(attributeFilter);

    return <AttributeFilterButton filter={filter} onApply={setFilter} />;
}
