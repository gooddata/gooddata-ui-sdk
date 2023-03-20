// (C) 2021-2023 GoodData Corporation
import React, { useState } from "react";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import { attributeDisplayFormRef, IAttributeFilter, newPositiveAttributeFilter } from "@gooddata/sdk-model";

import * as Md from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";

const attributeFilter = newPositiveAttributeFilter(attributeDisplayFormRef(Md.Opportunity.Name), {
    uris: ["/gdc/md/cd07f9rjrz0grf2k6667u7s6cwo6m023/obj/1063/elements?id=5034"],
});

export const SingleSelectionAttributeFilterButtonScenario: React.FC = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(attributeFilter);

    return <AttributeFilterButton filter={filter} onApply={setFilter} selectionMode="single" />;
};
