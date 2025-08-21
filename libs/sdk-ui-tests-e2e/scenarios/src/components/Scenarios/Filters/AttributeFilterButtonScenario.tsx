// (C) 2021-2025 GoodData Corporation
import React, { useState } from "react";

import { IAttributeFilter, attributeDisplayFormRef, newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";

import * as Md from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";

const attributeFilter = newNegativeAttributeFilter(attributeDisplayFormRef(Md.Opportunity.Name), {
    uris: [],
});

export function AttributeFilterButtonScenario() {
    const [filter, setFilter] = useState<IAttributeFilter>(attributeFilter);

    return <AttributeFilterButton filter={filter} onApply={setFilter} />;
}
