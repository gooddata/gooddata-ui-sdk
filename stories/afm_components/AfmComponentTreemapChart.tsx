// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";

import { onErrorHandler } from "../mocks";
import { Treemap } from "../../src/components/afm/Treemap";
import { CUSTOM_COLORS } from "../data/colors";
import {
    AFM_ONE_MEASURE_ONE_ATTRIBUTE,
    AFM_TWO_MEASURES,
    AFM_ONE_RENAMED_MEASURE_ONE_RENAMED_ATTRIBUTE,
    AFM_ARITHMETIC_MEASURES,
} from "../data/afmComponentProps";

import "../../styles/css/charts.css";
import { GERMAN_SEPARATORS } from "../data/numberFormat";

const wrapperStyle = { width: 600, height: 300 };

storiesOf("AFM components/Treemap", module)
    .add("two measures", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap projectId="storybook" afm={AFM_TWO_MEASURES} onError={onErrorHandler} />
            </div>,
        ),
    )
    .add("measure and attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap projectId="storybook" afm={AFM_ONE_MEASURE_ONE_ATTRIBUTE} onError={onErrorHandler} />
            </div>,
        ),
    )
    .add("renamed measure and renamed attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    afm={AFM_ONE_RENAMED_MEASURE_ONE_RENAMED_ATTRIBUTE}
                    onError={onErrorHandler}
                />
            </div>,
        ),
    )
    .add("legend on the bottom", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_ONE_ATTRIBUTE}
                    config={{ legend: { position: "bottom" } }}
                    onError={onErrorHandler}
                />
            </div>,
        ),
    )
    .add("custom colors", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_ONE_ATTRIBUTE}
                    config={{ colors: CUSTOM_COLORS }}
                    onError={onErrorHandler}
                />
            </div>,
        ),
    )
    .add("with German number format", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_ONE_ATTRIBUTE}
                    config={GERMAN_SEPARATORS}
                    onError={onErrorHandler}
                />
            </div>,
        ),
    )
    .add("arithmetic measures", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    afm={AFM_ARITHMETIC_MEASURES}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    );
