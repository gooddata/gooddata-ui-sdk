// (C) 2021-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { type MetricIdConflicts } from "../../ConflictContext/useConflictDetection.js";
import { SaveNameMode } from "../../Content/EditMetricContent.data.js";

export interface IChangeIdDialogProps {
    saveMode: SaveNameMode | undefined;
    oldId: string;
    newId: string;
    idChanged: boolean;
    visible: boolean;
    conflicts: MetricIdConflicts;
    resolver?: { resolve: (newId: string) => void; reject: () => void };
}

export interface IUseChangeIdDialog {
    changeIdDialog: IChangeIdDialogProps;
    handleChangeId: (
        saveMode: SaveNameMode | undefined,
        oldId: string,
        newId: string,
        idChanged: boolean,
        conflicts: MetricIdConflicts,
    ) => Promise<string>;
    cancelChangeId: () => void;
    saveChangeId: () => void;
    closeChangeId: () => void;
}

export const useChangeIdDialog = (): IUseChangeIdDialog => {
    const [changeIdDialog, setChangeIdDialog] = useState<IChangeIdDialogProps>({
        oldId: "",
        newId: "",
        visible: false,
        idChanged: false,
        conflicts: { conflictWith: [], usableIds: [] },
        saveMode: undefined,
    });
    const handleChangeId = useCallback(
        (
            saveMode: SaveNameMode | undefined,
            oldId: string,
            newId: string,
            idChanged: boolean,
            conflicts: MetricIdConflicts,
        ) => {
            let resolver: IChangeIdDialogProps["resolver"];
            const promise = new Promise<string>((resolve, reject) => {
                resolver = { resolve, reject };
            });
            setChangeIdDialog({
                oldId: oldId,
                newId: newId,
                visible: true,
                resolver: resolver,
                saveMode,
                idChanged,
                conflicts,
            });
            return promise;
        },
        [],
    );

    const cancelChangeId = useCallback(() => {
        if (changeIdDialog.saveMode === SaveNameMode.saveAsNew) {
            changeIdDialog.resolver?.resolve(changeIdDialog.conflicts.usableIds[0]);
        } else {
            changeIdDialog.resolver?.resolve(changeIdDialog.oldId);
        }
        setChangeIdDialog({
            saveMode: undefined,
            oldId: "",
            newId: "",
            visible: false,
            idChanged: false,
            conflicts: { conflictWith: [], usableIds: [] },
        });
    }, [changeIdDialog]);

    const saveChangeId = useCallback(() => {
        changeIdDialog.resolver?.resolve(changeIdDialog.newId);
        setChangeIdDialog({
            saveMode: undefined,
            oldId: "",
            newId: "",
            visible: false,
            idChanged: false,
            conflicts: { conflictWith: [], usableIds: [] },
        });
    }, [changeIdDialog]);

    const closeChangeId = useCallback(() => {
        changeIdDialog.resolver?.reject();
        setChangeIdDialog({
            saveMode: undefined,
            oldId: "",
            newId: "",
            visible: false,
            idChanged: false,
            conflicts: { conflictWith: [], usableIds: [] },
        });
    }, [changeIdDialog]);

    return { changeIdDialog, handleChangeId, cancelChangeId, saveChangeId, closeChangeId };
};
