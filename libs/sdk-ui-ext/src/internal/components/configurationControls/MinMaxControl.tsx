// (C) 2019-2025 GoodData Corporation
import { useCallback, useEffect, useState } from "react";

import { useIntl } from "react-intl";

import { Message } from "@gooddata/sdk-ui-kit";

import ConfigSubsection from "../configurationControls/ConfigSubsection.js";
import InputControl from "../configurationControls/InputControl.js";

import { IMinMaxControlProps, IMinMaxControlState } from "../../interfaces/MinMaxControl.js";
import { minInputValidateAndPushData, maxInputValidateAndPushData } from "../../utils/controlsHelper.js";
import { messages } from "../../../locales.js";

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

export default function MinMaxControl(props: IMinMaxControlProps) {
    const intl = useIntl();

    const { properties, basePath, isDisabled, propertiesMeta } = props;

    const [state, setState] = useState<IMinMaxControlState>(defaultMinMaxControlState);

    useEffect(() => {
        if (propertiesMeta?.undoApplied) {
            setState(defaultMinMaxControlState);
        }
    }, [propertiesMeta?.undoApplied]);

    const axisProps = properties?.controls?.[basePath] || {};
    const axisScaleMin = axisProps?.min ?? "";
    const axisScaleMax = axisProps?.max ?? "";
    const axisVisible = axisProps?.visible ?? true;

    const minScaleHasIncorrectValue = () => state.minScale?.incorrectValue !== "";
    const maxScaleHasIncorrectValue = () => state.maxScale?.incorrectValue !== "";
    const minScaleHasWarning = () => state.minScale?.hasWarning ?? false;
    const maxScaleHasWarning = () => state.maxScale?.hasWarning ?? false;

    const renderMinErrorMessage = () => {
        const msg = state.minScale?.warningMessage ?? "";
        if (!minScaleHasWarning() || msg === "") return null;
        return (
            <Message type="warning" className="adi-input-warning">
                {msg}
            </Message>
        );
    };

    const renderMaxErrorMessage = () => {
        const msg = state.maxScale?.warningMessage ?? "";
        if (!maxScaleHasWarning() || msg === "") return null;
        return (
            <Message type="warning" className="adi-input-warning">
                {msg}
            </Message>
        );
    };

    const minInputValidateAndPushDataCallback = useCallback(
        (data: any) => {
            minInputValidateAndPushData(data, state, props, intl, setState, defaultMinMaxControlState);
        },
        [state, props],
    );

    const maxInputValidateAndPushDataCallback = useCallback(
        (data: any) => {
            maxInputValidateAndPushData(data, state, props, intl, setState, defaultMinMaxControlState);
        },
        [state, props],
    );

    return (
        <ConfigSubsection title={messages.axisScale.id}>
            <InputControl
                valuePath={`${basePath}.min`}
                labelText={messages.axisMin.id}
                placeholder={messages.autoPlaceholder.id}
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
                labelText={messages.axisMax.id}
                placeholder={messages.autoPlaceholder.id}
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
