// (C) 2023 GoodData Corporation
import React, { useEffect } from "react";
import set from "lodash/set.js";
import cloneDeep from "lodash/cloneDeep.js";
import { WrappedComponentProps, injectIntl } from "react-intl";

import ConfigSection from "../ConfigSection.js";
import InputControl from "../InputControl.js";
import { messages } from "../../../../locales.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { getTranslation } from "../../../utils/translations.js";
import { isTotalSectionEnabled } from "../../../utils/propertiesHelper.js";

export interface ITotalSectionProps {
    controlsDisabled: boolean;
    properties: IVisualizationProperties;
    propertiesMeta: any;
    pushData: (data: any) => any;
}

const TotalSection: React.FC<ITotalSectionProps & WrappedComponentProps> = (
    props: ITotalSectionProps & WrappedComponentProps,
) => {
    const { intl, controlsDisabled, properties, propertiesMeta, pushData } = props;
    const hasTotalMeasure = properties.controls?.total?.measures?.length > 0;
    const isToggleDisabled = controlsDisabled || hasTotalMeasure;
    //always toggle to false when the control is disabled, otherwise depend on the properties config
    const isTotalEnabled = isToggleDisabled ? false : isTotalSectionEnabled(properties);
    const totalColumnName = properties?.controls?.total?.name;
    const defaultTotalColumnName = getTranslation(messages.totalTitle.id, intl);
    const toggleMessageId = hasTotalMeasure
        ? messages.totalMeasuresTooltip.id
        : !controlsDisabled
        ? messages.totalToggleTooltip.id
        : undefined;

    useEffect(() => {
        if (isTotalEnabled && !totalColumnName) {
            const cloneProperties = cloneDeep(properties);
            set(cloneProperties, "controls.total.name", defaultTotalColumnName);
            pushData({ properties: cloneProperties });
        }
    }, [isTotalEnabled, totalColumnName, defaultTotalColumnName, properties, pushData]);

    return (
        <ConfigSection
            id="total_section"
            className="gd-total-section"
            title={messages.totalTitle.id}
            propertiesMeta={propertiesMeta}
            properties={properties}
            pushData={pushData}
            canBeToggled={true}
            toggleDisabled={isToggleDisabled}
            toggledOn={isTotalEnabled}
            valuePath="total.enabled"
            showDisabledMessage={true}
            toggleMessageId={toggleMessageId}
        >
            <InputControl
                type="text"
                properties={properties}
                labelText={messages.totalNameLabel.id}
                valuePath="total.name"
                disabled={!isTotalEnabled}
                placeholder={messages.totalTitle.id}
                pushData={pushData}
                value={totalColumnName}
            />
        </ConfigSection>
    );
};

export default injectIntl(React.memo(TotalSection));
