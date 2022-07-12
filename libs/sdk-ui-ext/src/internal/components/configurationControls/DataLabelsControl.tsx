// (C) 2019-2022 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import DropdownControl from "./DropdownControl";

import { dataLabelsDropdownItems } from "../../constants/dropdowns";
import { getTranslatedDropdownItems } from "../../utils/translations";
import { IVisualizationProperties } from "../../interfaces/Visualization";
import { messages } from "../../../locales";

export interface IDataLabelsControlProps {
    pushData: (data: any) => any;
    properties: IVisualizationProperties;
    isDisabled: boolean;
    isTotalsDisabled?: boolean;
    showDisabledMessage?: boolean;
    defaultValue?: string | boolean;
    enableSeparateTotalLabels?: boolean;
}

class DataLabelsControl extends React.Component<IDataLabelsControlProps & WrappedComponentProps> {
    public static defaultProps = {
        defaultValue: "auto",
        showDisabledMessage: false,
        isTotalsDisabled: true,
        enableSeparateTotalLabels: false,
    };
    public render() {
        const {
            pushData,
            properties,
            intl,
            isDisabled,
            showDisabledMessage,
            defaultValue,
            isTotalsDisabled,
            enableSeparateTotalLabels,
        } = this.props;
        const dataLabels = properties?.controls?.dataLabels?.visible ?? defaultValue;
        const totalLabels = properties?.controls?.dataLabels?.totalsVisible ?? defaultValue;

        return (
            <div className="s-data-labels-config">
                <DropdownControl
                    value={dataLabels}
                    valuePath="dataLabels.visible"
                    labelText={messages.dataLabels.id}
                    disabled={isDisabled}
                    properties={properties}
                    pushData={pushData}
                    items={getTranslatedDropdownItems(dataLabelsDropdownItems, intl)}
                    showDisabledMessage={showDisabledMessage}
                />
                {enableSeparateTotalLabels && (
                    <DropdownControl
                        value={totalLabels}
                        valuePath="dataLabels.totalsVisible"
                        labelText={messages.totalLabels.id}
                        disabled={isTotalsDisabled}
                        properties={properties}
                        pushData={pushData}
                        items={getTranslatedDropdownItems(dataLabelsDropdownItems, intl)}
                        showDisabledMessage={showDisabledMessage}
                    />
                )}
            </div>
        );
    }
}

export default injectIntl(DataLabelsControl);
