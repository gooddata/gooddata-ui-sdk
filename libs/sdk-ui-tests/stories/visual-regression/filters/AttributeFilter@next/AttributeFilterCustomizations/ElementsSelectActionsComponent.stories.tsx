// (C) 2022-2025 GoodData Corporation
import React from "react";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilter, IAttributeFilterElementsActionsProps } from "@gooddata/sdk-ui-filters";
import { action } from "@storybook/addon-actions";

import { ReferenceWorkspaceId, StorybookBackend } from "../../../../_infra/backend.js";
import { LongPostInteractionTimeout } from "../../../../_infra/backstopWrapper.js";
import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const backend = StorybookBackend();

const CustomElementsSelectActionsComponent: React.VFC<IAttributeFilterElementsActionsProps> = (props) => {
    const { onChange, onToggle, totalItemsCount, isVisible } = props;

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
};

const EmptyElementsSelectActionsComponent: React.VFC<IAttributeFilterElementsActionsProps> = (_props) => {
    return <div />;
};

export default {
    title: "10 Filters@next/Customization/ElementsSelectActionsComponent",
};

export const CustomComponent = () => (
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
CustomComponent.parameters = {
    kind: "Custom component",
    screenshots: {
        opened: {
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
};

export const EmptyComponent = () => (
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
EmptyComponent.parameters = {
    kind: "Empty component",
    screenshots: {
        opened: {
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
};
