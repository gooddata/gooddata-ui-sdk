// (C) 2022-2025 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import { action } from "storybook/actions";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterDropdownButton } from "@gooddata/sdk-ui-filters";
import { Button, IconAttribute } from "@gooddata/sdk-ui-kit";
import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

import { type IStoryParameters } from "../../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

const attributeTitle = "Product";

interface AttributeFilterDropdownButtonExamplesProps {
    isDraggable?: boolean;
    icon?: ReactNode;
}

const AttributeIcon = <IconAttribute />;

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

const titleExtension = (
    <div>
        <Button
            className="gd-button-action gd-button-small"
            iconLeft="gd-icon-trash"
            onClick={action("onButton1Click")}
        />
        <Button
            className="gd-button-action gd-button-small"
            iconLeft="gd-icon-rain"
            onClick={action("onButton2Click")}
        />
        <Button
            className="gd-button-action gd-button-small"
            iconLeft="gd-icon-ghost"
            onClick={action("onButton3Click")}
        />
    </div>
);

function AttributeFilterDropdownButtonExamples({
    isDraggable,
    icon,
}: AttributeFilterDropdownButtonExamplesProps): ReactElement {
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
                        isLoaded
                        isLoading={false}
                        isDraggable={isDraggable}
                        icon={icon}
                        onClick={action("onClick")}
                    />
                    <h4>AttributeFilterDropdownButton opened</h4>
                    <AttributeFilterDropdownButton
                        isOpen
                        title={attributeTitle}
                        subtitle={"All"}
                        selectedItemsCount={10}
                        isFiltering={false}
                        isLoaded
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
                        isLoading
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
                        isFiltering
                        isLoaded
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
                        isLoaded
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
                        isLoaded
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
                            isLoaded
                            isLoading={false}
                            isDraggable={isDraggable}
                            icon={icon}
                            onClick={action("onClick")}
                        />
                    </div>
                    <h4>AttributeFilterDropdownButton opened with tooltip</h4>
                    <div style={{ width: 120 }}>
                        <AttributeFilterDropdownButton
                            isOpen
                            title={attributeTitle}
                            subtitle={"All"}
                            selectedItemsCount={3}
                            isFiltering={false}
                            isLoaded
                            isLoading={false}
                            isDraggable={isDraggable}
                            icon={icon}
                            onClick={action("onClick")}
                            TooltipContentComponent={TooltipContentComponent}
                        />
                    </div>
                    <h4>AttributeFilterDropdownButton with title extension</h4>
                    <AttributeFilterDropdownButton
                        isOpen
                        title={attributeTitle}
                        subtitle={"All"}
                        selectedItemsCount={10}
                        isFiltering={false}
                        isLoaded
                        isLoading={false}
                        isDraggable={isDraggable}
                        icon={icon}
                        onClick={action("onClick")}
                        titleExtension={titleExtension}
                    />
                </div>
            </div>
        </IntlWrapper>
    );
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "10 Filters@next/Components/AttributeFilterDropdownButton",
};

export function FullFeatured() {
    return <AttributeFilterDropdownButtonExamples />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true } satisfies IStoryParameters;

export function FullFeaturedWithIcon() {
    return <AttributeFilterDropdownButtonExamples icon={AttributeIcon} />;
}
FullFeaturedWithIcon.parameters = {
    kind: "full-featured-with-icon",
    screenshot: true,
} satisfies IStoryParameters;

export function Draggable() {
    return <AttributeFilterDropdownButtonExamples isDraggable />;
}
Draggable.parameters = { kind: "draggable", screenshot: true } satisfies IStoryParameters;

export function DraggableWithIcon() {
    return <AttributeFilterDropdownButtonExamples isDraggable icon={AttributeIcon} />;
}
DraggableWithIcon.parameters = { kind: "draggable-with-icon", screenshot: true } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<AttributeFilterDropdownButtonExamples />);
Themed.parameters = { kind: "themed", screenshot: true } satisfies IStoryParameters;
