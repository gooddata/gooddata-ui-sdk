// (C) 2022-2025 GoodData Corporation
import React from "react";

import { BackstopConfig } from "../../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

import { action } from "@storybook/addon-actions";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterDropdownButton } from "@gooddata/sdk-ui-filters";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const attributeTitle = "Product";

const dropdownButtonWithTooltip: BackstopConfig = {
    default: {},
    hover: { hoverSelector: ".s-attribute-filter-tooltip-icon", postInteractionWait: 1000 },
};

const TooltipContentComponent: React.FC = () => {
    return (
        <div className="gd-attribute-filter-tooltip-content s-attribute-filter-tooltip-content">
            <h3 className="s-attribute-filter-tooltip-header">{attributeTitle}</h3>
            <h4> Type </h4>
            <p className="s-attribute-filter-tooltip-item-name">{attributeTitle}</p>
            <h4> Dataset </h4>
            <p className="s-attribute-filter-tooltip-item-dataset">{attributeTitle}</p>
        </div>
    );
};

export default {
    title: "10 Filters@next/Components/AttributeFilterDropdownButton/with tooltip",
};

export const FullFeatured = () => (
    <div className="screenshot-target">
        <h4>AttributeFilterDropdownButton opened with tooltip</h4>
        <div style={{ width: 120 }}>
            <IntlWrapper>
                <AttributeFilterDropdownButton
                    isOpen={true}
                    title={attributeTitle}
                    subtitle={"All"}
                    selectedItemsCount={3}
                    isFiltering={false}
                    isLoaded={true}
                    isLoading={false}
                    onClick={action("onClick")}
                    TooltipContentComponent={TooltipContentComponent}
                />
            </IntlWrapper>
        </div>
    </div>
);
FullFeatured.parameters = { kind: "full-featured", screenshots: dropdownButtonWithTooltip };

export const Themed = () =>
    wrapWithTheme(
        <div className="screenshot-target">
            <h4>AttributeFilterDropdownButton opened with tooltip</h4>
            <div style={{ width: 120 }}>
                <IntlWrapper>
                    <AttributeFilterDropdownButton
                        isOpen={true}
                        title={attributeTitle}
                        subtitle={"All"}
                        selectedItemsCount={3}
                        isFiltering={false}
                        isLoaded={true}
                        isLoading={false}
                        onClick={action("onClick")}
                        TooltipContentComponent={TooltipContentComponent}
                    />
                </IntlWrapper>
            </div>
        </div>,
    );
Themed.parameters = { kind: "themed", screenshots: dropdownButtonWithTooltip };
