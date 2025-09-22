// (C) 2020-2025 GoodData Corporation

import {
    ComponentTable,
    IUiNavigationBypassProps,
    UiNavigationBypass,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../themeWrapper.js";

const propCombination = propCombinationsFor({
    label: "Navigation Skip",
    onItemClick: (..._: any[]) => {},
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

function WrapperComponent(props: IUiNavigationBypassProps) {
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
}

function UiNavigationBypassTest({ showCode }: { showCode?: boolean }) {
    return (
        <div className="screenshot-target">
            <ComponentTable
                rowsBy={[allItems]}
                Component={WrapperComponent}
                codeSnippet={showCode ? "UiNavigationBypass" : undefined}
                align="center"
            />
        </div>
    );
}

export default {
    title: "15 Ui/UiNavigationBypass",
};

export function FullFeaturedNavigationSkip() {
    return <UiNavigationBypassTest />;
}
FullFeaturedNavigationSkip.parameters = { kind: "full-featured navigation skip" };

export const Themed = () => wrapWithTheme(<UiNavigationBypassTest />);
Themed.parameters = { kind: "themed" };

export function Interface() {
    return <UiNavigationBypassTest showCode />;
}
Interface.parameters = { kind: "interface" };
