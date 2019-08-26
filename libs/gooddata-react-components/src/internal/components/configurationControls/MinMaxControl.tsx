// (C) 2019 GoodData Corporation
import * as React from "react";
import get = require("lodash/get");
import Message from "@gooddata/goodstrap/lib/Messages/Message";
import { InjectedIntlProps, injectIntl } from "react-intl";

import ConfigSubsection from "../configurationControls/ConfigSubsection";
import InputControl from "../configurationControls/InputControl";

import { IMinMaxControlProps, IMinMaxControlState } from "../../interfaces/MinMaxControl";
import { minInputValidateAndPushData, maxInputValidateAndPushData } from "../../utils/controlsHelper";

const defaultMinMaxControlState = {
    minScale: {
        hasWarning: false,
        warningMessage: "",
        incorrectValue: "",
    },
    maxScale: {
        hasWarning: false,
        warningMessage: "",
        incorrectValue: "",
    },
};

class MinMaxControl extends React.Component<IMinMaxControlProps & InjectedIntlProps, IMinMaxControlState> {
    public static getDerivedStateFromProps(props: IMinMaxControlProps & InjectedIntlProps) {
        if (get(props, ["propertiesMeta", "undoApplied"], false)) {
            return defaultMinMaxControlState;
        }

        return null;
    }

    constructor(props: IMinMaxControlProps & InjectedIntlProps) {
        super(props);
        this.state = defaultMinMaxControlState;
    }

    public render() {
        return this.renderMinMaxSection();
    }

    private renderMinMaxSection() {
        const { properties, basePath, isDisabled } = this.props;
        const axisScaleMin = get(this.props, `properties.controls.${basePath}.min`, "");
        const axisScaleMax = get(this.props, `properties.controls.${basePath}.max`, "");
        const axisVisible = get(this.props, `properties.controls.${basePath}.visible`, true);

        return (
            <ConfigSubsection title="properties.axis.scale">
                <InputControl
                    valuePath={`${basePath}.min`}
                    labelText="properties.axis.min"
                    placeholder="properties.auto_placeholder"
                    type="number"
                    hasWarning={this.minScaleHasWarning()}
                    value={
                        this.minScaleHasIncorrectValue()
                            ? get(this.state, "minScale.incorrectValue")
                            : axisScaleMin
                    }
                    disabled={isDisabled || !axisVisible}
                    properties={properties}
                    pushData={this.minInputValidateAndPushDataCallback}
                />
                {this.renderMinErrorMessage()}

                <InputControl
                    valuePath={`${basePath}.max`}
                    labelText="properties.axis.max"
                    placeholder="properties.auto_placeholder"
                    type="number"
                    hasWarning={this.maxScaleHasWarning()}
                    value={
                        this.maxScaleHasIncorrectValue()
                            ? get(this.state, "maxScale.incorrectValue")
                            : axisScaleMax
                    }
                    disabled={isDisabled || !axisVisible}
                    properties={properties}
                    pushData={this.maxInputValidateAndPushDataCallback}
                />
                {this.renderMaxErrorMessage()}
            </ConfigSubsection>
        );
    }

    private minInputValidateAndPushDataCallback = (data: any): void => {
        minInputValidateAndPushData(
            data,
            this.state,
            this.props,
            this.setState.bind(this),
            defaultMinMaxControlState,
        );
    };

    private maxInputValidateAndPushDataCallback = (data: any): void => {
        maxInputValidateAndPushData(
            data,
            this.state,
            this.props,
            this.setState.bind(this),
            defaultMinMaxControlState,
        );
    };

    private minScaleHasIncorrectValue() {
        return get(this.state, "minScale.incorrectValue", "") !== "";
    }

    private maxScaleHasIncorrectValue() {
        return get(this.state, "maxScale.incorrectValue", "") !== "";
    }

    private minScaleHasWarning() {
        return get(this.state, "minScale.hasWarning", false);
    }

    private maxScaleHasWarning() {
        return get(this.state, "maxScale.hasWarning", false);
    }

    private renderMinErrorMessage() {
        const minScaleWarningMessage = get(this.state, "minScale.warningMessage", "");
        if (!this.minScaleHasWarning() || minScaleWarningMessage === "") {
            return false;
        }

        return (
            <Message type="warning" className="adi-input-warning">
                {minScaleWarningMessage}
            </Message>
        );
    }

    private renderMaxErrorMessage() {
        const maxScaleWarningMessage = get(this.state, "maxScale.warningMessage", "");
        if (!this.maxScaleHasWarning() || maxScaleWarningMessage === "") {
            return false;
        }

        return (
            <Message type="warning" className="adi-input-warning">
                {maxScaleWarningMessage}
            </Message>
        );
    }
}

export default injectIntl(MinMaxControl);
