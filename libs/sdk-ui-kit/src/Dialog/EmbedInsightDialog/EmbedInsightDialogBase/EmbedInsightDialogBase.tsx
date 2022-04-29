// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import copy from "copy-to-clipboard";
import { FormattedMessage, useIntl } from "react-intl";
import { CodeArea } from "./components/CodeArea";
import { ConfirmDialogBase } from "../../ConfirmDialogBase";
import { PrepareEnvMessage } from "./components/PrepareEnvMessage";
import { CodeLanguageSelector } from "./components/CodeLanguageSelector";
import { CodeLanguageType, CodeOptionType, InsightCodeType } from "./types";
import { CodeOptions } from "./components/CodeOptions";
import { CompleteListPropsMessage } from "./components/CompleteListPropsMessage";

/**
 * @internal
 */
export type IEmbedInsightDialogBaseProps = {
    codeOption: CodeOptionType;
    codeLanguage: CodeLanguageType;
    code: string;
    propertiesLink?: string;
    onClose: () => void;
    onCopyCode: () => void;
    onCodeLanguageChange: (codeLanguage: CodeLanguageType) => void;
    onCodeOptionChange: (codeOption: CodeOptionType) => void;
};

/**
 * @internal
 */
export const EmbedInsightDialogBase: React.VFC<IEmbedInsightDialogBaseProps> = (props) => {
    const {
        code,
        codeLanguage,
        codeOption,
        propertiesLink,
        onClose,
        onCopyCode,
        onCodeLanguageChange,
        onCodeOptionChange,
    } = props;

    const intl = useIntl();

    const onCopy = useCallback(() => {
        copy(code);
        onCopyCode();
    }, [onCopyCode]);

    return (
        <ConfirmDialogBase
            isPositive={true}
            onClose={onClose}
            onCancel={onClose}
            onSubmit={onCopy}
            cancelButtonText={intl.formatMessage({ id: "embedInsightDialog.actions.close" })}
            submitButtonText={intl.formatMessage({ id: "embedInsightDialog.actions.copyCode" })}
            headline={intl.formatMessage({ id: getDialogLabelId(codeOption.type) })}
            className={cx("embed-insight-dialog", "s-embed-insight-dialog")}
            footerRightRenderer={
                propertiesLink
                    ? () => {
                          return <CompleteListPropsMessage documentationLink={propertiesLink} />;
                      }
                    : undefined
            }
        >
            <div className="embed-insight-dialog-content">
                <span className="embed-insight-dialog-message-changes">
                    <FormattedMessage id={getChangesLabelId(codeOption.type)} />
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
