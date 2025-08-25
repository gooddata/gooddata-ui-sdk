// (C) 2022-2025 GoodData Corporation
import React from "react";

import { action } from "storybook/actions";

import { IntlWrapper } from "@gooddata/sdk-ui";
import {
    AttributeFilterSimpleDropdownButton,
    AttributeFilterSimpleDropdownButtonWithSelection,
} from "@gooddata/sdk-ui-filters";

import { wrapWithTheme } from "../../../themeWrapper.js";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const attributeTitle = "Product";

function AttributeFilterButtonExamples() {
    return (
        <IntlWrapper>
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
                    <h4>AttributeFilterSimpleDropdownButton long subtitle and item count</h4>
                    <AttributeFilterSimpleDropdownButtonWithSelection
                        isOpen={false}
                        title={attributeTitle}
                        subtitle={"All except Educationally, PhoenixSoft, WonderKid"}
                        selectedItemsCount={3}
                        isFiltering={false}
                        isLoaded={true}
                        isLoading={false}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterSimpleDropdownButton long subtitle without item count</h4>
                    <AttributeFilterSimpleDropdownButtonWithSelection
                        isOpen={false}
                        title={attributeTitle}
                        subtitle={"All except Educationally, PhoenixSoft, WonderKid"}
                        selectedItemsCount={3}
                        showSelectionCount={false}
                        isFiltering={false}
                        isLoaded={true}
                        isLoading={false}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterSimpleDropdownButton shortened title</h4>
                    <div style={{ width: 100 }}>
                        <AttributeFilterSimpleDropdownButtonWithSelection
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
                </div>
            </div>
        </IntlWrapper>
    );
}

export default {
    title: "10 Filters@next/Components/AttributeFilterSimpleDropdownButton",
};

export function FullFeatured() {
    return <AttributeFilterButtonExamples />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<AttributeFilterButtonExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
