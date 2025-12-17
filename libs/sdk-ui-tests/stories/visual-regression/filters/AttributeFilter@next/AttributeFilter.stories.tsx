// (C) 2007-2025 GoodData Corporation

import { action } from "storybook/actions";

import { ReferenceData, ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter, newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";

import { ReferenceWorkspaceId, StorybookBackend } from "../../../_infra/backend.js";
import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
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

// eslint-disable-next-line no-restricted-exports
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
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: { delay: 5000 },
        },
    },
} satisfies IStoryParameters;

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
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: { delay: 5000 },
        },
    },
} satisfies IStoryParameters;

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
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: { delay: 5000 },
        },
    },
} satisfies IStoryParameters;

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
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: { delay: 5000 },
        },
    },
} satisfies IStoryParameters;

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
                titleWithSelection
            />
        </div>
    );
}
TitleWithPreSelectedElementsPositiveAttributefilter.parameters = {
    kind: "title with pre-selected elements - positive AttributeFilter",
    screenshots: {
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: { delay: 5000 },
        },
    },
} satisfies IStoryParameters;

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
                titleWithSelection
            />
        </div>
    );
}
TitleWithPreSelectedElementsNegativeAttributefilter.parameters = {
    kind: "title with pre-selected elements - negative AttributeFilter",
    screenshots: {
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: { delay: 5000 },
        },
    },
} satisfies IStoryParameters;

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
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: { delay: 5000 },
        },
    },
} satisfies IStoryParameters;

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
AttributeFilterError.parameters = {
    kind: "attribute filter error",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

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
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: { delay: 5000 },
        },
    },
} satisfies IStoryParameters;

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
                titleWithSelection
                fullscreenOnMobile
            />
        </div>
    );
}
SingleSelectionFilter.parameters = {
    kind: "single selection filter",
    screenshots: {
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: { delay: 5000 },
        },
    },
} satisfies IStoryParameters;

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
                titleWithSelection
                fullscreenOnMobile
            />
        </div>,
    );
SingleSelectionFilterThemed.parameters = {
    kind: "single selection filter - themed",
    screenshots: {
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: { delay: 5000 },
        },
    },
} satisfies IStoryParameters;

export function FilterWithDisplayAsLabel() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                onApply={action("on-apply")}
                displayAsLabel={ReferenceMd.UserId.UserName.attribute.displayForm}
                titleWithSelection
            />
        </div>
    );
}
FilterWithDisplayAsLabel.parameters = {
    kind: "filter with display as label",
    screenshots: {
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            delay: {
                postOperation: 250, // search icon has .25s transition
            },
        },
    },
} satisfies IStoryParameters;
