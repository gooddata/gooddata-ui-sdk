// (C) 2023 GoodData Corporation
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import {
    Headline,
    IHeadlineProps,
    CalculateAs,
    ComparisonPositionValues,
    IColorConfig,
    IComparison,
} from "@gooddata/sdk-ui-charts";
import { IColorPalette, modifyMeasure } from "@gooddata/sdk-model";

import { scenariosFor } from "../../../src/index.js";

const amountCustomIdentifier = modifyMeasure(ReferenceMd.Amount, (m) =>
    m.alias("Custom Amount").localId("custom_amount_local_id"),
);

const comparisonCustomPalette: IColorPalette = [
    {
        guid: "positive",
        fill: {
            r: 195,
            g: 49,
            b: 73,
        },
    },
    {
        guid: "negative",
        fill: {
            r: 168,
            g: 194,
            b: 86,
        },
    },
    {
        guid: "equals",
        fill: {
            r: 243,
            g: 217,
            b: 177,
        },
    },
];

const comparisonColorConfig: IColorConfig = {
    positive: {
        type: "rgb",
        value: { r: 191, g: 64, b: 191 },
    },
    negative: {
        type: "guid",
        value: "positive",
    },
    equals: {
        type: "guid",
        value: "any-value",
    },
};

export const HeadlinePositiveComparisonMeasures = {
    primaryMeasure: ReferenceMd.Amount,
    secondaryMeasures: [ReferenceMd.Won],
};

export const HeadlineNegativeComparisonMeasures = {
    primaryMeasure: ReferenceMd.Won,
    secondaryMeasures: [ReferenceMd.Amount],
};

export const HeadlineEqualsComparisonMeasures = {
    primaryMeasure: ReferenceMd.Amount,
    secondaryMeasures: [amountCustomIdentifier],
};

export const comparisonEnabled: IComparison = {
    enabled: true,
};

export const comparisonDisabled: IComparison = {
    enabled: false,
};

export default scenariosFor<IHeadlineProps>("Headline", Headline)
    .withGroupNames("comparison")
    .withDefaultTestTypes("visual")
    .withDefaultBackendSettings({
        enableNewHeadline: true,
    })
    .addScenario("comparison with default config", {
        ...HeadlinePositiveComparisonMeasures,
        config: {
            comparison: comparisonEnabled,
        },
    })
    .addScenario("comparison with default config with secondary measure is PoP", {
        primaryMeasure: ReferenceMd.Won,
        secondaryMeasures: [ReferenceMdExt.WonPopClosedYear],
        config: {
            comparison: comparisonEnabled,
        },
    })
    .addScenario("comparison with calculate as different and default format", {
        ...HeadlinePositiveComparisonMeasures,
        config: {
            comparison: {
                ...comparisonEnabled,
                calculationType: CalculateAs.DIFFERENCE,
            },
        },
    })
    .addScenario("comparison with calculate as change (difference) and default sub format", {
        ...HeadlinePositiveComparisonMeasures,
        config: {
            comparison: {
                ...comparisonEnabled,
                calculationType: CalculateAs.CHANGE_DIFFERENCE,
            },
        },
    })
    .addScenario("comparison with calculate as change (difference) and custom format", {
        ...HeadlinePositiveComparisonMeasures,
        config: {
            comparison: {
                ...comparisonEnabled,
                colorConfig: {
                    disabled: true,
                },
                calculationType: CalculateAs.CHANGE_DIFFERENCE,
                format: "[color=d2ccde]#,##0.0",
                subFormat: "[color=9c46b5]#,##0.00",
            },
        },
    })
    .addScenario("comparison with decimal-1 format", {
        ...HeadlinePositiveComparisonMeasures,
        config: {
            comparison: {
                ...comparisonEnabled,
                format: "#,##0.0",
            },
        },
    })
    .addScenario("comparison with custom format", {
        ...HeadlinePositiveComparisonMeasures,
        config: {
            comparison: {
                ...comparisonEnabled,
                format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
            },
        },
    })
    .addScenario("comparison with positive arrow", {
        ...HeadlinePositiveComparisonMeasures,
        config: {
            comparison: {
                ...comparisonEnabled,
                format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                isArrowEnabled: true,
            },
        },
    })
    .addScenario("comparison with positive arrow and color", {
        ...HeadlinePositiveComparisonMeasures,
        config: {
            colorPalette: comparisonCustomPalette,
            comparison: {
                ...comparisonEnabled,
                format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                isArrowEnabled: true,
                colorConfig: comparisonColorConfig,
            },
        },
    })
    .addScenario("comparison with negative arrow", {
        ...HeadlineNegativeComparisonMeasures,
        config: {
            comparison: {
                ...comparisonEnabled,
                format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                isArrowEnabled: true,
                colorConfig: {
                    ...comparisonColorConfig,
                    disabled: true,
                },
            },
        },
    })
    .addScenario("comparison with negative arrow and color", {
        ...HeadlineNegativeComparisonMeasures,
        config: {
            colorPalette: comparisonCustomPalette,
            comparison: {
                ...comparisonEnabled,
                format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                isArrowEnabled: true,
                colorConfig: comparisonColorConfig,
            },
        },
    })
    .addScenario("comparison with equals arrow", {
        ...HeadlineEqualsComparisonMeasures,
        config: {
            colorPalette: comparisonCustomPalette,
            comparison: {
                ...comparisonEnabled,
                format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                isArrowEnabled: true,
                colorConfig: {
                    ...comparisonColorConfig,
                    disabled: true,
                },
            },
        },
    })
    .addScenario("comparison with equals arrow and color", {
        ...HeadlineEqualsComparisonMeasures,
        config: {
            colorPalette: comparisonCustomPalette,
            comparison: {
                ...comparisonEnabled,
                format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                isArrowEnabled: true,
                colorConfig: comparisonColorConfig,
            },
        },
    })
    .addScenario("comparison with custom label", {
        ...HeadlinePositiveComparisonMeasures,
        config: {
            colorPalette: comparisonCustomPalette,
            comparison: {
                ...comparisonEnabled,
                format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                isArrowEnabled: true,
                colorConfig: comparisonColorConfig,
                labelConfig: {
                    unconditionalValue: "Custom label",
                },
            },
        },
    })
    .addScenario("comparison with position on top", {
        ...HeadlinePositiveComparisonMeasures,
        config: {
            comparison: {
                ...comparisonEnabled,
                format: "$#,##0.00",
                isArrowEnabled: true,
                position: ComparisonPositionValues.TOP,
            },
        },
    })
    .addScenario("comparison with position on right", {
        ...HeadlinePositiveComparisonMeasures,
        config: {
            comparison: {
                ...comparisonEnabled,
                format: "$#,##0.00",
                isArrowEnabled: true,
                position: ComparisonPositionValues.RIGHT,
            },
        },
    });
