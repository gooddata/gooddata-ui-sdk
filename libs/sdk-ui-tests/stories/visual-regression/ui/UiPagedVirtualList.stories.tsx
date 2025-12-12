// (C) 2025 GoodData Corporation

import { UiPagedVirtualList } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const items = Array.from({ length: 100 }, (_, index) => ({
    title: `Item ${index + 1}`,
}));

// eslint-disable-next-line no-restricted-exports
export default {
    title: "15 Ui/UiPagedVirtualList",
};

function RenderItem({ title }: { title: string }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                width: "100px",
                height: "40px",
                padding: "10px",
                backgroundColor: "var(--gd-palette-complementary-0)",
                color: "var(--gd-palette-complementary-9)",
                borderBottom: "1px solid var(--gd-palette-complementary-3)",
                fontFamily: "var(--gd-font-family)",
                fontSize: "14px",
            }}
        >
            {title}
        </div>
    );
}

function UiPagedVirtualListExample() {
    return (
        <div className="screenshot-target">
            <div style={{ width: "100px" }}>
                <UiPagedVirtualList
                    maxHeight={200}
                    itemHeight={40}
                    itemsGap={0}
                    itemPadding={0}
                    items={items}
                    skeletonItemsCount={0}
                    hasNextPage={false}
                >
                    {(item) => <RenderItem title={item.title} />}
                </UiPagedVirtualList>
            </div>
        </div>
    );
}
export function Default() {
    return <UiPagedVirtualListExample />;
}
Default.parameters = { kind: "default", screenshot: true } satisfies IStoryParameters;
export const Themed = () => wrapWithTheme(<UiPagedVirtualListExample />);
Themed.parameters = { kind: "themed", screenshot: true } satisfies IStoryParameters;
