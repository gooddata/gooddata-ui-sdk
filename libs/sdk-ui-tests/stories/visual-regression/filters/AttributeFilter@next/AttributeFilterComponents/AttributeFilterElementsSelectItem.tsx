// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups.js";
import { storiesOf } from "../../../../_infra/storyRepository.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

import { action } from "@storybook/addon-actions";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { IAttributeElement } from "@gooddata/sdk-model";
import { AttributeFilterElementsSelectItem } from "@gooddata/sdk-ui-filters";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const item: IAttributeElement = {
    title: "Item title",
    uri: "some uri",
};

const longTitleItem: IAttributeElement = {
    title: "Very long long long long long long long long long long long long title",
    uri: "some uri",
};

const AttributeFilterElementsSelectItemExamples = (): JSX.Element => {
    return (
        <IntlWrapper>
            <div style={{ width: 300 }}>
                <div className="library-component-light screenshot-target">
                    <h4>AttributeFilterElementsSelectItem unselected</h4>
                    <AttributeFilterElementsSelectItem
                        item={item}
                        isSelected={false}
                        onSelect={action("onSelect")}
                        onDeselect={action("onDeselect")}
                        onSelectOnly={action("onSelectOnly")}
                    />
                    <h4>AttributeFilterElementsSelectItem selected</h4>
                    <AttributeFilterElementsSelectItem
                        item={item}
                        isSelected={true}
                        onSelect={action("onSelect")}
                        onDeselect={action("onDeselect")}
                        onSelectOnly={action("onSelectOnly")}
                    />
                    <h4>AttributeFilterElementsSelectItem long title </h4>
                    <AttributeFilterElementsSelectItem
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

storiesOf(`${FilterStories}@next/Components/AttributeFilterItem`)
    .add("full-featured", () => <AttributeFilterElementsSelectItemExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<AttributeFilterElementsSelectItemExamples />), { screenshot: true });
