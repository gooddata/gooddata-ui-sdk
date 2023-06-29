// (C) 2022 GoodData Corporation
import React, { ReactNode } from "react";

import { BackstopConfig } from "../../../../_infra/backstopScenario.js";
import { FilterStories } from "../../../../_infra/storyGroups.js";
import { storiesOf } from "../../../../_infra/storyRepository.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

import { action } from "@storybook/addon-actions";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterDropdownButton } from "@gooddata/sdk-ui-filters";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";
import { Icon } from "@gooddata/sdk-ui-kit";

const attributeTitle = "Product";

interface AttributeFilterDropdownButtonExamplesProps {
    isDraggable?: boolean;
    icon?: ReactNode;
}

const AttributeIcon = <Icon.Attribute />;

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

const AttributeFilterDropdownButtonExamples: React.FC<AttributeFilterDropdownButtonExamplesProps> = (
    props,
): JSX.Element => {
    const { isDraggable, icon } = props;

    return (
        <IntlWrapper>
            <div style={{ width: 500 }}>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterDropdownButton closed</h4>
                    <AttributeFilterDropdownButton
                        isOpen={false}
                        title={attributeTitle}
                        subtitle={"All"}
                        selectedItemsCount={10}
                        isFiltering={false}
                        isLoaded={true}
                        isLoading={false}
                        isDraggable={isDraggable}
                        icon={icon}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterDropdownButton opened</h4>
                    <AttributeFilterDropdownButton
                        isOpen={true}
                        title={attributeTitle}
                        subtitle={"All"}
                        selectedItemsCount={10}
                        isFiltering={false}
                        isLoaded={true}
                        isLoading={false}
                        isDraggable={isDraggable}
                        icon={icon}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterDropdownButton loading</h4>
                    <AttributeFilterDropdownButton
                        isOpen={false}
                        title={attributeTitle}
                        subtitle={"All"}
                        selectedItemsCount={10}
                        isFiltering={false}
                        isLoaded={false}
                        isLoading={true}
                        isDraggable={isDraggable}
                        icon={icon}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterDropdownButton filtering</h4>
                    <AttributeFilterDropdownButton
                        isOpen={false}
                        title={attributeTitle}
                        subtitle={"All"}
                        selectedItemsCount={10}
                        isFiltering={true}
                        isLoaded={true}
                        isLoading={false}
                        isDraggable={isDraggable}
                        icon={icon}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterDropdownButton long subtitle with item count</h4>
                    <AttributeFilterDropdownButton
                        isOpen={false}
                        title={attributeTitle}
                        subtitle={"All except Educationally, PhoenixSoft, WonderKid"}
                        selectedItemsCount={3}
                        isFiltering={false}
                        isLoaded={true}
                        isLoading={false}
                        isDraggable={isDraggable}
                        icon={icon}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterDropdownButton long subtitle without item count</h4>
                    <AttributeFilterDropdownButton
                        isOpen={false}
                        title={attributeTitle}
                        subtitle={"All except Educationally, PhoenixSoft, WonderKid"}
                        selectedItemsCount={3}
                        showSelectionCount={false}
                        isFiltering={false}
                        isLoaded={true}
                        isLoading={false}
                        isDraggable={isDraggable}
                        icon={icon}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterDropdownButton shortened title</h4>
                    <div style={{ width: 120 }}>
                        <AttributeFilterDropdownButton
                            isOpen={false}
                            title={"Long Attribute name"}
                            subtitle={"All except Educationally, PhoenixSoft, WonderKid"}
                            selectedItemsCount={3}
                            isFiltering={false}
                            isLoaded={true}
                            isLoading={false}
                            isDraggable={isDraggable}
                            icon={icon}
                            onClick={action("onClick")}
                        />
                    </div>
                    <h4>AttributeFilterDropdownButton opened with tooltip</h4>
                    <div style={{ width: 120 }}>
                        <AttributeFilterDropdownButton
                            isOpen={true}
                            title={attributeTitle}
                            subtitle={"All"}
                            selectedItemsCount={3}
                            isFiltering={false}
                            isLoaded={true}
                            isLoading={false}
                            isDraggable={isDraggable}
                            icon={icon}
                            onClick={action("onClick")}
                            TooltipContentComponent={TooltipContentComponent}
                        />
                    </div>
                </div>
            </div>
        </IntlWrapper>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeFilterDropdownButton`)
    .add("full-featured", () => <AttributeFilterDropdownButtonExamples />, { screenshot: true })
    .add("full-featured-with-icon", () => <AttributeFilterDropdownButtonExamples icon={AttributeIcon} />, {
        screenshot: true,
    })
    .add("draggable", () => <AttributeFilterDropdownButtonExamples isDraggable={true} />, {
        screenshot: true,
    })
    .add(
        "draggable-with-icon",
        () => <AttributeFilterDropdownButtonExamples isDraggable={true} icon={AttributeIcon} />,
        { screenshot: true },
    )
    .add("themed", () => wrapWithTheme(<AttributeFilterDropdownButtonExamples />), { screenshot: true });

storiesOf(`${FilterStories}@next/Components/AttributeFilterDropdownButton/with tooltip`)
    .add(
        "full-featured",
        () => {
            return (
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
        },
        { screenshots: dropdownButtonWithTooltip },
    )
    .add(
        "themed",
        () => {
            return wrapWithTheme(
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
        },
        { screenshots: dropdownButtonWithTooltip },
    );
