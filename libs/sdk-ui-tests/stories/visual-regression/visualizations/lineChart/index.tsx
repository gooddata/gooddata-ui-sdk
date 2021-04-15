// (C) 2007-2021 GoodData Corporation
import React, { useState } from "react";
import { storiesOf } from "@storybook/react";
import { LineChart } from "@gooddata/sdk-ui-charts";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { StorybookBackend, ReferenceWorkspaceId } from "../../../_infra/backend";
import { CustomStories } from "../../../_infra/storyGroups";
import { withScreenshot } from "../../../_infra/backstopWrapper";
import { ScreenshotReadyWrapper, createElementCountResolver } from "../../../_infra/ScreenshotReadyWrapper";

const backend = StorybookBackend();
const config = {
    enableCompactSize: true,
};

export const LineChartResponsive: React.FC = () => {
    const [height, setHeight] = useState(300);
    const [width, setWidth] = useState(600);

    return (
        <React.Fragment>
            <button onClick={() => setHeight(300)}>Height 300</button>
            <button onClick={() => setHeight(150)}>Height 150</button>
            <button onClick={() => setHeight(100)}>Height 100</button>

            <button onClick={() => setWidth(600)}>Width 600</button>
            <button onClick={() => setWidth(130)}>Width 130</button>
            <button onClick={() => setWidth(50)}>Width 50</button>
            <div style={{ width, height, border: "1px solid black" }}>
                <LineChart
                    backend={backend}
                    config={config}
                    width={width}
                    height={height}
                    workspace={ReferenceWorkspaceId}
                    measures={[ReferenceLdm.Amount]}
                    trendBy={ReferenceLdm.CreatedQuarterYear}
                />
            </div>
        </React.Fragment>
    );
};

storiesOf(`${CustomStories}/Line Chart`, module).add("responsive", () =>
    withScreenshot(
        <ScreenshotReadyWrapper resolver={createElementCountResolver(2)}>
            <LineChartResponsive />
        </ScreenshotReadyWrapper>,
    ),
);
