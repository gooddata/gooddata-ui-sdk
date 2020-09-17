// (C) 2020 GoodData Corporation
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
    value?: string | boolean;
    defaultValue?: string | boolean;
}

class DataPointsControl extends React.Component<IDataPointsControlProps & WrappedComponentProps> {
    public static defaultProps = {
        defaultValue: true,
        showDisabledMessage: false,
        value: "",
    };
    public render() {
        const {
            pushData,
            properties,
            intl,
            isDisabled,
            showDisabledMessage,
            value,
            defaultValue,
        } = this.props;
        const dataPoints = get(properties, "controls.dataPoints.visible", defaultValue);

        return (
            <div className="s-data-points-config">
                <DropdownControl
                    value={value !== "" ? value : dataPoints}
                    pushInitialValue={value !== ""}
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
