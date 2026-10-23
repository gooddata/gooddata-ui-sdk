// (C) 2021-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { type ITab } from "../../../shared/Tabs/Tab.js";
import { type IMeasureDef } from "../../metric/metricHelpers.js";
import { CloseAllStatus, type CloseAllTabsResult, type IMetricInfo } from "../metricState.data.js";

export interface IUnsavedChangesDialogProps {
    showDialog: boolean;
    tabs: ITab<IMetricInfo>[];
    resolver?: (value: CloseAllTabsResult) => void;
}

export interface IUseUnsavedChanges {
    unsavedChangesDialog: IUnsavedChangesDialogProps;
    openUnsavedChangesDialog: (tabs: ITab<IMetricInfo>[]) => Promise<CloseAllTabsResult>;
    closeUnsavedChangesDialog: () => void;
    cancelUnsavedChangesDialog: () => void;
    saveUnsavedChangesDialog: () => void;
}

export const useUnsavedChanges = (
    onClose?: (metricInfos: IMetricInfo[]) => void,
    save?: (tab: ITab<IMetricInfo>) => Promise<IMeasureDef>,
): IUseUnsavedChanges => {
    const [unsavedChangesDialog, setUnsavedChangesDialog] = useState<IUnsavedChangesDialogProps>({
        showDialog: false,
        tabs: [],
    });

    const openUnsavedChangesDialog = useCallback(
        (tabs: ITab<IMetricInfo>[]) => {
            return new Promise<CloseAllTabsResult>((resolve) => {
                setUnsavedChangesDialog({
                    showDialog: true,
                    tabs: tabs,
                    resolver: resolve,
                });
            });
        },
        [setUnsavedChangesDialog],
    );

    const closeUnsavedChangesDialog = useCallback(() => {
        if (unsavedChangesDialog.resolver) {
            unsavedChangesDialog.resolver({
                status: CloseAllStatus.Close,
            });
        }
        setUnsavedChangesDialog({
            showDialog: false,
            tabs: [],
        });
    }, [setUnsavedChangesDialog, unsavedChangesDialog]);

    const cancelUnsavedChangesDialog = useCallback(() => {
        const resolvedData = {
            status: CloseAllStatus.Canceled,
        } as CloseAllTabsResult;
        if (onClose) {
            onClose(unsavedChangesDialog.tabs.map((tab) => tab.data));
        }
        if (unsavedChangesDialog.resolver) {
            unsavedChangesDialog.resolver(resolvedData);
        }
        setUnsavedChangesDialog({
            showDialog: false,
            tabs: [],
        });
    }, [setUnsavedChangesDialog, onClose, unsavedChangesDialog]);

    const saveUnsavedChangesDialog = useCallback(() => {
        closeUnsavedChangesDialog();
        tabsToSave(unsavedChangesDialog, save)
            .then(() => {
                const closedTabs = unsavedChangesDialog.tabs
                    .filter((tab) => !tab.states?.invalid)
                    .map((tab) => tab.data);
                const invalidTabs = unsavedChangesDialog.tabs
                    .filter((tab) => tab.states?.invalid)
                    .map((tab) => tab.data);

                const resolvedData = {
                    status: invalidTabs.length > 0 ? CloseAllStatus.Incomplete : CloseAllStatus.Complete,
                    closedTabs,
                    invalidTabs,
                };
                if (onClose) {
                    onClose(resolvedData.closedTabs);
                }
                if (unsavedChangesDialog.resolver) {
                    unsavedChangesDialog.resolver(resolvedData);
                }
            })
            .catch(() => closeUnsavedChangesDialog());
    }, [closeUnsavedChangesDialog, onClose, save, unsavedChangesDialog]);

    return {
        unsavedChangesDialog,
        openUnsavedChangesDialog,
        closeUnsavedChangesDialog,
        cancelUnsavedChangesDialog,
        saveUnsavedChangesDialog,
    };
};

function tabsToSave(
    dialog: IUnsavedChangesDialogProps,
    save?: (tab: ITab<IMetricInfo>) => Promise<IMeasureDef>,
) {
    const promises: Promise<IMeasureDef>[] = [];
    dialog.tabs
        .filter((tab) => tab.states?.dirty && !tab.states.invalid)
        .forEach((tab) => {
            if (save) {
                promises.push(save(tab));
            }
        });
    return Promise.all(promises);
}
