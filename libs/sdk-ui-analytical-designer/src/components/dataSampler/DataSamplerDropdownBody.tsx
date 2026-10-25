// (C) 2021-2026 GoodData Corporation

import { useEffect, useState } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { Bubble, BubbleHoverTrigger, Button, InputWithNumberFormat, Message } from "@gooddata/sdk-ui-kit";

interface IDataSamplerDropdownBodyOwnProps {
    onClose: () => void;
    dataSamplePercentageValue: number;
    setDataSamplePercentageValue: (percentage: number) => void;
}

type IDataSamplerProps = IDataSamplerDropdownBodyOwnProps;

const DATA_SAMPLE_MESSAGE = "DataSampleMessage";

export function DataSamplerDropdownBody({
    onClose,
    dataSamplePercentageValue,
    setDataSamplePercentageValue,
}: IDataSamplerProps) {
    const intl = useIntl();
    const [isDismissed, setIsDissmised] = useState(false);
    const [percentageInput, setPercentageInput] = useState(dataSamplePercentageValue);
    const [isPercentageInvalid, setIsPercentageInvalid] = useState(false);

    useEffect(() => {
        setIsDissmised(window.localStorage.getItem(DATA_SAMPLE_MESSAGE) === "Dismissed");
    }, []);

    const onDismiss = () => {
        setIsDissmised(true);
        window.localStorage.setItem(DATA_SAMPLE_MESSAGE, "Dismissed");
    };

    const onApply = () => {
        setDataSamplePercentageValue(percentageInput);
        onClose();
    };

    const onPercentageInputChange = (value: number) => {
        setIsPercentageInvalid(value <= 0 || value >= 100);
        setPercentageInput(value);
    };

    return (
        <div className="adi-data-sampler-dropdown-body dropdown-body">
            <div className="adi-data-sampler-dropdown-body-header">
                <div className="adi-data-sampler-dropdown-body-header-label">
                    {intl.formatMessage({ id: "dataSampler.dropdown.body.header" }).toUpperCase()}
                </div>
                <BubbleHoverTrigger>
                    <span className="gd-icon-circle-question adi-data-sampler-dropdown-body-header-tooltip-icon" />
                    <Bubble alignPoints={[{ align: "bc tr" }]}>
                        <FormattedMessage
                            id="dataSampler.tooltip"
                            values={{ b: (chunks) => <b>{chunks}</b> }}
                        />
                    </Bubble>
                </BubbleHoverTrigger>
            </div>
            <div className="adi-data-sampler-dropdown-body-content">
                <InputWithNumberFormat
                    className={cx("adi-data-sampler-dropdown-body-input", [
                        { "adi-data-sampler-dropdown-body-input-error": isPercentageInvalid },
                    ])}
                    label={intl.formatMessage({ id: "dataSampler.dropdown.body.content.input" })}
                    suffix="%"
                    accessibilityConfig={{
                        suffixAriaLabel: intl.formatMessage({
                            id: "input.unit.percent",
                        }),
                    }}
                    onChange={(value: number) => onPercentageInputChange(value)}
                    placeholder={dataSamplePercentageValue.toString()}
                    autofocus
                    onEnterKeyPress={onApply}
                />
                {isPercentageInvalid ? (
                    <Bubble
                        alignTo={".adi-data-sampler-dropdown-body-input"}
                        alignPoints={[{ align: "bc tc" }]}
                        className="bubble-negative"
                    >
                        {intl.formatMessage({ id: "dataSampler.dropdown.body.content.input.validation" })}
                    </Bubble>
                ) : null}
                {!isDismissed && (
                    <Message type="progress" className="adi-data-sampler-message">
                        {intl.formatMessage({ id: "dataSampler.dropdown.body.content.message" })}
                        <a className="gd-button-link adi-data-sampler-message-dismiss" onClick={onDismiss}>
                            {intl.formatMessage({
                                id: "dataSampler.dropdown.body.content.message.dismiss",
                            })}
                        </a>
                    </Message>
                )}
            </div>
            <div className="adi-data-sampler-dropdown-body-footer">
                <Button
                    className="gd-button-secondary gd-button-small s-data-sampler-dropdown-cancel"
                    onClick={onClose}
                    value={intl.formatMessage({ id: "cancel" })}
                />
                <Button
                    className="gd-button-action gd-button-small s-data-sampler-dropdown-apply"
                    onClick={onApply}
                    value={intl.formatMessage({ id: "apply" })}
                    disabled={isPercentageInvalid}
                />
            </div>
        </div>
    );
}
