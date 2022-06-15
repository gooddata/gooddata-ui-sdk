// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups";
import { storiesOf } from "../../../../_infra/storyRepository";
import { wrapWithTheme } from "../../../themeWrapper";

import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { AttributeDropdownItemsFiltered } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/AttributeDropdownItemsFiltered";

const AttributeDropdownItemsFilteredExamples = (): JSX.Element => {
    return (
        <InternalIntlWrapper>
            <div style={{ width: 400 }}>
                <div className="library-component screenshot-target">
                    <h4>AttributeDropdownItemsFiltered </h4>
                    <AttributeDropdownItemsFiltered
                        parentFilterTitles={["Educationally, PhoenixSoft, WonderKid"]}
                        showItemsFilteredMessage={true}
                    />
                </div>
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeDropdownItemsFiltered`)
    .add("full-featured", () => <AttributeDropdownItemsFilteredExamples />, {})
    .add("themed", () => wrapWithTheme(<AttributeDropdownItemsFilteredExamples />), {});
