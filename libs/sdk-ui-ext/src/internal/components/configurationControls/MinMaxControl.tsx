// (C) 2019-2025 GoodData Corporation
import React, { useEffect, useState } from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";

import { Message } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../locales.js";
import { IMinMaxControlProps, IMinMaxControlState } from "../../interfaces/MinMaxControl.js";
import { maxInputValidateAndPushData, minInputValidateAndPushData } from "../../utils/controlsHelper.js";
import ConfigSubsection from "../configurationControls/ConfigSubsection.js";
import InputControl from "../configurationControls/InputControl.js";

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

function MinMaxControl(props: IMinMaxControlProps & WrappedComponentProps) {
    const [state, setState] = useState<IMinMaxControlState>(defaultMinMaxControlState);

    // Handle getDerivedStateFromProps logic
    useEffect(() => {
        if (props.propertiesMeta?.undoApplied) {
            setState(defaultMinMaxControlState);
        }
    }, [props.propertiesMeta?.undoApplied]);

    const minInputValidateAndPushDataCallback = (data: any): void => {
        minInputValidateAndPushData(
            data,
            state,
            props,
            (newState: Partial<IMinMaxControlState>) =>
                setState((prevState) => ({ ...prevState, ...newState })),
            defaultMinMaxControlState,
        );
    };

    const maxInputValidateAndPushDataCallback = (data: any): void => {
        maxInputValidateAndPushData(
            data,
            state,
            props,
            (newState: Partial<IMinMaxControlState>) =>
                setState((prevState) => ({ ...prevState, ...newState })),
            defaultMinMaxControlState,
        );
    };

    const minScaleHasIncorrectValue = () => {
        return (state.minScale?.incorrectValue ?? "") !== "";
    };

    const maxScaleHasIncorrectValue = () => {
        return (state.maxScale?.incorrectValue ?? "") !== "";
    };

    const minScaleHasWarning = () => {
        return state.minScale?.hasWarning ?? false;
    };

    const maxScaleHasWarning = () => {
        return state.maxScale?.hasWarning ?? false;
    };

    const renderMinErrorMessage = () => {
        const minScaleWarningMessage = state.minScale?.warningMessage ?? "";
        if (!minScaleHasWarning() || minScaleWarningMessage === "") {
            return false;
        }

        return (
            <Message type="warning" className="adi-input-warning">
                {minScaleWarningMessage}
            </Message>
        );
    };

    const renderMaxErrorMessage = () => {
        const maxScaleWarningMessage = state.maxScale?.warningMessage ?? "";
        if (!maxScaleHasWarning() || maxScaleWarningMessage === "") {
            return false;
        }

        return (
            <Message type="warning" className="adi-input-warning">
                {maxScaleWarningMessage}
            </Message>
        );
    };

    const { properties, basePath, isDisabled } = props;

    const basePathPropertiesControls = properties?.controls?.[basePath];
    const axisScaleMin = basePathPropertiesControls?.min ?? "";
    const axisScaleMax = basePathPropertiesControls?.max ?? "";
    const axisVisible = basePathPropertiesControls?.visible ?? true;

    return (
        <ConfigSubsection title={messages["axisScale"].id}>
            <InputControl
                valuePath={`${basePath}.min`}
                labelText={messages["axisMin"].id}
                placeholder={messages["autoPlaceholder"].id}
                type="number"
                hasWarning={minScaleHasWarning()}
                value={minScaleHasIncorrectValue() ? state.minScale?.incorrectValue : axisScaleMin}
                disabled={isDisabled || !axisVisible}
                properties={properties}
                pushData={minInputValidateAndPushDataCallback}
            />
            {renderMinErrorMessage()}

            <InputControl
                valuePath={`${basePath}.max`}
                labelText={messages["axisMax"].id}
                placeholder={messages["autoPlaceholder"].id}
                type="number"
                hasWarning={maxScaleHasWarning()}
                value={maxScaleHasIncorrectValue() ? state.maxScale?.incorrectValue : axisScaleMax}
                disabled={isDisabled || !axisVisible}
                properties={properties}
                pushData={maxInputValidateAndPushDataCallback}
            />
            {renderMaxErrorMessage()}
        </ConfigSubsection>
    );
}

export default injectIntl(MinMaxControl);
