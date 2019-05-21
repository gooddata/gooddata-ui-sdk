// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";

import { ColumnChart } from "../../src/components/afm/ColumnChart";
import {
    AFM_ARITHMETIC_MEASURES_ONE_ATTRIBUTE,
    AFM_ONE_MEASURE_ONE_ATTRIBUTE,
    AFM_TWO_MEASURES_ONE_ATTRIBUTE,
    AFM_TWO_MEASURES_ONE_RENAMED_ATTRIBUTE,
} from "../data/afmComponentProps";
import { CUSTOM_COLORS } from "../data/colors";
import { onErrorHandler } from "../mocks";
import "../../styles/css/charts.css";
import { GERMAN_SEPARATORS } from "../data/numberFormat";

const wrapperStyle = { width: 800, height: 400 };

storiesOf("AFM components/ColumnChart", module)
    .add("two measures, one attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    afm={AFM_TWO_MEASURES_ONE_ATTRIBUTE}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("two measures, one renamed attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    afm={AFM_TWO_MEASURES_ONE_RENAMED_ATTRIBUTE}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("custom colors", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_ONE_ATTRIBUTE}
                    config={{ colors: CUSTOM_COLORS }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("with German number format", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_ONE_ATTRIBUTE}
                    config={{ colors: CUSTOM_COLORS, ...GERMAN_SEPARATORS }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("arithmetic measures", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    afm={AFM_ARITHMETIC_MEASURES_ONE_ATTRIBUTE}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    );
