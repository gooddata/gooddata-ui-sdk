// (C) 2019 GoodData Corporation
import * as React from "react";
import { InjectedIntl } from "react-intl";
import get = require("lodash/get");
import DropdownControl from "./DropdownControl";

import { dataLabelsDropdownItems } from "../../constants/dropdowns";
import { getTranslatedDropdownItems } from "../../utils/translations";
import { IVisualizationProperties } from "../../interfaces/Visualization";

export interface IDataLabelsControlProps {
    pushData: (data: any) => any;
    properties: IVisualizationProperties;
    intl: InjectedIntl;
    isDisabled: boolean;
    showDisabledMessage?: boolean;
    defaultValue?: string | boolean;
}

export default class DataLabelsControl extends React.Component<IDataLabelsControlProps> {
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
                    intl={intl}
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
