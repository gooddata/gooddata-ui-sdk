// (C) 2022 GoodData Corporation
import React, { useState } from "react";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import { IAttributeFilter, newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { TRANSACTION_ATTRIBUTE_ID } from "../constants/attributeFilterButtonConstants";

const attributeFilter = newNegativeAttributeFilter(TRANSACTION_ATTRIBUTE_ID, { values: ["99999"] });

export const AttributeFilterButtonPreselectedScenario: React.FC = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(attributeFilter);

    return <AttributeFilterButton filter={filter} onApply={setFilter} />;
};
