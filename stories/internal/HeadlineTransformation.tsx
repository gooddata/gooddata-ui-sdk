// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { screenshotWrap } from "@gooddata/test-storybook";
import { wrap } from "../utils/wrap";
import HeadlineTransformation from "../../src/components/visualizations/headline/HeadlineTransformation";
import { headlineWithOneMeasure } from "../data/headlineExecutionFixtures";
import "../../styles/scss/headline.scss";
import { GERMAN_SEPARATORS } from "../data/numberFormat";

storiesOf("Internal/HeadlineTransformation", module).add(
    "HeadlineTransformation with German number format",
    () =>
        screenshotWrap(
            wrap(
                <HeadlineTransformation
                    executionRequest={headlineWithOneMeasure.executionRequest}
                    executionResponse={headlineWithOneMeasure.executionResponse}
                    executionResult={headlineWithOneMeasure.executionResult}
                    drillableItems={[
                        {
                            identifier: "af2Ewj9Re2vK",
                            uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                        },
                    ]}
                    config={GERMAN_SEPARATORS}
                    onFiredDrillEvent={action("onFiredDrillEvent")}
                    onAfterRender={action("onAfterRender")}
                />,
                "auto",
                300,
            ),
        ),
);
