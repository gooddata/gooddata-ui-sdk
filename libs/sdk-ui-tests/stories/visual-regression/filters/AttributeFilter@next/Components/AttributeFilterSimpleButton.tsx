// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups";
import { storiesOf } from "../../../../_infra/storyRepository";
import { wrapWithTheme } from "../../../themeWrapper";

import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { AttributeFilterSimpleDropdownButton } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/DropdownButton/AttributeFilterSimpleDropdownButton";
import { action } from "@storybook/addon-actions";

const attributeTitle = "Product";

const AttributeFilterButtonExamples = (): JSX.Element => {
    return (
        <InternalIntlWrapper>
            <div style={{ width: 500 }}>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterSimpleDropdownButton closed</h4>
                    <AttributeFilterSimpleDropdownButton
                        isOpen={false}
                        title={attributeTitle}
                        subtitle={"All"}
                        selectedItemsCount={10}
                        isFiltering={false}
                        isLoaded={true}
                        isLoading={false}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterSimpleDropdownButton opened</h4>
                    <AttributeFilterSimpleDropdownButton
                        isOpen={true}
                        title={attributeTitle}
                        subtitle={"All"}
                        selectedItemsCount={10}
                        isFiltering={false}
                        isLoaded={true}
                        isLoading={false}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterSimpleDropdownButton filtering</h4>
                    <AttributeFilterSimpleDropdownButton
                        isOpen={false}
                        title={attributeTitle}
                        subtitle={"All"}
                        selectedItemsCount={10}
                        isFiltering={true}
                        isLoaded={true}
                        isLoading={false}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterSimpleDropdownButton loading</h4>
                    <AttributeFilterSimpleDropdownButton
                        isOpen={false}
                        title={attributeTitle}
                        subtitle={"All"}
                        selectedItemsCount={10}
                        isFiltering={false}
                        isLoaded={false}
                        isLoading={true}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterSimpleDropdownButton long subtitle and item count 3</h4>
                    <AttributeFilterSimpleDropdownButton
                        isOpen={false}
                        title={attributeTitle}
                        subtitle={"All except Educationally, PhoenixSoft, WonderKid"}
                        selectedItemsCount={3}
                        isFiltering={false}
                        isLoaded={true}
                        isLoading={false}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterSimpleDropdownButton shortened title</h4>
                    <div style={{ width: 100 }}>
                        <AttributeFilterSimpleDropdownButton
                            isOpen={false}
                            title={"Long Attribute name"}
                            subtitle={"All except Educationally, PhoenixSoft, WonderKid"}
                            selectedItemsCount={3}
                            isFiltering={false}
                            isLoaded={true}
                            isLoading={false}
                            onClick={action("onClick")}
                        />
                    </div>
                    <h4>AttributeFilterSimpleDropdownButton not fit in container</h4>
                    <div style={{ width: 60 }}>
                        <AttributeFilterSimpleDropdownButton
                            isOpen={false}
                            title={attributeTitle}
                            subtitle={"All except Educationally, PhoenixSoft, WonderKid"}
                            selectedItemsCount={3}
                            isFiltering={false}
                            isLoaded={true}
                            isLoading={false}
                            onClick={action("onClick")}
                        />
                    </div>
                </div>
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeFilterSimpleDropdownButton`)
    .add("full-featured", () => <AttributeFilterButtonExamples />, {})
    .add("themed", () => wrapWithTheme(<AttributeFilterButtonExamples />), {});
