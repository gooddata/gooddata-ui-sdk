// (C) 2022-2025 GoodData Corporation

import { useCallback } from "react";

import cx from "classnames";
import copy from "copy-to-clipboard";
import { useIntl } from "react-intl";

import { CompleteListPropsMessage } from "./components/CompleteListPropsMessage.js";
import { EmbedInsightContent } from "./components/EmbedInsightContent.js";
import {
    type CopyCodeOriginType,
    type EmbedType,
    type IReactOptions,
    type IWebComponentsOptions,
} from "./types.js";
import { dialogEmbedTabLabels, dialogHeadlineLabels } from "../../../locales.js";
import { type ITab, Tabs } from "../../../Tabs/Tabs.js";
import { ConfirmDialogBase } from "../../ConfirmDialogBase.js";

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
export function EmbedInsightDialogBase({
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
}: IEmbedInsightDialogBaseProps) {
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
            isPositive
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
                    selectedTabId={dialogEmbedTabLabels[embedTab]?.id ?? ""}
                />
            ) : null}
            <EmbedInsightContent
                integrationDocLink={integrationDocLink ?? ""}
                code={code}
                embedTypeOptions={embedTypeOptions}
                onCopyCode={onAreaCopy}
                openSaveInsightDialog={openSaveInsightDialog}
                onOptionsChange={onOptionsChange}
            />
        </ConfirmDialogBase>
    );
}

const getTabIds = (): ITab[] => {
    return [{ id: dialogEmbedTabLabels.react.id }, { id: dialogEmbedTabLabels.webComponents.id }];
};
