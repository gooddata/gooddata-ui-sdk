// (C) 2020-2025 GoodData Corporation
import {
    UiNavigationBypass,
    IUiNavigationBypassProps,
    ComponentTable,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";
import React from "react";
import noop from "lodash/noop.js";

import { storiesOf } from "../../_infra/storyRepository.js";
import { UiStories } from "../../_infra/storyGroups.js";
import { wrapWithTheme } from "../themeWrapper.js";

const propCombination = propCombinationsFor({
    label: "Navigation Skip",
    onItemClick: noop,
} as IUiNavigationBypassProps);

const allItems = propCombination("items", [
    [
        { id: "item1", name: "Item 1", targetId: "target1" },
        { id: "item2", name: "Item 2", targetId: "target2" },
        { id: "item3", name: "Item 3", targetId: "target3" },
    ],
    [
        { id: "item1", name: "Item 1", targetId: "target1" },
        { id: "item2", name: "Item 2", targetId: "target2", tabIndex: -1 },
        { id: "item3", name: "Item 3", targetId: "target3", tabIndex: -1 },
    ],
]);

const WrapperComponent: React.FC<IUiNavigationBypassProps> = (props) => {
    return (
        <>
            <h3>Focus &quot;Start&quot; by mouse and use Tab to navigate</h3>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: "80%",
                    justifyContent: "space-between",
                }}
            >
                <button>Start</button>
                <UiNavigationBypass
                    {...props}
                    style={{
                        flex: "1 1 auto",
                    }}
                />
                <button>End</button>
            </div>
        </>
    );
};

const UiNavigationBypassTest: React.FC<{ showCode?: boolean }> = ({ showCode }) => (
    <div className="screenshot-target">
        <ComponentTable
            rowsBy={[allItems]}
            Component={WrapperComponent}
            codeSnippet={showCode ? "UiNavigationBypass" : undefined}
            align="center"
        />
    </div>
);

storiesOf(`${UiStories}/UiNavigationBypass`)
    .add("full-featured navigation skip", () => <UiNavigationBypassTest />)
    .add("themed", () => wrapWithTheme(<UiNavigationBypassTest />))
    .add("interface", () => <UiNavigationBypassTest showCode />);
