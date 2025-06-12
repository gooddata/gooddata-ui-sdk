// (C) 2022-2023 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import copy from "copy-to-clipboard";
import { useIntl } from "react-intl";

import { ConfirmDialogBase } from "../../ConfirmDialogBase.js";
import { Tabs, ITab } from "../../../Tabs/index.js";
import { dialogEmbedTabLabels, dialogHeadlineLabels } from "../../../locales.js";

import { CopyCodeOriginType, EmbedType, IReactOptions, IWebComponentsOptions } from "./types.js";
import { CompleteListPropsMessage } from "./components/CompleteListPropsMessage.js";
import { EmbedInsightContent } from "./components/EmbedInsightContent.js";

/**
 * @internal
 */
export type IEmbedInsightDialogBaseProps = {
    code: string;
    embedTab: EmbedType;
    embedTypeOptions: IReactOptions | IWebComponentsOptions;
    propertiesLink?: string;
    integrationDocLink?: string;
    showWebComponentsTab?: boolean;
    openSaveInsightDialog: () => void;
    onClose: () => void;
    onCopyCode: (code: string, type: CopyCodeOriginType, codeType: EmbedType) => void;
    onOptionsChange: (opt: IReactOptions | IWebComponentsOptions) => void;
    onTabChange: (selectedTab: EmbedType) => void;
};

/**
 * @internal
 */
export const EmbedInsightDialogBase: React.VFC<IEmbedInsightDialogBaseProps> = (props) => {
    const {
        code,
        propertiesLink,
        integrationDocLink,
        embedTab,
        embedTypeOptions,
        openSaveInsightDialog,
        onClose,
        onCopyCode,
        onOptionsChange,
        onTabChange,
        showWebComponentsTab,
    } = props;

    const intl = useIntl();

    const onCopyButtonClick = useCallback(() => {
        copy(code);
        onCopyCode(code, "button", embedTab);
    }, [code, onCopyCode, embedTab]);

    const onAreaCopy = useCallback(() => {
        copy(code);
        onCopyCode(code, "keyboard", embedTab);
    }, [code, onCopyCode, embedTab]);

    return (
        <ConfirmDialogBase
            isPositive={true}
            onClose={onClose}
            onCancel={onClose}
            onSubmit={onCopyButtonClick}
            cancelButtonText={intl.formatMessage({ id: "embedInsightDialog.actions.close" })}
            submitButtonText={intl.formatMessage({ id: "embedInsightDialog.actions.copyCode" })}
            isSubmitDisabled={!code}
            headline={intl.formatMessage({ id: dialogHeadlineLabels.embedInsight.id })}
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
        >
            {showWebComponentsTab ? (
                <Tabs
                    tabs={getTabIds()}
                    onTabSelect={(tab) => {
                        onTabChange(tab.id.includes("react") ? "react" : "webComponents");
                    }}
                    selectedTabId={dialogEmbedTabLabels[embedTab].id}
                />
            ) : null}
            <EmbedInsightContent
                integrationDocLink={integrationDocLink}
                code={code}
                embedTypeOptions={embedTypeOptions}
                onCopyCode={onAreaCopy}
                openSaveInsightDialog={openSaveInsightDialog}
                onOptionsChange={onOptionsChange}
            />
        </ConfirmDialogBase>
    );
};

const getTabIds = (): ITab[] => {
    return [{ id: dialogEmbedTabLabels.react.id }, { id: dialogEmbedTabLabels.webComponents.id }];
};
