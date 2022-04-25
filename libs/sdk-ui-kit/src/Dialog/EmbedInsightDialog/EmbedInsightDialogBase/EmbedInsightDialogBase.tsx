// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { CodeArea } from "./components/CodeArea";
import { ConfirmDialogBase } from "../../ConfirmDialogBase";
import { PrepareEnvMessage } from "./components/PrepareEnvMessage";
import { CodeLanguageSelector } from "./components/CodeLanguageSelector";
import { IOptionsByDefinition, OptionsByDefinition } from "./components/OptionsByDefinition";

/**
 * @internal
 */
export type InsightCodeType = "definition" | "reference";

/**
 * @internal
 */
export type CodeLanguageType = "js" | "ts";

/**
 * @internal
 */
export interface IEmbedInsightDialogBaseProps {
    codeType: InsightCodeType;
    codeLanguage: CodeLanguageType;
    code: string;
    codeOption: IOptionsByDefinition;
    onClose: () => void;
    onCopyCode: () => void;
    onCodeLanguageChange: (codeLanguage: CodeLanguageType) => void;
    onCodeOptionChange: (codeOption: IOptionsByDefinition) => void;
}

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

    const dialogLabelId =
        codeType === "definition"
            ? "embedInsightDialog.headLine.byDefinition"
            : "embedInsightDialog.headLine.byReference";

    const changesMessageId =
        codeType === "definition"
            ? "embedInsightDialog.changesMessage.byDefinition"
            : "embedInsightDialog.changesMessage.byReference";

    return (
        <ConfirmDialogBase
            isPositive={true}
            onClose={onClose}
            onCancel={onClose}
            onSubmit={onCopyCode}
            cancelButtonText={intl.formatMessage({ id: "embedInsightDialog.actions.close" })}
            submitButtonText={intl.formatMessage({ id: "embedInsightDialog.actions.copyCode" })}
            headline={intl.formatMessage({ id: dialogLabelId })}
            className={cx("embed-insight-dialog", "s-embed-insight-dialog")}
        >
            <div className="embed-insight-dialog-content">
                <span className="embed-insight-dialog-message-changes">
                    <FormattedMessage id={changesMessageId} />
                </span>
                <PrepareEnvMessage isTiger={true} />
                <div className="embed-insight-dialog-code">
                    <div className="embed-insight-dialog-code-settings">
                        <CodeLanguageSelector
                            selectedLanguage={codeLanguage}
                            onLanguageChanged={onCodeLanguageChange}
                        />
                        <OptionsByDefinition option={codeOption} onChange={onCodeOptionChange} />
                    </div>
                    <div className="embed-insight-dialog-code-wrapper">
                        <CodeArea code={code} />
                    </div>
                </div>
            </div>
        </ConfirmDialogBase>
    );
};
