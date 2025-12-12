// (C) 2021-2025 GoodData Corporation

import { useState } from "react";

import {
    type IAttributeFilter,
    attributeDisplayFormRef,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";

import * as Md from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";
import { workspace } from "../../../constants.ts";

const attributeFilter = newPositiveAttributeFilter(attributeDisplayFormRef(Md.Opportunity.Name), {
    uris: [`/gdc/md/${workspace}/obj/1065/elements?id=5034`],
});

export function SingleSelectionAttributeFilterButtonScenario() {
    const [filter, setFilter] = useState<IAttributeFilter>(attributeFilter);

    return <AttributeFilterButton filter={filter} onApply={setFilter} selectionMode="single" />;
}
