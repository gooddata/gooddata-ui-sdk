// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups";
import { storiesOf } from "../../../../_infra/storyRepository";

import { IAttributeElement } from "@gooddata/sdk-model";
import { action } from "@storybook/addon-actions";

import { AttributeFilterItem } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/AttributeFilterItem";
import { EmptyListItem } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/types";
import { wrapWithTheme } from "../../../themeWrapper";

const item: IAttributeElement = {
    title: "Item title",
    uri: "some uri",
};

const emptyItem: EmptyListItem = {
    empty: true,
};

const longTitleItem: IAttributeElement = {
    title: "Very long long long long long long long long long long long long title",
    uri: "some uri",
};

const AttributeFilterItemExamples = (): JSX.Element => {
    return (
        <div style={{ width: 300 }}>
            <div className="library-component screenshot-target">
                <h4>AttributeFilterItem unselected</h4>
                <AttributeFilterItem
                    item={item}
                    isSelected={false}
                    onSelect={action("onSelect")}
                    onSelectOnly={action("onSelectOnly")}
                />
                <h4>AttributeFilterItem selected</h4>
                <AttributeFilterItem
                    item={item}
                    isSelected={true}
                    onSelect={action("onSelect")}
                    onSelectOnly={action("onSelectOnly")}
                />
                <h4>AttributeFilterItem empty</h4>
                <AttributeFilterItem
                    item={emptyItem}
                    isSelected={false}
                    onSelect={action("onSelect")}
                    onSelectOnly={action("onSelectOnly")}
                />
                <h4>AttributeFilterItem long title </h4>
                <AttributeFilterItem
                    item={longTitleItem}
                    isSelected={false}
                    onSelect={action("onSelect")}
                    onSelectOnly={action("onSelectOnly")}
                />
            </div>
        </div>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeFilterItem`)
    .add("full-featured", () => <AttributeFilterItemExamples />, {})
    .add("themed", () => wrapWithTheme(<AttributeFilterItemExamples />), {});
