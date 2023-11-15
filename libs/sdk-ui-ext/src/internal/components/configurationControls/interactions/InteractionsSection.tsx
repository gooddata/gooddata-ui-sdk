// (C) 2023 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";

import ConfigSection from "../ConfigSection.js";
import { messages } from "../../../../locales.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import CheckboxControl from "../CheckboxControl.js";

export interface IInteractionsSectionProps {
    controlsDisabled: boolean;
    properties: IVisualizationProperties;
    propertiesMeta: any;
    pushData: (data: any) => any;
}

const InteractionsSection: React.FC<IInteractionsSectionProps & WrappedComponentProps> = (
    props: IInteractionsSectionProps & WrappedComponentProps,
) => {
    const { controlsDisabled, properties, propertiesMeta, pushData } = props;
    const isDrillDownDisabled = properties?.controls?.disableDrillDown ?? false;

    return (
        <ConfigSection
            id="interactions_section"
            className="gd-interactions-section"
            title={messages.interactions.id}
            propertiesMeta={propertiesMeta}
        >
            <CheckboxControl
                valuePath="disableDrillDown"
                labelText={messages.interactionsDrillDown.id}
                properties={properties}
                disabled={controlsDisabled}
                checked={!isDrillDownDisabled}
                pushData={pushData}
                isValueInverted={true}
            />
        </ConfigSection>
    );
};

export default injectIntl(React.memo(InteractionsSection));
