// (C) 2021-2022 GoodData Corporation
import React, { useState } from "react";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import { attributeDisplayFormRef, IAttributeFilter, newNegativeAttributeFilter } from "@gooddata/sdk-model";

import * as Md from "../../../md/full";

const attributeFilter = newNegativeAttributeFilter(attributeDisplayFormRef(Md.Opportunity.Name), {
    uris: [],
});

export const AttributeFilterButtonScenario: React.FC = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(attributeFilter);

    return <AttributeFilterButton filter={filter} onApply={setFilter} />;
};
