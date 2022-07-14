// (C) 2019-2022 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";

import DropdownControl from "../DropdownControl";
import { legendPositionDropdownItems } from "../../../constants/dropdowns";
import { getTranslatedDropdownItems } from "../../../utils/translations";
import { IVisualizationProperties } from "../../../interfaces/Visualization";
import { messages } from "../../../../locales";

export interface ILegendPositionControl {
    disabled: boolean;
    value: string;
    showDisabledMessage: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

class LegendPositionControl extends React.PureComponent<ILegendPositionControl & WrappedComponentProps> {
    public render() {
        return (
            <DropdownControl
                value={this.props.value}
                valuePath="legend.position"
                labelText={messages.position.id}
                disabled={this.props.disabled}
                properties={this.props.properties}
                pushData={this.props.pushData}
                items={this.generateDropdownItems()}
                showDisabledMessage={this.props.showDisabledMessage}
            />
        );
    }

    private generateDropdownItems() {
        return getTranslatedDropdownItems(legendPositionDropdownItems, this.props.intl);
    }
}

export default injectIntl(LegendPositionControl);
