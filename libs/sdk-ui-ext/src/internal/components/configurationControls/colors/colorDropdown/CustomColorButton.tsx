// (C) 2019 GoodData Corporation
import React from "react";
import { Button } from "@gooddata/sdk-ui-kit";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { getTranslation } from "../../../../utils/translations";

export interface ICustomColorButtonProps {
    onClick: () => void;
}

class CustomColorButton extends React.PureComponent<ICustomColorButtonProps & WrappedComponentProps> {
    public render() {
        return (
            <div className="gd-color-drop-down-custom-section">
                <Button
                    value={getTranslation("gs.color-dropdown.custom-color", this.props.intl)}
                    className="gd-button-link gd-color-drop-down-custom-section-button s-custom-section-button"
                    onClick={this.onClick}
                />
            </div>
        );
    }

    private onClick = () => {
        this.props.onClick();
    };
}

export default injectIntl(CustomColorButton);
