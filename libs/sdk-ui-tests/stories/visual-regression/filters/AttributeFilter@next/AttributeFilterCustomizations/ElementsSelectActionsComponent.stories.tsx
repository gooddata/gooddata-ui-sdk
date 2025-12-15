// (C) 2022-2025 GoodData Corporation

import { action } from "storybook/actions";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilter, type IAttributeFilterElementsActionsProps } from "@gooddata/sdk-ui-filters";

import { ReferenceWorkspaceId, StorybookBackend } from "../../../../_infra/backend.js";
import { type IStoryParameters } from "../../../../_infra/backstopScenario.js";
import { LongPostInteractionTimeout } from "../../../../_infra/backstopWrapper.js";
import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const backend = StorybookBackend();

function CustomElementsSelectActionsComponent({
    onChange,
    onToggle,
    totalItemsCount,
    isVisible,
}: IAttributeFilterElementsActionsProps) {
    if (!isVisible) {
        return null;
    }

    return (
        <div
            style={{
                background: "pink",
                width: "100%",
                paddingLeft: 10,
            }}
        >
            <button onClick={() => onChange(true)}>all</button>
            <button onClick={() => onChange(false)}>none</button>
            <button onClick={() => onToggle()}>toggle</button>
            <span style={{ paddingLeft: 10 }}>({totalItemsCount})</span>
        </div>
    );
}

function EmptyElementsSelectActionsComponent() {
    return <div />;
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "10 Filters@next/Customization/ElementsSelectActionsComponent",
};

export function CustomComponent() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                onApply={action("on-apply")}
                ElementsSelectActionsComponent={CustomElementsSelectActionsComponent}
            />
        </div>
    );
}
CustomComponent.parameters = {
    kind: "Custom component",
    screenshots: {
        opened: {
            readySelector: ".screenshot-target",
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
} satisfies IStoryParameters;

export function EmptyComponent() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                onApply={action("on-apply")}
                ElementsSelectActionsComponent={EmptyElementsSelectActionsComponent}
            />
        </div>
    );
}
EmptyComponent.parameters = {
    kind: "Empty component",
    screenshots: {
        opened: {
            readySelector: ".screenshot-target",
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
} satisfies IStoryParameters;
