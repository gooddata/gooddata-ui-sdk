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

/**
 * @internal
 */
export const ShareDialogBase: React.FC<IShareDialogBaseProps> = (props) => {
    const { onCancel, onSubmit, owner, grantees } = props;
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

    const onSubmitCallback = useCallback(() => {
        onSubmit(granteesToAdd, granteesToDelete);
    }, [granteesToAdd, granteesToDelete, onSubmit]);

    const filteredGrantees = useMemo(() => {
        return notInArrayFilter(grantees, granteesToDelete);
    }, [grantees, granteesToDelete]);

    const isShareDialogDirty = useMemo(() => {
        return granteesToDelete.length !== 0;
    }, [granteesToDelete]);

    const isAddDialogDirty = useMemo(() => {
        return granteesToAdd.length !== 0;
    }, [granteesToDelete, granteesToAdd]);

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
                        onSubmit={onSubmitCallback}
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
                        onSubmit={onSubmitCallback}
                        onBackClick={onAddGranteeBackClick}
                    />
                )}
            </div>
        </Overlay>
    );
};
