// (C) 2022-2025 GoodData Corporation
import { useState } from "react";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import { attributeDisplayFormRef, IAttributeFilter, newPositiveAttributeFilter } from "@gooddata/sdk-model";

import * as Md from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";

import { workspace } from "../../../constants.js";

const attributeFilter = newPositiveAttributeFilter(attributeDisplayFormRef(Md.Opportunity.Name), {
    uris: [`/gdc/md/${workspace}/obj/1065/elements?id=108112`],
});

export function AttributeFilterButtonPreselectedScenario() {
    const [filter, setFilter] = useState<IAttributeFilter>(attributeFilter);

    return <AttributeFilterButton filter={filter} onApply={setFilter} />;
}
