// (C) 2022-2023 GoodData Corporation
import React, { ReactNode, useCallback } from "react";
import { FormattedMessage } from "react-intl";

import { dialogEmptyInsightMessageLabels } from "../../../../locales.js";
import { EmbedType, InsightCodeType } from "../types.js";

/**
 * @internal
 */
export interface ICodeAreaProps {
    code: string;
    onCopyCode: (code: string) => void;
}

/**
 * @internal
 */
export const CodeArea: React.FC<ICodeAreaProps> = (props) => {
    const { code, onCopyCode } = props;

    const onAreaCopyCode = useCallback(() => {
        onCopyCode(code);
    }, [code, onCopyCode]);

    return (
        <div className="embed-insight-dialog-code-content">
            <textarea
                className="embed-insight-dialog-code-area s-code-content"
                readOnly
                value={code}
                onCopy={onAreaCopyCode}
            />
        </div>
    );
};

/**
 * @internal
 */
export interface ICodeAreaDisableMessageProps {
    embedType: EmbedType;
    componentType?: InsightCodeType;
    openSaveInsightDialog: () => void;
}

/**
 * @internal
 */
export const CodeAreaDisableMessage: React.VFC<ICodeAreaDisableMessageProps> = (
    props: ICodeAreaDisableMessageProps,
) => {
    const { componentType, embedType, openSaveInsightDialog } = props;
    const getEmptyMessage = useCallback(() => {
        const isDefinitionMsg = embedType === "react" && componentType === "definition";
        return (
            <FormattedMessage
                id={dialogEmptyInsightMessageLabels[isDefinitionMsg ? "definition" : "reference"].id}
                values={{
                    a: (chunk: ReactNode) => {
                        return <a onClick={openSaveInsightDialog}>{chunk}</a>;
                    },
                }}
            />
        );
    }, [embedType, componentType, openSaveInsightDialog]);

    return (
        <div className={`embed-insight-dialog-code-empty ${componentType}`}>
            <div className="embed-insight-dialog-code-empty-msg">{getEmptyMessage()}</div>
        </div>
    );
};

export interface IEmbedInsightCodeAreaProps extends ICodeAreaProps, ICodeAreaDisableMessageProps {}

/**
 * @internal
 */
export const EmbedInsightCodeArea: React.VFC<IEmbedInsightCodeAreaProps> = (props) => {
    const { code, onCopyCode, ...restProps } = props;
    return code ? (
        <CodeArea code={code} onCopyCode={onCopyCode} />
    ) : (
        <CodeAreaDisableMessage {...restProps} />
    );
};
