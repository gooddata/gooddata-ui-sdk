// (C) 2020-2025 GoodData Corporation

import classNames from "classnames";
import { isEmpty } from "lodash-es";
import { FormattedMessage } from "react-intl";

import { LoadingMask } from "@gooddata/sdk-ui-kit";

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

export function ParameterDetail({
    title,
    typeName,
    label,
    isLoading,
    useEllipsis,
    values,
    additionalValues,
}: IParameterDetailProps) {
    return (
        <div className="gd-drill-to-url-editor-parameter-detail s-parameter-detail">
            <div className="gd-parameter-detail-title">{title}</div>
            <ParameterTypeSection typeName={typeName} />
            {label ? <ParameterLabelSection label={label} /> : null}
            {!isEmpty(values) && (
                <ParameterValuesSection
                    isLoading={isLoading}
                    useEllipsis={useEllipsis}
                    values={values}
                    additionalValues={additionalValues}
                />
            )}
        </div>
    );
}

function ParameterTypeSection({ typeName }: { typeName: string }) {
    return (
        <div className="gd-parameter-detail-section">
            <div className="gd-parameter-detail-subtitle">
                <FormattedMessage id="configurationPanel.drillIntoUrl.editor.parameterDetailType" />
            </div>
            <div>{typeName}</div>
        </div>
    );
}

function ParameterLabelSection({ label }: { label: string }) {
    return (
        <div className="gd-parameter-detail-section">
            <div className="gd-parameter-detail-subtitle">
                <FormattedMessage id="configurationPanel.drillIntoUrl.editor.parameterDetailLabel" />
            </div>
            <div>{label}</div>
        </div>
    );
}

interface IParameterValues {
    isLoading?: boolean;
    useEllipsis?: boolean;
    values: string[];
    additionalValues?: number;
}

function ParameterValuesSection({ isLoading, useEllipsis, values, additionalValues }: IParameterValues) {
    return isLoading ? (
        <LoadingMask className="s-parameter-detail-loading" height={LOADING_MASK_HEIGHT} />
    ) : (
        <Values useEllipsis={useEllipsis} values={values} additionalValues={additionalValues} />
    );
}

function Values({ useEllipsis, values, additionalValues }: IParameterValues) {
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
}
