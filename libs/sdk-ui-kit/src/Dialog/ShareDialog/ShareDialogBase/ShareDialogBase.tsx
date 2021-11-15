// (C) 2021 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import { areObjRefsEqual, uriRef } from "@gooddata/sdk-model";
import { Overlay } from "../../../Overlay";
import { IAlignPoint } from "../../../typings/positioning";
import { ShareGranteeBase } from "./ShareGranteeBase";
import { AddGranteeBase } from "./AddGranteeBase";
import { DialogModeType, GranteeItem, IShareDialogBaseProps } from "./types";
import { notInArrayFilter, GROUP_ALL_ID } from "./utils";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];

const availableGranteesConst: GranteeItem[] = [
    {
        id: uriRef(GROUP_ALL_ID),
        type: "groupAll",
    },
];

const useShareDialogBase = (props: IShareDialogBaseProps) => {
    const { onSubmit, grantees } = props;
    const [dialogMode, setDialogMode] = useState<DialogModeType>("ShareGrantee");
    const [granteesToAdd, setGranteesToAdd] = useState<GranteeItem[]>([]);
    const [granteesToDelete, setGranteesToDelete] = useState<GranteeItem[]>([]);

    const onAddGranteeButtonClick = useCallback(() => {
        setDialogMode("AddGrantee");
    }, [setDialogMode]);

    const onAddGranteeBackClick = useCallback(() => {
        setDialogMode("ShareGrantee");
        setGranteesToAdd([]);
    }, [setDialogMode, setGranteesToAdd]);

    const onSharedGranteeDelete = useCallback(
        (grantee: GranteeItem) => {
            setGranteesToDelete((state) => [...state, grantee]);
        },
        [setGranteesToDelete],
    );

    const onAddedGranteeDelete = useCallback(
        (grantee: GranteeItem) => {
            setGranteesToAdd((state) => state.filter((g) => !areObjRefsEqual(g.id, grantee.id)));
        },
        [setGranteesToAdd],
    );

    const onGranteeAdd = useCallback(
        (grantee: GranteeItem) => {
            setGranteesToAdd((state) => [...state, grantee]);
        },
        [setGranteesToAdd],
    );

    const isShareDialogDirty = useMemo(() => {
        return granteesToDelete.length !== 0;
    }, [granteesToDelete]);

    const isAddDialogDirty = useMemo(() => {
        return granteesToAdd.length !== 0;
    }, [granteesToDelete, granteesToAdd]);

    const onSubmitShareGrantee = useCallback(() => {
        if (!isShareDialogDirty) {
            return;
        }
        onSubmit(granteesToAdd, granteesToDelete);
    }, [granteesToAdd, granteesToDelete, isShareDialogDirty, onSubmit]);

    const onSubmitAddGrantee = useCallback(() => {
        if (!isAddDialogDirty) {
            return;
        }
        onSubmit(granteesToAdd, granteesToDelete);
    }, [granteesToAdd, granteesToDelete, isAddDialogDirty, onSubmit]);

    const filteredGrantees = useMemo(() => {
        return notInArrayFilter(grantees, granteesToDelete);
    }, [grantees, granteesToDelete]);

    const availableGrantees = useMemo(() => {
        return notInArrayFilter(availableGranteesConst, granteesToAdd).filter((grantee) => {
            const isInGrantees = grantees.some((g) => {
                return areObjRefsEqual(g.id, grantee.id);
            });

            if (isInGrantees) {
                return granteesToDelete.some((gd) => areObjRefsEqual(gd.id, grantee.id));
            }

            return true;
        });
    }, [grantees, granteesToDelete, granteesToAdd]);

    return {
        onAddedGranteeDelete,
        onSharedGranteeDelete,
        onAddGranteeBackClick,
        onAddGranteeButtonClick,
        onGranteeAdd,
        onSubmitShareGrantee,
        onSubmitAddGrantee,
        granteesToAdd,
        dialogMode,
        isShareDialogDirty,
        isAddDialogDirty,
        filteredGrantees,
        availableGrantees,
    };
};

/**
 * @internal
 */
export const ShareDialogBase: React.FC<IShareDialogBaseProps> = (props) => {
    const { onCancel, owner } = props;

    const {
        onAddedGranteeDelete,
        onSharedGranteeDelete,
        onAddGranteeBackClick,
        onAddGranteeButtonClick,
        onGranteeAdd,
        onSubmitShareGrantee,
        onSubmitAddGrantee,
        granteesToAdd,
        dialogMode,
        isShareDialogDirty,
        isAddDialogDirty,
        filteredGrantees,
        availableGrantees,
    } = useShareDialogBase(props);

    return (
        <Overlay
            alignPoints={alignPoints}
            isModal={true}
            positionType="fixed"
            className="gd-share-dialog-overlay"
        >
            <div className="s-gd-share-dialog">
                {dialogMode === "ShareGrantee" ? (
                    <ShareGranteeBase
                        isDirty={isShareDialogDirty}
                        owner={owner}
                        grantees={filteredGrantees}
                        onCancel={onCancel}
                        onSubmit={onSubmitShareGrantee}
                        onAddGranteeButtonClick={onAddGranteeButtonClick}
                        onGranteeDelete={onSharedGranteeDelete}
                    />
                ) : (
                    <AddGranteeBase
                        isDirty={isAddDialogDirty}
                        availableGrantees={availableGrantees}
                        addedGrantees={granteesToAdd}
                        onAddUserOrGroups={onGranteeAdd}
                        onDelete={onAddedGranteeDelete}
                        onCancel={onCancel}
                        onSubmit={onSubmitAddGrantee}
                        onBackClick={onAddGranteeBackClick}
                    />
                )}
            </div>
        </Overlay>
    );
};
