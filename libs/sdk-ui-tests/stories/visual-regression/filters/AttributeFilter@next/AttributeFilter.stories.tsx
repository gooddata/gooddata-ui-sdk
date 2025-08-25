// (C) 2007-2025 GoodData Corporation
import React from "react";

import { action } from "storybook/actions";

import { ReferenceData, ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter, newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";

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
    title: "10 Filters@next/AttributeFilter",
};

export function EmptyDefaultSelection() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
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
                <AttributeFilter
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
            <AttributeFilter
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
            <AttributeFilter
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

export function TitleWithPreSelectedElementsPositiveAttributefilter() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, {
                    uris: [
                        ReferenceData.ProductName.WonderKid.uri,
                        ReferenceData.ProductName.Explorer.uri,
                        ReferenceData.ProductName.TouchAll.uri,
                    ],
                })}
                onApply={action("on-apply")}
                titleWithSelection={true}
            />
        </div>
    );
}
TitleWithPreSelectedElementsPositiveAttributefilter.parameters = {
    kind: "title with pre-selected elements - positive AttributeFilter",
    screenshots: {
        opened: {
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
};

export function TitleWithPreSelectedElementsNegativeAttributefilter() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, {
                    uris: [
                        ReferenceData.ProductName.WonderKid.uri,
                        ReferenceData.ProductName.Explorer.uri,
                        ReferenceData.ProductName.TouchAll.uri,
                    ],
                })}
                onApply={action("on-apply")}
                titleWithSelection={true}
            />
        </div>
    );
}
TitleWithPreSelectedElementsNegativeAttributefilter.parameters = {
    kind: "title with pre-selected elements - negative AttributeFilter",
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
            <AttributeFilter
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
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newNegativeAttributeFilter("NON_EXISTING", [])}
                onApply={action("on-apply")}
            />
        </div>
    );
}
AttributeFilterError.parameters = { kind: "attribute filter error", screenshot: true };

export const Themed = () =>
    wrapWithTheme(
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
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

export function SingleSelectionFilter() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, {
                    uris: [ReferenceData.ProductName.WonderKid.uri],
                })}
                onApply={action("on-apply")}
                selectionMode="single"
                titleWithSelection={true}
                fullscreenOnMobile
            />
        </div>
    );
}
SingleSelectionFilter.parameters = {
    kind: "single selection filter",
    screenshots: {
        opened: {
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
};

export const SingleSelectionFilterThemed = () =>
    wrapWithTheme(
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, {
                    uris: [ReferenceData.ProductName.WonderKid.uri],
                })}
                onApply={action("on-apply")}
                selectionMode="single"
                titleWithSelection={true}
                fullscreenOnMobile
            />
        </div>,
    );
SingleSelectionFilterThemed.parameters = {
    kind: "single selection filter - themed",
    screenshots: {
        opened: {
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
};

export function FilterWithDisplayAsLabel() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                onApply={action("on-apply")}
                displayAsLabel={ReferenceMd.UserId.UserName.attribute.displayForm}
                titleWithSelection={true}
            />
        </div>
    );
}
FilterWithDisplayAsLabel.parameters = {
    kind: "filter with display as label",
    screenshots: {
        opened: {
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
};
