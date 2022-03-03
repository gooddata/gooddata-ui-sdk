// (C) 2022 GoodData Corporation
import React, { useState } from "react";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import { attributeDisplayFormRef, IAttributeFilter, newPositiveAttributeFilter } from "@gooddata/sdk-model";

import * as Md from "../../../md/full";

const attributeFilter = newPositiveAttributeFilter(attributeDisplayFormRef(Md.Opportunity.Name), {
    uris: ["/gdc/md/frho3i7qc6epdek7mcgergm9vtm6o5ty/obj/1063/elements?id=108112"],
});

export const AttributeFilterButtonPreselectedScenario: React.FC = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(attributeFilter);

    return <AttributeFilterButton filter={filter} onApply={setFilter} />;
};
