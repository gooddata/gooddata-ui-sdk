// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups";
import { storiesOf } from "../../../../_infra/storyRepository";

import { IAttributeElement } from "@gooddata/sdk-model";
import { action } from "@storybook/addon-actions";

import { AttributeFilterElementsSelectItem } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/ElementsSelect/AttributeFilterElementsSelectItem";
import { wrapWithTheme } from "../../../themeWrapper";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";

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
        <InternalIntlWrapper>
            <div style={{ width: 300 }}>
                <div className="library-component-light screenshot-target">
                    <h4>AttributeFilterItem unselected</h4>
                    <AttributeFilterElementsSelectItem
                        item={item}
                        isSelected={false}
                        onSelect={action("onSelect")}
                        onDeselect={action("onDeselect")}
                        onSelectOnly={action("onSelectOnly")}
                    />
                    <h4>AttributeFilterItem selected</h4>
                    <AttributeFilterElementsSelectItem
                        item={item}
                        isSelected={true}
                        onSelect={action("onSelect")}
                        onDeselect={action("onDeselect")}
                        onSelectOnly={action("onSelectOnly")}
                    />
                    <h4>AttributeFilterItem long title </h4>
                    <AttributeFilterElementsSelectItem
                        item={longTitleItem}
                        isSelected={false}
                        onSelect={action("onSelect")}
                        onDeselect={action("onDeselect")}
                        onSelectOnly={action("onSelectOnly")}
                    />
                </div>
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeFilterItem`)
    .add("full-featured", () => <AttributeFilterElementsSelectItemExamples />, {})
    .add("themed", () => wrapWithTheme(<AttributeFilterElementsSelectItemExamples />), {});
