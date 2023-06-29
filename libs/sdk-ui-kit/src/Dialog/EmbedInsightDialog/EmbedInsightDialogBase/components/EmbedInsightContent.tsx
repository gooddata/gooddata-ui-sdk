// (C) 2022-2023 GoodData Corporation
import React, { useMemo } from "react";

import { IReactOptions, IWebComponentsOptions, EmbedOptionsType } from "../types.js";
import { EmbedInsightCodeArea } from "./CodeArea.js";

import { PrepareEnvMessage } from "./PrepareEnvMessage.js";
import { ReactOptions } from "./ReactOptions.js";
import { WebComponentsOptions } from "./WebComponentsOptions.js";

interface IEmbedInsightContentProps {
    integrationDocLink: string;
    embedTypeOptions: EmbedOptionsType;
    code: string;
    openSaveInsightDialog: () => void;
    onCopyCode: () => void;
    onOptionsChange: (opt: IReactOptions | IWebComponentsOptions) => void;
}
/**
 * @internal
 */
export const EmbedInsightContent: React.FC<IEmbedInsightContentProps> = (props) => {
    const { integrationDocLink, embedTypeOptions, code, openSaveInsightDialog, onCopyCode, onOptionsChange } =
        props;

    const renderEmbedOptions = useMemo(() => {
        return embedTypeOptions.type === "react" ? (
            <ReactOptions option={embedTypeOptions as IReactOptions} onChange={onOptionsChange} />
        ) : (
            <WebComponentsOptions
                option={embedTypeOptions as IWebComponentsOptions}
                onChange={onOptionsChange}
            />
        );
    }, [embedTypeOptions, onOptionsChange]);

    return (
        <div className="embed-insight-dialog-content">
            <PrepareEnvMessage integrationDocLink={integrationDocLink} />
            <div className="embed-insight-dialog-code">
                <div className="embed-insight-dialog-code-settings">{renderEmbedOptions}</div>
                <div className="embed-insight-dialog-code-wrapper">
                    <EmbedInsightCodeArea
                        code={code}
                        componentType={(embedTypeOptions as IReactOptions)?.componentType}
                        onCopyCode={onCopyCode}
                        embedType={embedTypeOptions.type}
                        openSaveInsightDialog={openSaveInsightDialog}
                    />
                </div>
            </div>
        </div>
    );
};
