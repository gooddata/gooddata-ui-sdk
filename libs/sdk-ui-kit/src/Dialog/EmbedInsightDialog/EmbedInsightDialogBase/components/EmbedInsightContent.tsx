// (C) 2022-2023 GoodData Corporation
import React from "react";

import { IReactOptions, IWebComponentsOptions, EmbedOptionsType, EmbedType } from "../types";
import { EmbedInsightCodeArea } from "./CodeArea";

import { PrepareEnvMessage } from "./PrepareEnvMessage";
import { ReactOptions } from "./ReactOptions";
import { WebComponentsOptions } from "./WebComponentsOptions";

interface IEmbedInsightContentProps {
    integrationDocLink: string;
    embedTypeOptions: EmbedOptionsType;
    embedTab: EmbedType;
    code: string;
    openSaveInsightDialog: () => void;
    onCopyCode: () => void;
    onOptionsChange: (opt: IReactOptions | IWebComponentsOptions) => void;
}
/**
 * @internal
 */
export const EmbedInsightContent: React.FC<IEmbedInsightContentProps> = (props) => {
    const {
        integrationDocLink,
        embedTypeOptions,
        embedTab,
        code,
        openSaveInsightDialog,
        onCopyCode,
        onOptionsChange,
    } = props;
    return (
        <div className="embed-insight-dialog-content">
            <PrepareEnvMessage integrationDocLink={integrationDocLink} />
            <div className="embed-insight-dialog-code">
                <div className="embed-insight-dialog-code-settings">
                    {embedTab === "react" ? (
                        <ReactOptions option={embedTypeOptions as IReactOptions} onChange={onOptionsChange} />
                    ) : (
                        <WebComponentsOptions
                            option={embedTypeOptions as IWebComponentsOptions}
                            onChange={onOptionsChange}
                        />
                    )}
                </div>
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
