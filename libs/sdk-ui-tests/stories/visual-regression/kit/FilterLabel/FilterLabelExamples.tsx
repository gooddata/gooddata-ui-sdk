// (C) 2007-2020 GoodData Corporation
import React from "react";
import { FilterLabel } from "@gooddata/sdk-ui-kit";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { withIntl } from "@gooddata/sdk-ui";

import { UiKit } from "../../../_infra/storyGroups.js";

const FilterLabelExamples: React.FC = () => {
    return (
        <div className="library-component screenshot-target">
            <h4>Example for title/selection</h4>
            <FilterLabel title="Attribute" selection="A, B, C" />

            <h4>Example with All selected</h4>
            <FilterLabel title="Attribute" isAllSelected />

            <h4>Example with nothing selected</h4>
            <FilterLabel title="Attribute" selectionSize={0} />
        </div>
    );
};

const customMessages = {
    "gs.filterLabel.none": "None",
    "gs.filterLabel.all": "All",
};

const WithIntl = withIntl(FilterLabelExamples, undefined, customMessages);

storiesOf(`${UiKit}/FilterLabel`).add("full-featured", () => <WithIntl />, { screenshot: true });
