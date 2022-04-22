// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { useIntl } from "react-intl";
import { CodeArea } from "./components/CodeArea";
import { ConfirmDialogBase } from "../../ConfirmDialogBase";

/**
 * @internal
 */
export interface IEmbedInsightDialogBaseProps {
    codeByReference: boolean;
    code: string;
    onClose: () => void;
    onCopyCode: () => void;
}

/**
 * @internal
 */
export const EmbedInsightDialogBase: React.VFC<IEmbedInsightDialogBaseProps> = (props) => {
    const { code, codeByReference, onClose, onCopyCode } = props;

    const intl = useIntl();

    const dialogLabelId = codeByReference
        ? "embedInsightDialog.headLine.byReference"
        : "embedInsightDialog.headLine.byDefinition";

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
            <div style={{ height: 260 }}>
                <CodeArea code={code} />
            </div>
        </ConfirmDialogBase>
    );
};
