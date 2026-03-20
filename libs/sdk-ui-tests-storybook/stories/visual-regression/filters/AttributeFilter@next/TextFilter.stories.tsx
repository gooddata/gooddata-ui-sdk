// (C) 2007-2026 GoodData Corporation

import { action } from "storybook/actions";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { newArbitraryAttributeFilter, newMatchAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";

import { ReferenceWorkspaceId, StorybookBackend } from "../../../_infra/backend.js";
import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const wrapperStyle = { width: 400, height: 600, padding: "1em 1em" };
const backend = StorybookBackend();

export default {
    title: "10 Filters@next/AttributeFilter/Text Filter",
};

// Text Filter - "is" operator (Arbitrary positive)

export function TextFilterIsEmpty() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newArbitraryAttributeFilter(ReferenceMd.Product.Name, [], false)}
                titleWithSelection
                onApply={action("on-apply")}
                onChange={action("on-change")}
                menuConfig={{ availableFilterModes: ["elements", "arbitrary", "match"] }}
            />
        </div>
    );
}
TextFilterIsEmpty.parameters = {
    kind: "text filter - is (empty)",
    screenshots: {
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            delay: {
                postOperation: 250,
            },
        },
    },
} satisfies IStoryParameters;

const compactParam = (p: unknown): unknown => {
    if (p && typeof p === "object" && !Array.isArray(p)) {
        const o = p as Record<string, unknown>;
        if ("arbitraryAttributeFilter" in o) return { filter: "arbitrary" };
        if ("matchAttributeFilter" in o) return { filter: "match" };
        if ("positiveAttributeFilter" in o) return { filter: "positive" };
        if ("negativeAttributeFilter" in o) return { filter: "negative" };
        if ("ref" in o && "title" in o) return { attribute: "IAttributeMetadataObject" };
    }
    if (Array.isArray(p)) return `[${p.length} items]`;
    return p;
};

const logCallback = (name: string, ...params: unknown[]) => {
    const compact = params.map(compactParam);
    const paramsStr = compact.length > 0 ? ` ${JSON.stringify(compact)}` : "";
    // eslint-disable-next-line no-console
    console.log(`${name}${paramsStr}`);
    action(name)(...params);
};

export function TextFilterIsWithValues() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newArbitraryAttributeFilter(
                    ReferenceMd.Product.Name,
                    ["Explorer", "GrammarPlus", "PhoenixSoft"],
                    false,
                )}
                titleWithSelection
                onApply={(...args) => logCallback("onApply", ...args)}
                onChange={(...args) => logCallback("onChange", ...args)}
                onError={(error) => logCallback("onError", error.message)}
                onInitLoadingChanged={(loading, attribute) =>
                    logCallback("onInitLoadingChanged", loading, attribute)
                }
                menuConfig={{ availableFilterModes: ["elements", "arbitrary", "match"] }}
            />
        </div>
    );
}
TextFilterIsWithValues.parameters = {
    kind: "text filter - is (with values)",
    screenshots: {
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            delay: {
                postOperation: 250,
            },
        },
    },
} satisfies IStoryParameters;

// Text Filter - "is not" operator (Arbitrary negative)

export function TextFilterIsNot() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newArbitraryAttributeFilter(
                    ReferenceMd.Product.Name,
                    ["CompuSci", "WonderKid"],
                    true,
                )}
                titleWithSelection
                onApply={action("on-apply")}
                onChange={action("on-change")}
                menuConfig={{ availableFilterModes: ["elements", "arbitrary", "match"] }}
            />
        </div>
    );
}
TextFilterIsNot.parameters = {
    kind: "text filter - is not",
    screenshots: {
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            delay: {
                postOperation: 250,
            },
        },
    },
} satisfies IStoryParameters;

// Text Filter - "contains" operator (Match)

export function TextFilterContains() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newMatchAttributeFilter(ReferenceMd.Product.Name, "contains", "Explorer")}
                titleWithSelection
                onApply={action("on-apply")}
                onChange={action("on-change")}
                menuConfig={{ availableFilterModes: ["elements", "arbitrary", "match"] }}
            />
        </div>
    );
}
TextFilterContains.parameters = {
    kind: "text filter - contains",
    screenshots: {
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            delay: {
                postOperation: 250,
            },
        },
    },
} satisfies IStoryParameters;

// Text Filter - "starts with" operator

export function TextFilterStartsWith() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newMatchAttributeFilter(ReferenceMd.Product.Name, "startsWith", "Gram")}
                titleWithSelection
                onApply={action("on-apply")}
                onChange={action("on-change")}
                menuConfig={{ availableFilterModes: ["elements", "arbitrary", "match"] }}
            />
        </div>
    );
}
TextFilterStartsWith.parameters = {
    kind: "text filter - starts with",
    screenshots: {
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            delay: {
                postOperation: 250,
            },
        },
    },
} satisfies IStoryParameters;

// Text Filter - arbitrary with 500 values (limit reached warning)

const VALUES_AT_LIMIT = Array.from({ length: 500 }, (_, i) => `Value ${i + 1}`);

export function TextFilterArbitraryAtLimit() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newArbitraryAttributeFilter(ReferenceMd.Product.Name, VALUES_AT_LIMIT, false)}
                titleWithSelection
                onApply={action("on-apply")}
                onChange={action("on-change")}
                menuConfig={{ availableFilterModes: ["elements", "arbitrary", "match"] }}
                onError={action("on-error")}
            />
        </div>
    );
}
TextFilterArbitraryAtLimit.parameters = {
    kind: "text filter - arbitrary with 500 values (limit reached warning)",
    screenshots: {
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            delay: {
                postOperation: 250,
            },
        },
    },
} satisfies IStoryParameters;

export const TextFilterArbitraryAtLimitThemed = () =>
    wrapWithTheme(
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newArbitraryAttributeFilter(ReferenceMd.Product.Name, VALUES_AT_LIMIT, false)}
                titleWithSelection
                onApply={action("on-apply")}
                onChange={action("on-change")}
                menuConfig={{ availableFilterModes: ["elements", "arbitrary", "match"] }}
            />
        </div>,
    );
TextFilterArbitraryAtLimitThemed.parameters = {
    kind: "text filter - arbitrary with 500 values (limit reached warning) - themed",
    screenshots: {
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            delay: {
                postOperation: 250,
            },
        },
    },
} satisfies IStoryParameters;

// Text Filter - with mode switching enabled

export function TextFilterWithModeSwitching() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newArbitraryAttributeFilter(ReferenceMd.Product.Name, ["WonderKid"], false)}
                titleWithSelection
                onApply={action("on-apply")}
                onChange={action("on-change")}
                menuConfig={{ availableFilterModes: ["elements", "arbitrary", "match"] }}
            />
        </div>
    );
}
TextFilterWithModeSwitching.parameters = {
    kind: "text filter - with mode switching (List/Text menu visible)",
    screenshots: {
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            delay: {
                postOperation: 250,
            },
        },
    },
} satisfies IStoryParameters;

export const Themed = () =>
    wrapWithTheme(
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newArbitraryAttributeFilter(ReferenceMd.Product.Name, [], false)}
                titleWithSelection
                onApply={action("on-apply")}
                onChange={action("on-change")}
                menuConfig={{ availableFilterModes: ["elements", "arbitrary", "match"] }}
            />
        </div>,
    );
Themed.parameters = {
    kind: "themed",
    screenshots: {
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            delay: {
                postOperation: 250,
            },
        },
    },
} satisfies IStoryParameters;
