// (C) 2019 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import get from "lodash/get";
import DropdownControl from "./DropdownControl";

import { dataPointsDropdownLabels } from "../../constants/dropdowns";
import { getTranslatedDropdownItems } from "../../utils/translations";
import { IVisualizationProperties } from "../../interfaces/Visualization";

export interface IDataPointsControlProps {
    pushData: (data: any) => any;
    properties: IVisualizationProperties;
    isDisabled: boolean;
    showDisabledMessage?: boolean;
    defaultValue?: string | boolean;
}

class DataPointsControl extends React.Component<IDataPointsControlProps & WrappedComponentProps> {
    public static defaultProps = {
        defaultValue: "auto",
        showDisabledMessage: false,
    };
    public render() {
        const { pushData, properties, intl, isDisabled, showDisabledMessage, defaultValue } = this.props;
        const dataPoints = get(properties, "controls.dataPoints.visible", defaultValue);

        return (
            <div className="s-data-labels-config">
                <DropdownControl
                    value={dataPoints}
                    valuePath="dataPoints.visible"
                    labelText="properties.canvas.dataPoints"
                    disabled={isDisabled}
                    properties={properties}
                    pushData={pushData}
                    items={getTranslatedDropdownItems(dataPointsDropdownLabels, intl)}
                    showDisabledMessage={showDisabledMessage}
                />
            </div>
        );
    }
}

export default injectIntl(DataPointsControl);
