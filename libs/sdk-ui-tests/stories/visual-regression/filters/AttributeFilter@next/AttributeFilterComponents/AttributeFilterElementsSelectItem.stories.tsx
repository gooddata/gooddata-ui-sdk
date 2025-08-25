// (C) 2022-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { action } from "storybook/actions";

import { IAttributeElement } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterElementsSelectItem } from "@gooddata/sdk-ui-filters";

import { wrapWithTheme } from "../../../themeWrapper.js";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const item: IAttributeElement = {
    title: "Item title",
    uri: "some uri",
};

const longTitleItem: IAttributeElement = {
    title: "Very long long long long long long long long long long long long title",
    uri: "some uri",
};

function AttributeFilterElementsSelectItemExamples(): ReactElement {
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
}

export default {
    title: "10 Filters@next/Components/AttributeFilterItem",
};

export function FullFeatured() {
    return <AttributeFilterElementsSelectItemExamples />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<AttributeFilterElementsSelectItemExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
