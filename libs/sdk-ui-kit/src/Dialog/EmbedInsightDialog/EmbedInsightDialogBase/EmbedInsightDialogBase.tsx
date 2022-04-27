// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { CodeArea } from "./components/CodeArea";
import { ConfirmDialogBase } from "../../ConfirmDialogBase";
import { PrepareEnvMessage } from "./components/PrepareEnvMessage";
import { CodeLanguageSelector } from "./components/CodeLanguageSelector";
import {
    CodeLanguageType,
    CodeOptionType,
    InsightCodeType,
    IOptionsByDefinition,
    IOptionsByReference,
} from "./types";
import { CodeOptions } from "./components/CodeOptions";

/**
 * @internal
 */
export interface IEmbedInsightBase {
    codeLanguage: CodeLanguageType;
    code: string;
    onClose: () => void;
    onCopyCode: () => void;
    onCodeLanguageChange: (codeLanguage: CodeLanguageType) => void;
    onCodeOptionChange: (codeOption: CodeOptionType) => void;
}

/**
 * @internal
 */
export interface IBaseByReferenceProps extends IEmbedInsightBase {
    codeType: "reference";
    codeOption: IOptionsByReference;
}

/**
 * @internal
 */
export interface IBaseByDefinitionProps extends IEmbedInsightBase {
    codeType: "definition";
    codeOption: IOptionsByDefinition;
}

/**
 * @internal
 */
export type IEmbedInsightDialogBaseProps = IBaseByReferenceProps | IBaseByDefinitionProps;

/**
 * @internal
 */
export const EmbedInsightDialogBase: React.VFC<IEmbedInsightDialogBaseProps> = (props) => {
    const {
        code,
        codeType,
        codeLanguage,
        codeOption,
        onClose,
        onCopyCode,
        onCodeLanguageChange,
        onCodeOptionChange,
    } = props;

    const intl = useIntl();

    return (
        <ConfirmDialogBase
            isPositive={true}
            onClose={onClose}
            onCancel={onClose}
            onSubmit={onCopyCode}
            cancelButtonText={intl.formatMessage({ id: "embedInsightDialog.actions.close" })}
            submitButtonText={intl.formatMessage({ id: "embedInsightDialog.actions.copyCode" })}
            headline={intl.formatMessage({ id: getDialogLabelId(codeType) })}
            className={cx("embed-insight-dialog", "s-embed-insight-dialog")}
        >
            <div className="embed-insight-dialog-content">
                <span className="embed-insight-dialog-message-changes">
                    <FormattedMessage id={getChangesLabelId(codeType)} />
                </span>
                <PrepareEnvMessage isTiger={true} />
                <div className="embed-insight-dialog-code">
                    <div className="embed-insight-dialog-code-settings">
                        <CodeLanguageSelector
                            selectedLanguage={codeLanguage}
                            onLanguageChanged={onCodeLanguageChange}
                        />
                        <CodeOptions option={codeOption} onChange={onCodeOptionChange} />
                    </div>
                    <div className="embed-insight-dialog-code-wrapper">
                        <CodeArea code={code} />
                    </div>
                </div>
            </div>
        </ConfirmDialogBase>
    );
};

const getDialogLabelId = (codeType: InsightCodeType): string => {
    if (codeType === "definition") {
        return "embedInsightDialog.headLine.byDefinition";
    }
    return "embedInsightDialog.headLine.byReference";
};

const getChangesLabelId = (codeType: InsightCodeType): string => {
    if (codeType === "definition") {
        return "embedInsightDialog.changesMessage.byDefinition";
    }
    return "embedInsightDialog.changesMessage.byReference";
};

/**
 * @internal
 */
export const getDefaultOptions = (codeType: InsightCodeType): CodeOptionType => {
    if (codeType === "definition") {
        return {
            type: "definition",
            includeConfiguration: true,
            customHeight: true,
        };
    }

    return {
        type: "reference",
        displayTitle: true,
        customHeight: true,
    };
};
