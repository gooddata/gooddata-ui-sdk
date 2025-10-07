// (C) 2007-2025 GoodData Corporation

import { action } from "storybook/actions";

import { ReferenceData, ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter, newPositiveAttributeFilter } from "@gooddata/sdk-model";
import {
    AttributeFilterButton,
    AttributeFilterDropdownButton,
    AttributeFilterError as FiltersAttributeFilterError,
} from "@gooddata/sdk-ui-filters";

import { ReferenceWorkspaceId, StorybookBackend } from "../../../_infra/backend.js";
import { LongPostInteractionTimeout } from "../../../_infra/backstopWrapper.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const wrapperStyle = { width: 400, height: 600, padding: "1em 1em" };
const backend = StorybookBackend();

/*
 * TODO: fix these scenarios, use postInteractionWait selector (string) instead of fixed timeout. this
 *  will highly likely require changes in the attr filter though (tried existing styles, no luck - possibly
 *  because of the fixedDataTable / goodstrap => i believe divs are rendered with zero height first => still
 *  not visible)
 */

export default {
    title: "10 Filters@next/AttributeFilterButton",
};

export function EmptyDefaultSelection() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilterButton
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                onApply={action("on-apply")}
            />
        </div>
    );
}
EmptyDefaultSelection.parameters = {
    kind: "empty default selection",
    screenshots: {
        opened: {
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
};

export function NotFitIntoContent() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, 80px)",
                    height: 200,
                    width: 160,
                }}
            >
                <AttributeFilterButton
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                    onApply={action("on-apply")}
                />
                <div style={{ padding: 4 }}>Second</div>
            </div>
        </div>
    );
}
NotFitIntoContent.parameters = {
    kind: "not fit into content",
    screenshots: {
        opened: {
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
};

export function EmptyDefaultSelectionLocalized() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilterButton
                backend={backend}
                workspace={ReferenceWorkspaceId}
                locale="de-DE"
                filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                onApply={action("on-apply")}
            />
        </div>
    );
}
EmptyDefaultSelectionLocalized.parameters = {
    kind: "empty default selection - localized",
    screenshots: {
        opened: {
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
};

export function PreSelectedElements() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilterButton
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, {
                    uris: [ReferenceData.ProductName.WonderKid.uri, ReferenceData.ProductName.Explorer.uri],
                })}
                onApply={action("on-apply")}
            />
        </div>
    );
}
PreSelectedElements.parameters = {
    kind: "pre-selected elements",
    screenshots: {
        opened: {
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
};

export function AllElementsSelectedInNegativeSelection() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilterButton
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, {
                    uris: [
                        ReferenceData.ProductName.CompuSci.uri,
                        ReferenceData.ProductName.Educationly.uri,
                        ReferenceData.ProductName.Explorer.uri,
                        ReferenceData.ProductName.GrammarPlus.uri,
                        ReferenceData.ProductName.PhoenixSoft.uri,
                        ReferenceData.ProductName.TouchAll.uri,
                        ReferenceData.ProductName.WonderKid.uri,
                    ],
                })}
                onApply={action("on-apply")}
            />
        </div>
    );
}
AllElementsSelectedInNegativeSelection.parameters = {
    kind: "all elements selected in negative selection",
    screenshots: {
        opened: {
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
};

export function AttributeFilterError() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilterButton
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newNegativeAttributeFilter("NON_EXISTING", [])}
                onApply={action("on-apply")}
            />

            <p>with hover state</p>
            <div className="filter-hover">
                <AttributeFilterButton
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter("NON_EXISTING", [])}
                    onApply={action("on-apply")}
                    ErrorComponent={() => <FiltersAttributeFilterError isDraggable />}
                />
            </div>

            <p>can&apos;t load value error </p>
            <div className="error-not-load-value">
                <AttributeFilterButton
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                    onApply={action("on-apply")}
                    DropdownButtonComponent={() => (
                        <AttributeFilterDropdownButton title="Product name" subtitle="Laptop" isError />
                    )}
                />
            </div>

            <p>can&apos;t load value error and hover state</p>
            <div className="error-not-load-value-hover">
                <AttributeFilterButton
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                    onApply={action("on-apply")}
                    DropdownButtonComponent={() => (
                        <AttributeFilterDropdownButton
                            title="Product name"
                            subtitle="Laptop"
                            isError
                            isDraggable
                        />
                    )}
                />
            </div>
        </div>
    );
}
AttributeFilterError.parameters = {
    kind: "attribute filter error",
    screenshots: {
        hover: {
            hoverSelectors: [
                ".filter-hover .gd-attribute-filter-dropdown-button__next",
                ".error-not-load-value-hover .gd-attribute-filter-dropdown-button__next",
            ],
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
};

export const Themed = () =>
    wrapWithTheme(
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilterButton
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                onApply={action("on-apply")}
            />
        </div>,
    );
Themed.parameters = {
    kind: "themed",
    screenshots: {
        opened: {
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
};

export function SingleSelection() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilterButton
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, {
                    uris: [ReferenceData.ProductName.WonderKid.uri],
                })}
                onApply={action("on-apply")}
                selectionMode="single"
            />
        </div>
    );
}
SingleSelection.parameters = {
    kind: "single selection",
    screenshots: {
        opened: {
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
};
