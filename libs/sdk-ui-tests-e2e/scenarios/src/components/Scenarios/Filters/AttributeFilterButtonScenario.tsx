// (C) 2021-2025 GoodData Corporation
import { useState } from "react";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import { attributeDisplayFormRef, IAttributeFilter, newNegativeAttributeFilter } from "@gooddata/sdk-model";

import * as Md from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";

const attributeFilter = newNegativeAttributeFilter(attributeDisplayFormRef(Md.Opportunity.Name), {
    uris: [],
});

export function AttributeFilterButtonScenario() {
    const [filter, setFilter] = useState<IAttributeFilter>(attributeFilter);

    return <AttributeFilterButton filter={filter} onApply={setFilter} />;
}
