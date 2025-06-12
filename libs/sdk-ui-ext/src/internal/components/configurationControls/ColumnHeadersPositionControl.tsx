// (C) 2019-2023 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { IInsightDefinition } from "@gooddata/sdk-model";

import DropdownControl from "./DropdownControl.js";

import { columnHeadersPositionDropdownItems } from "../../constants/dropdowns.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { messages } from "../../../locales.js";
import ConfigSubsection from "./ConfigSubsection.js";
import { isSetColumnHeadersPositionToLeftAllowed } from "../../utils/controlsHelper.js";

export interface IColumnHeadersPositionControlProps {
    pushData: (data: any) => any;
    properties: IVisualizationProperties;
    isDisabled: boolean;
    insight: IInsightDefinition;
    showDisabledMessage?: boolean;
    defaultValue?: string;
}

class ColumnHeadersPositionControl extends React.Component<
    IColumnHeadersPositionControlProps & WrappedComponentProps
> {
    public static defaultProps = {
        defaultValue: "top",
        showDisabledMessage: false,
    };
    public render() {
        const { pushData, properties, intl, isDisabled, defaultValue, insight } = this.props;

        const columnHeadersPosition = isSetColumnHeadersPositionToLeftAllowed(insight)
            ? properties?.controls?.columnHeadersPosition ?? defaultValue
            : defaultValue;

        return (
            <ConfigSubsection title={messages.columnHeaderPositionTitle.id}>
                <DropdownControl
                    value={columnHeadersPosition}
                    valuePath="columnHeadersPosition"
                    labelText={messages.columnHeaderPositionLabel.id}
                    disabled={isDisabled}
                    properties={properties}
                    pushData={pushData}
                    items={getTranslatedDropdownItems(columnHeadersPositionDropdownItems, intl)}
                    showDisabledMessage={isDisabled}
                />
            </ConfigSubsection>
        );
    }
}

export default injectIntl(ColumnHeadersPositionControl);
