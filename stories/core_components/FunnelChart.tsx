// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";

import { FunnelChart } from "../../src";
import { onErrorHandler } from "../mocks";
import {
    ATTRIBUTE_1,
    MEASURE_1,
    ATTRIBUTE_1_SORT_ITEM,
    MEASURE_2,
    ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
    ARITHMETIC_MEASURE_USING_ARITHMETIC,
} from "../data/componentProps";
import { GERMAN_SEPARATORS } from "../data/numberFormat";

const wrapperStyle = { width: 800, height: 400 };

storiesOf("Core components/FunnelChart", module)
    .add("basic render", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <FunnelChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("sort by attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <FunnelChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    sortBy={[
                        {
                            attributeSortItem: {
                                ...ATTRIBUTE_1_SORT_ITEM.attributeSortItem,
                                direction: "desc",
                            },
                        },
                    ]}
                />
            </div>,
        ),
    )
    .add("with German number format in tooltip", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <FunnelChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    config={GERMAN_SEPARATORS}
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
                <FunnelChart
                    projectId="storybook"
                    measures={[
                        MEASURE_1,
                        MEASURE_2,
                        ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
                        ARITHMETIC_MEASURE_USING_ARITHMETIC,
                    ]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    );
