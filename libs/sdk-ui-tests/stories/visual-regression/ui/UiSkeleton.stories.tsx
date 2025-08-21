// (C) 2025 GoodData Corporation

import { ComponentTable, propCombinationsFor, UiSkeleton, UiSkeletonProps } from "@gooddata/sdk-ui-kit";
import React from "react";
import { wrapWithTheme } from "../themeWrapper.js";

export default {
    title: "15 Ui/UiSkeleton",
};

const propCombination = propCombinationsFor({
    itemWidth: 100,
    direction: "row",
    itemHeight: 15,
    itemsCount: 1,
} as UiSkeletonProps);

const itemWidth = propCombination("itemWidth", [100], { itemsCount: 3 });
const differentItemWidths = propCombination("itemWidth", [[50, 100, 150]], { itemsCount: 3 });
const itemsGap = propCombination("itemsGap", [30], { itemsCount: 3, itemWidth: 85 });
const itemHeight = propCombination("itemHeight", [25], { itemWidth: 320 });
const column = propCombination("direction", ["column"], { itemsCount: 3, itemHeight: 50, itemWidth: 15 });

const UiSkeletonExample = ({ showCode }: { showCode?: boolean }) => (
    <div className="screenshot-target">
        <ComponentTable
            rowsBy={[itemWidth, differentItemWidths, itemsGap, itemHeight, column]}
            Component={UiSkeleton}
            codeSnippet={showCode ? "UiSkeleton" : undefined}
        />
    </div>
);

export const Default = () => <UiSkeletonExample />;
Default.parameters = { kind: "default", screenshot: true };
export const Themed = () => wrapWithTheme(<UiSkeletonExample />);
Themed.parameters = { kind: "themed", screenshot: true };
export const Interface = () => <UiSkeletonExample showCode />;
Interface.parameters = { kind: "interface" };
