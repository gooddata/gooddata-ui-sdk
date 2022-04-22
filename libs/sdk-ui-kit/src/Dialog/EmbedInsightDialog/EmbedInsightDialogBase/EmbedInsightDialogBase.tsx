// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { CodeArea } from "./components/CodeArea";
import { ConfirmDialogBase } from "../../ConfirmDialogBase";
import { Typography } from "../../../Typography";
import { PrepareEnvMessage } from "./components/PrepareEnvMessage";

/**
 * @internal
 */
export type InsightCodeType = "definition" | "reference";

/**
 * @internal
 */
export interface IEmbedInsightDialogBaseProps {
    codeType: InsightCodeType;
    code: string;
    onClose: () => void;
    onCopyCode: () => void;
}

/**
 * @internal
 */
export const EmbedInsightDialogBase: React.VFC<IEmbedInsightDialogBaseProps> = (props) => {
    const { code, codeType, onClose, onCopyCode } = props;

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
            <Typography tagName="p">
                <FormattedMessage id={changesMessageId} />
            </Typography>
            <PrepareEnvMessage isTiger={true} />
            <div style={{ height: 260 }}>
                <CodeArea code={code} />
            </div>
        </ConfirmDialogBase>
    );
};
