// (C) 2023-2025 GoodData Corporation

import { ReactNode } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { ConfigurationPanelContent, IConfigurationPanelContentProps } from "./ConfigurationPanelContent.js";
import {
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
    HIDE_DELAY_DEFAULT,
    SHOW_DELAY_DEFAULT,
} from "../../constants/bubble.js";
import { IHeadlinePanelConfig } from "../../interfaces/ConfigurationPanel.js";
import {
    getComparisonDefaultCalculationType,
    isComparisonEnabled,
} from "../../utils/uiConfigHelpers/headlineUiConfigHelper.js";
import { ComparisonSection } from "../configurationControls/comparison/ComparisonSection.js";

const BUBBLE_ARROW_OFFSETS = { "tc bc": [BUBBLE_ARROW_OFFSET_X, BUBBLE_ARROW_OFFSET_Y] };
const BUBBLE_ALIGN_POINTS = [{ align: "tc bc" }];

export class HeadlineConfigurationPanel extends ConfigurationPanelContent<
    IConfigurationPanelContentProps<IHeadlinePanelConfig>
> {
    protected renderConfigurationPanel(): ReactNode {
        const { insight, propertiesMeta, properties, pushData, panelConfig } = this.props;

        const controlDisabled = this.isControlDisabled();
        const comparisonDisabled = !isComparisonEnabled(insight);
        const defaultCalculationType = getComparisonDefaultCalculationType(insight);

        const bubbleClassNames = cx("bubble-primary", { invisible: !controlDisabled });

        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    <ComparisonSection
                        controlDisabled={controlDisabled}
                        disabledByVisualization={comparisonDisabled}
                        defaultCalculationType={defaultCalculationType}
                        separators={panelConfig.separators}
                        colorPalette={panelConfig.comparisonColorPalette}
                        properties={properties}
                        propertiesMeta={propertiesMeta}
                        pushData={pushData}
                    />
                    {this.renderInteractionsSection()}
                    {this.renderAdvancedSection()}
                </div>
                <Bubble
                    className={bubbleClassNames}
                    arrowOffsets={BUBBLE_ARROW_OFFSETS}
                    alignPoints={BUBBLE_ALIGN_POINTS}
                >
                    <FormattedMessage id="properties.config.not_applicable" />
                </Bubble>
            </BubbleHoverTrigger>
        );
    }
}
