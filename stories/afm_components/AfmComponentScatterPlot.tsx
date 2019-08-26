// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";

import { ScatterPlot } from "../../src/components/afm/ScatterPlot";
import {
    AFM_TWO_MEASURES_ONE_ATTRIBUTE,
    AFM_TWO_MEASURES_ONE_RENAMED_ATTRIBUTE,
    AFM_TWO_MEASURES_ONE_ATTRIBUTE_SCATTER_MD_OBJECT,
} from "../data/afmComponentProps";
import { CUSTOM_COLORS } from "../data/colors";
import { onErrorHandler } from "../mocks";
import "../../styles/css/charts.css";
import { GERMAN_SEPARATORS } from "../data/numberFormat";

storiesOf("AFM components/ScatterPlot", module)
    .add("two measures, one attribute", () =>
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <ScatterPlot
                    projectId="storybook"
                    afm={AFM_TWO_MEASURES_ONE_ATTRIBUTE}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        mdObject: AFM_TWO_MEASURES_ONE_ATTRIBUTE_SCATTER_MD_OBJECT,
                    }}
                />
            </div>,
        ),
    )
    .add("two measures, one renamed attribute", () =>
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <ScatterPlot
                    projectId="storybook"
                    afm={AFM_TWO_MEASURES_ONE_RENAMED_ATTRIBUTE}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        mdObject: AFM_TWO_MEASURES_ONE_ATTRIBUTE_SCATTER_MD_OBJECT,
                    }}
                />
            </div>,
        ),
    )
    .add("custom colors", () =>
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <ScatterPlot
                    projectId="storybook"
                    afm={AFM_TWO_MEASURES_ONE_RENAMED_ATTRIBUTE}
                    config={{
                        colors: CUSTOM_COLORS,
                        mdObject: AFM_TWO_MEASURES_ONE_ATTRIBUTE_SCATTER_MD_OBJECT,
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("with German number format in tooltip", () =>
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <ScatterPlot
                    projectId="storybook"
                    afm={AFM_TWO_MEASURES_ONE_RENAMED_ATTRIBUTE}
                    config={{
                        colors: CUSTOM_COLORS,
                        mdObject: AFM_TWO_MEASURES_ONE_ATTRIBUTE_SCATTER_MD_OBJECT,
                        ...GERMAN_SEPARATORS,
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    );
