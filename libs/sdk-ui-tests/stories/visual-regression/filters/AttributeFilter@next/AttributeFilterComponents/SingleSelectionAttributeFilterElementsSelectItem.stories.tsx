// (C) 2022-2025 GoodData Corporation

import { ReactElement } from "react";

import { action } from "storybook/actions";

import { IAttributeElement } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { SingleSelectionAttributeFilterElementsSelectItem } from "@gooddata/sdk-ui-filters";
import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

import { wrapWithTheme } from "../../../themeWrapper.js";

const item: IAttributeElement = {
    title: "Item title",
    uri: "some uri",
};

const longTitleItem: IAttributeElement = {
    title: "Very long long long long long long long long long long long long title",
    uri: "some uri",
};

function SingleSelectionAttributeFilterElementsSelectItemExamples(): ReactElement {
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
}

export default {
    title: "10 Filters@next/Components/SingleSelectionAttributeFilterElementsSelectItem",
};

export function FullFeatured() {
    return <SingleSelectionAttributeFilterElementsSelectItemExamples />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<SingleSelectionAttributeFilterElementsSelectItemExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
