// (C) 2019 GoodData Corporation
import * as React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import get = require("lodash/get");
import DropdownControl from "./DropdownControl";

import { dataLabelsDropdownItems } from "../../constants/dropdowns";
import { getTranslatedDropdownItems } from "../../utils/translations";
import { IVisualizationProperties } from "../../interfaces/Visualization";

export interface IDataLabelsControlProps {
    pushData: (data: any) => any;
    properties: IVisualizationProperties;
    isDisabled: boolean;
    showDisabledMessage?: boolean;
    defaultValue?: string | boolean;
}

class DataLabelsControl extends React.Component<IDataLabelsControlProps & WrappedComponentProps> {
    public static defaultProps = {
        defaultValue: "auto",
        showDisabledMessage: false,
    };
    public render() {
        const { pushData, properties, intl, isDisabled, showDisabledMessage, defaultValue } = this.props;
        const dataLabels = get(properties, "controls.dataLabels.visible", defaultValue);

        return (
            <div className="s-data-labels-config">
                <DropdownControl
                    value={dataLabels}
                    valuePath="dataLabels.visible"
                    labelText="properties.canvas.dataLabels"
                    disabled={isDisabled}
                    properties={properties}
                    pushData={pushData}
                    items={getTranslatedDropdownItems(dataLabelsDropdownItems, intl)}
                    showDisabledMessage={showDisabledMessage}
                />
            </div>
        );
    }
}

export default injectIntl(DataLabelsControl);
