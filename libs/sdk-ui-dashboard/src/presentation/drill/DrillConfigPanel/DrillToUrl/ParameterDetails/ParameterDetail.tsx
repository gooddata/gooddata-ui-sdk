// (C) 2020-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { LoadingMask } from "@gooddata/sdk-ui-kit";
import classNames from "classnames";

const LOADING_MASK_HEIGHT = 60;

interface IParameterDetailProps {
    title: string;
    typeName: string;
    label?: string;
    isLoading?: boolean;
    useEllipsis?: boolean;
    values: string[];
    additionalValues?: number;
}

export const ParameterDetail: React.FC<IParameterDetailProps> = (props) => {
    const { title, typeName, label, isLoading, useEllipsis, values, additionalValues } = props;

    return (
        <div className="gd-drill-to-url-editor-parameter-detail s-parameter-detail">
            <div className="gd-parameter-detail-title">{title}</div>
            <ParameterTypeSection typeName={typeName} />
            {label ? <ParameterLabelSection label={label} /> : null}
            <ParameterValuesSection
                isLoading={isLoading}
                useEllipsis={useEllipsis}
                values={values}
                additionalValues={additionalValues}
            />
        </div>
    );
};

const ParameterTypeSection: React.FC<{ typeName: string }> = ({ typeName }) => {
    return (
        <div className="gd-parameter-detail-section">
            <div className="gd-parameter-detail-subtitle">
                <FormattedMessage id="configurationPanel.drillIntoUrl.editor.parameterDetailType" />
            </div>
            <div>{typeName}</div>
        </div>
    );
};

const ParameterLabelSection: React.FC<{ label: string }> = ({ label }) => {
    return (
        <div className="gd-parameter-detail-section">
            <div className="gd-parameter-detail-subtitle">
                <FormattedMessage id="configurationPanel.drillIntoUrl.editor.parameterDetailLabel" />
            </div>
            <div>{label}</div>
        </div>
    );
};

interface IParameterValues {
    isLoading?: boolean;
    useEllipsis?: boolean;
    values: string[];
    additionalValues?: number;
}

const ParameterValuesSection: React.FC<IParameterValues> = ({
    isLoading,
    useEllipsis,
    values,
    additionalValues,
}) => {
    return isLoading ? (
        <LoadingMask className="s-parameter-detail-loading" height={LOADING_MASK_HEIGHT} />
    ) : (
        <Values useEllipsis={useEllipsis} values={values} additionalValues={additionalValues} />
    );
};

const Values: React.FC<IParameterValues> = ({ useEllipsis, values, additionalValues }) => {
    const valueClassName = classNames("s-parameter-detail-value", {
        "gd-parameter-detail-ellipsis-row": useEllipsis,
    });

    return (
        values && (
            <div className="gd-parameter-detail-section">
                <div className="gd-parameter-detail-subtitle">
                    <FormattedMessage
                        id="configurationPanel.drillIntoUrl.editor.parameterDetailValues"
                        values={{ numberOfValues: values.length }}
                    />
                </div>
                <div>
                    {values.map((item, i) => (
                        <div className={valueClassName} key={i}>
                            {item}
                        </div>
                    ))}
                    {additionalValues ? (
                        <div className="gd-parameter-detail-info">
                            <FormattedMessage
                                id="configurationPanel.drillIntoUrl.editor.parameterDetailMoreValues"
                                values={{ count: additionalValues }}
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        )
    );
};
