// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups";
import { storiesOf } from "../../../../_infra/storyRepository";
import { wrapWithTheme } from "../../../themeWrapper";

import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { AttributeFilterElementsSelectNoMatchingData } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/ElementsSelect/AttributeFilterElementsSelectNoMatchingData";

const AttributeFilterElementsSelectNoMatchingDataExamples = (): JSX.Element => {
    return (
        <InternalIntlWrapper>
            <div style={{ width: 400 }}>
                <div className="library-component screenshot-target">
                    <h4>MessageAllItemsFiltered</h4>
                    <AttributeFilterElementsSelectNoMatchingData parentFilterTitles={["aaa", "bbb"]} />
                </div>
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeFilterElementsSelectNoMatchingData`)
    .add("full-featured", () => <AttributeFilterElementsSelectNoMatchingDataExamples />, {})
    .add("themed", () => wrapWithTheme(<AttributeFilterElementsSelectNoMatchingDataExamples />), {});
