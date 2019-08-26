// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";

import { BubbleChart } from "../../src/components/afm/BubbleChart";
import {
    AFM_THREE_MEASURES_ONE_ATTRIBUTE,
    AFM_THREE_MEASURES_ONE_ATTRIBUTE_BUBBLE_MD_OBJECT,
} from "../data/afmComponentProps";
import { CUSTOM_COLORS } from "../data/colors";
import { onErrorHandler } from "../mocks";
import "../../styles/css/charts.css";
import { GERMAN_SEPARATORS } from "../data/numberFormat";

storiesOf("AFM components/BubbleChart", module)
    .add("three measures, one attribute", () =>
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <BubbleChart
                    projectId="storybook"
                    afm={AFM_THREE_MEASURES_ONE_ATTRIBUTE}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        mdObject: AFM_THREE_MEASURES_ONE_ATTRIBUTE_BUBBLE_MD_OBJECT,
                    }}
                />
            </div>,
        ),
    )
    .add("custom colors", () =>
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <BubbleChart
                    projectId="storybook"
                    afm={AFM_THREE_MEASURES_ONE_ATTRIBUTE}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        colors: CUSTOM_COLORS,
                        mdObject: AFM_THREE_MEASURES_ONE_ATTRIBUTE_BUBBLE_MD_OBJECT,
                    }}
                />
            </div>,
        ),
    )
    .add("without grid", () =>
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <BubbleChart
                    projectId="storybook"
                    afm={AFM_THREE_MEASURES_ONE_ATTRIBUTE}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        grid: { enabled: false },
                        mdObject: AFM_THREE_MEASURES_ONE_ATTRIBUTE_BUBBLE_MD_OBJECT,
                    }}
                />
            </div>,
        ),
    )
    .add("with German number format in tooltip", () =>
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <BubbleChart
                    projectId="storybook"
                    afm={AFM_THREE_MEASURES_ONE_ATTRIBUTE}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        mdObject: AFM_THREE_MEASURES_ONE_ATTRIBUTE_BUBBLE_MD_OBJECT,
                        ...GERMAN_SEPARATORS,
                    }}
                />
            </div>,
        ),
    );
