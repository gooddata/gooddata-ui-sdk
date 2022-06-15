// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups";
import { storiesOf } from "../../../../_infra/storyRepository";
import { wrapWithTheme } from "../../../themeWrapper";

import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { AttributeFilterError } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/AttributeFilterError";

const AttributeFilterErrorExamples = (): JSX.Element => {
    return (
        <div style={{ width: 300 }}>
            <InternalIntlWrapper>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilter error</h4>
                    <AttributeFilterError />
                </div>
            </InternalIntlWrapper>
        </div>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeFilterError`)
    .add("full-featured", () => <AttributeFilterErrorExamples />, {})
    .add("themed", () => wrapWithTheme(<AttributeFilterErrorExamples />), {});
