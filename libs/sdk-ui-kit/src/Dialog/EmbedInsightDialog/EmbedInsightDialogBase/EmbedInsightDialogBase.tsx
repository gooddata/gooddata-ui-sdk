// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import copy from "copy-to-clipboard";
import { FormattedMessage, useIntl } from "react-intl";
import { CodeArea } from "./components/CodeArea";
import { ConfirmDialogBase } from "../../ConfirmDialogBase";
import { PrepareEnvMessage } from "./components/PrepareEnvMessage";
import { CodeLanguageSelect } from "./components/CodeLanguageSelect";
import { CodeLanguageType, CodeOptionType, CopyCodeOriginType, InsightCodeType } from "./types";
import { CodeOptions } from "./components/CodeOptions";
import { CompleteListPropsMessage } from "./components/CompleteListPropsMessage";
import { Bubble, BubbleHoverTrigger } from "../../../Bubble";

/**
 * @internal
 */
export type IEmbedInsightDialogBaseProps = {
    codeOption: CodeOptionType;
    codeLanguage: CodeLanguageType;
    code: string;
    propertiesLink?: string;
    integrationDocLink?: string;
    onClose: () => void;
    onCopyCode: (code: string, type: CopyCodeOriginType) => void;
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
        integrationDocLink,
        onClose,
        onCopyCode,
        onCodeLanguageChange,
        onCodeOptionChange,
    } = props;

    const intl = useIntl();

    const onCopyButtonClick = useCallback(() => {
        copy(code);
        onCopyCode(code, "button");
    }, [code, onCopyCode]);

    const onAreaCopy = useCallback(() => {
        copy(code);
        onCopyCode(code, "keyboard");
    }, [code, onCopyCode]);

    return (
        <ConfirmDialogBase
            isPositive={true}
            onClose={onClose}
            onCancel={onClose}
            onSubmit={onCopyButtonClick}
            cancelButtonText={intl.formatMessage({ id: "embedInsightDialog.actions.close" })}
            submitButtonText={intl.formatMessage({ id: "embedInsightDialog.actions.copyCode" })}
            headline={intl.formatMessage({ id: getDialogLabelId(codeOption.type) })}
            className={cx("embed-insight-dialog", "s-embed-insight-dialog")}
            dialogHeaderClassName={"embed-insight-dialog-header"}
            footerLeftRenderer={
                propertiesLink
                    ? () => {
                          return (
                              <div className="embed-insight-dialog-left-footer-renderer">
                                  <CompleteListPropsMessage documentationLink={propertiesLink} />
                              </div>
                          );
                      }
                    : undefined
            }
            titleRightIconRenderer={() => (
                <BubbleHoverTrigger className="gd-button" showDelay={0} hideDelay={0}>
                    <span className="gd-icon-circle-question s-circle_question-dialog-title question-mark-icon embed-insight-dialog-header-icon" />
                    <Bubble className="bubble-primary" alignPoints={[{ align: "bc tl" }]}>
                        <FormattedMessage id={getChangesLabelId(codeOption.type)} />
                    </Bubble>
                </BubbleHoverTrigger>
            )}
        >
            <div className="embed-insight-dialog-content">
                <PrepareEnvMessage integrationDocLink={integrationDocLink} />
                <div className="embed-insight-dialog-code">
                    <div className="embed-insight-dialog-code-settings">
                        <CodeLanguageSelect
                            selectedLanguage={codeLanguage}
                            onLanguageChanged={onCodeLanguageChange}
                        />
                        <CodeOptions option={codeOption} onChange={onCodeOptionChange} />
                    </div>
                    <div className="embed-insight-dialog-code-wrapper">
                        <CodeArea code={code} onCopyCode={onAreaCopy} />
                    </div>
                </div>
            </div>
        </ConfirmDialogBase>
    );
};

const dialogHeadlineLabels = {
    definition: "embedInsightDialog.headLine.byDefinition",
    reference: "embedInsightDialog.headLine.byReference",
};

const getDialogLabelId = (codeType: InsightCodeType): string => {
    return dialogHeadlineLabels[codeType];
};

const dialogChangeMessageLabels = {
    definition: "embedInsightDialog.headLine.byDefinition.tooltip",
    reference: "embedInsightDialog.headLine.byReference.tooltip",
};

const getChangesLabelId = (codeType: InsightCodeType): string => {
    return dialogChangeMessageLabels[codeType];
};
