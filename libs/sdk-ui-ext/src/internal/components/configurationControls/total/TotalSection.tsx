// (C) 2023 GoodData Corporation
import React, { useEffect } from "react";
import set from "lodash/set";
import cloneDeep from "lodash/cloneDeep";
import { WrappedComponentProps, injectIntl } from "react-intl";

import ConfigSection from "../ConfigSection";
import InputControl from "../InputControl";
import { messages } from "../../../../locales";
import { IVisualizationProperties } from "../../../interfaces/Visualization";
import { getTranslation } from "../../../utils/translations";
import { isTotalSectionEnabled } from "../../../utils/propertiesHelper";

interface ITotalSectionProps {
    controlsDisabled: boolean;
    properties: IVisualizationProperties;
    propertiesMeta: any;
    pushData: (data: any) => any;
}

const TotalSection: React.FC<ITotalSectionProps & WrappedComponentProps> = (
    props: ITotalSectionProps & WrappedComponentProps,
) => {
    const { intl, controlsDisabled, properties, propertiesMeta, pushData } = props;
    //always toggle to false when the control is disabled, otherwise depend on the properties config
    const isTotalEnabled = controlsDisabled ? false : isTotalSectionEnabled(properties);
    const totalColumnName = properties?.controls?.total?.name;
    const defaultTotalColumnName = getTranslation(messages.totalTitle.id, intl);

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
            toggleDisabled={controlsDisabled}
            toggledOn={isTotalEnabled}
            valuePath="total.enabled"
            showDisabledMessage={true}
            toggleMessageId={!controlsDisabled ? messages.totalToggleTooltip.id : undefined}
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
