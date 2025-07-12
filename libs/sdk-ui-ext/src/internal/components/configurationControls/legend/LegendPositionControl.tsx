// (C) 2019-2025 GoodData Corporation
import { PureComponent } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";

import DropdownControl from "../DropdownControl.js";
import { legendPositionDropdownItems } from "../../../constants/dropdowns.js";
import { getTranslatedDropdownItems } from "../../../utils/translations.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { messages } from "../../../../locales.js";

export interface ILegendPositionControl {
    disabled: boolean;
    value: string;
    showDisabledMessage: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

class LegendPositionControl extends PureComponent<ILegendPositionControl & WrappedComponentProps> {
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
