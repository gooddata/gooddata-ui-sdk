// (C) 2022-2025 GoodData Corporation

import { action } from "storybook/actions";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterDropdownButton } from "@gooddata/sdk-ui-filters";

import { type INeobackstopConfig } from "../../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const attributeTitle = "Product";

const dropdownButtonWithTooltip: INeobackstopConfig = {
    default: { readySelector: ".screenshot-target" },
    hover: {
        readySelector: ".screenshot-target",
        hoverSelector: ".s-attribute-filter-tooltip-icon",
        postInteractionWait: 1000,
        misMatchThreshold: 0.001, // unsure why this is needed, but a pixel is probably off by a few rgb points
    },
};

function TooltipContentComponent() {
    return (
        <div className="gd-attribute-filter-tooltip-content s-attribute-filter-tooltip-content">
            <h3 className="s-attribute-filter-tooltip-header">{attributeTitle}</h3>
            <h4> Type </h4>
            <p className="s-attribute-filter-tooltip-item-name">{attributeTitle}</p>
            <h4> Dataset </h4>
            <p className="s-attribute-filter-tooltip-item-dataset">{attributeTitle}</p>
        </div>
    );
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "10 Filters@next/Components/AttributeFilterDropdownButton/with tooltip",
};

export function FullFeatured() {
    return (
        <div className="screenshot-target">
            <h4>AttributeFilterDropdownButton opened with tooltip</h4>
            <div style={{ width: 120 }}>
                <IntlWrapper>
                    <AttributeFilterDropdownButton
                        isOpen
                        title={attributeTitle}
                        subtitle={"All"}
                        selectedItemsCount={3}
                        isFiltering={false}
                        isLoaded
                        isLoading={false}
                        onClick={action("onClick")}
                        TooltipContentComponent={TooltipContentComponent}
                    />
                </IntlWrapper>
            </div>
        </div>
    );
}
FullFeatured.parameters = { kind: "full-featured", screenshots: dropdownButtonWithTooltip };

export const Themed = () =>
    wrapWithTheme(
        <div className="screenshot-target">
            <h4>AttributeFilterDropdownButton opened with tooltip</h4>
            <div style={{ width: 120 }}>
                <IntlWrapper>
                    <AttributeFilterDropdownButton
                        isOpen
                        title={attributeTitle}
                        subtitle={"All"}
                        selectedItemsCount={3}
                        isFiltering={false}
                        isLoaded
                        isLoading={false}
                        onClick={action("onClick")}
                        TooltipContentComponent={TooltipContentComponent}
                    />
                </IntlWrapper>
            </div>
        </div>,
    );
Themed.parameters = { kind: "themed", screenshots: dropdownButtonWithTooltip };
