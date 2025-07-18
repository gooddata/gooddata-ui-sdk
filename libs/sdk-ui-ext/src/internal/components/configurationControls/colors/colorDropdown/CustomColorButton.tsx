// (C) 2019-2025 GoodData Corporation
import { PureComponent } from "react";
import { Button } from "@gooddata/sdk-ui-kit";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { getTranslation } from "../../../../utils/translations.js";
import { messages } from "../../../../../locales.js";

export interface ICustomColorButtonProps {
    onClick: () => void;
}

class CustomColorButton extends PureComponent<ICustomColorButtonProps & WrappedComponentProps> {
    public render() {
        return (
            <div className="gd-color-drop-down-custom-section">
                <Button
                    value={getTranslation(messages.customColor.id, this.props.intl)}
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
