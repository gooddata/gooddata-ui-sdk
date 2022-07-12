// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups";
import { storiesOf } from "../../../../_infra/storyRepository";
import { wrapWithTheme } from "../../../themeWrapper";

import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { MessageParentItemsFiltered } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/MessageParentItemsFiltered";

const MessageParentItemsFilteredExamples = (): JSX.Element => {
    return (
        <InternalIntlWrapper>
            <div style={{ width: 400 }}>
                <div className="library-component screenshot-target">
                    <h4>MessageItemsFiltered </h4>
                    <MessageParentItemsFiltered
                        parentFilterTitles={["Educationally, PhoenixSoft, WonderKid"]}
                        showItemsFilteredMessage={true}
                    />
                </div>
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${FilterStories}@next/Components/MessageItemsFiltered`)
    .add("full-featured", () => <MessageParentItemsFilteredExamples />, {})
    .add("themed", () => wrapWithTheme(<MessageParentItemsFilteredExamples />), {});
