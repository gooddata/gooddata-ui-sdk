// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups.js";
import { storiesOf } from "../../../../_infra/storyRepository.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

import { action } from "@storybook/addon-actions";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { IAttributeElement } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";
import { SingleSelectionAttributeFilterElementsSelectItem } from "@gooddata/sdk-ui-filters";

const item: IAttributeElement = {
    title: "Item title",
    uri: "some uri",
};

const longTitleItem: IAttributeElement = {
    title: "Very long long long long long long long long long long long long title",
    uri: "some uri",
};

const SingleSelectionAttributeFilterElementsSelectItemExamples = (): JSX.Element => {
    return (
        <IntlWrapper>
            <div style={{ width: 300 }}>
                <div className="library-component-light screenshot-target">
                    <h4>SingleSelectionAttributeFilterElementsSelectItem unselected</h4>
                    <SingleSelectionAttributeFilterElementsSelectItem
                        item={item}
                        isSelected={false}
                        onSelect={action("onSelect")}
                        onDeselect={action("onDeselect")}
                        onSelectOnly={action("onSelectOnly")}
                    />
                    <h4>SingleSelectionAttributeFilterElementsSelectItem selected</h4>
                    <SingleSelectionAttributeFilterElementsSelectItem
                        item={item}
                        isSelected={true}
                        onSelect={action("onSelect")}
                        onDeselect={action("onDeselect")}
                        onSelectOnly={action("onSelectOnly")}
                    />
                    <h4>SingleSelectionAttributeFilterElementsSelectItem long title </h4>
                    <SingleSelectionAttributeFilterElementsSelectItem
                        item={longTitleItem}
                        isSelected={false}
                        onSelect={action("onSelect")}
                        onDeselect={action("onDeselect")}
                        onSelectOnly={action("onSelectOnly")}
                    />
                </div>
            </div>
        </IntlWrapper>
    );
};

storiesOf(`${FilterStories}@next/Components/SingleSelectionAttributeFilterElementsSelectItem`)
    .add("full-featured", () => <SingleSelectionAttributeFilterElementsSelectItemExamples />, {
        screenshot: true,
    })
    .add("themed", () => wrapWithTheme(<SingleSelectionAttributeFilterElementsSelectItemExamples />), {
        screenshot: true,
    });
