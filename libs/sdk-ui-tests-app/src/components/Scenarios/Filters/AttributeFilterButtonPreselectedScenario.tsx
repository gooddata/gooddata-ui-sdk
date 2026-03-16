// (C) 2022-2026 GoodData Corporation

import { useState } from "react";

import {
    type IAttributeFilter,
    attributeDisplayFormRef,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import * as Md from "@gooddata/sdk-ui-tests-reference-workspace/current_bear";

import { workspace } from "../../../constants.js";

const attributeFilter = newPositiveAttributeFilter(attributeDisplayFormRef(Md.Opportunity.Name), {
    uris: [`/gdc/md/${workspace}/obj/1065/elements?id=108112`],
});

export function AttributeFilterButtonPreselectedScenario() {
    const [filter, setFilter] = useState<IAttributeFilter>(attributeFilter);

    return <AttributeFilterButton filter={filter} onApply={setFilter} />;
}
