// (C) 2021 GoodData Corporation
import { useCallback, useMemo, useState } from "react";
import { areObjRefsEqual } from "@gooddata/sdk-model";
import {
    DialogModeType,
    GranteeItem,
    IGranteeGroupAll,
    isGranteeUserInactive,
    IShareDialogBaseProps,
} from "./types";
import { notInArrayFilter, getAppliedGrantees } from "./utils";
import { useGetAccessList } from "./backend/useGetAccessList";
import { mapShareStatusToGroupAll } from "../shareDialogMappers";

/**
 * @internal
 */
interface IUseShareDialogStateReturnType {
    dialogMode: DialogModeType;
    isGranteesLoading: boolean;
    grantees: GranteeItem[];
    granteesToAdd: GranteeItem[];
    granteesToDelete: GranteeItem[];
    onLoadGrantees: (grantees: GranteeItem[], groupAll: IGranteeGroupAll | undefined) => void;
    onSharedGranteeDelete: (grantee: GranteeItem) => void;
    onAddedGranteeDelete: (grantee: GranteeItem) => void;
    onGranteeAdd: (grantee: GranteeItem) => void;
    onAddGranteeButtonClick: () => void;
    onAddGranteeBackClick: () => void;
}

/**
 * @internal
 */
const useShareDialogState = (): IUseShareDialogStateReturnType => {
    const [dialogMode, setDialogMode] = useState<DialogModeType>("ShareGrantee");
    const [isGranteesLoading, setIsGranteesLoading] = useState(true);
    const [grantees, setGrantees] = useState<GranteeItem[]>([]);
    const [granteesToAdd, setGranteesToAdd] = useState<GranteeItem[]>([]);
    const [granteesToDelete, setGranteesToDelete] = useState<GranteeItem[]>([]);

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

    const onAddGranteeButtonClick = useCallback(() => {
        setDialogMode("AddGrantee");
    }, [setDialogMode]);

    const onAddGranteeBackClick = useCallback(() => {
        setDialogMode("ShareGrantee");
        setGranteesToAdd([]);
    }, [setDialogMode, setGranteesToAdd]);

    const onLoadGrantees = useCallback(
        (grantees: GranteeItem[], groupAll: IGranteeGroupAll | undefined) => {
            if (groupAll) {
                setGrantees([...grantees, groupAll]);
            } else {
                setGrantees(grantees);
            }

            setIsGranteesLoading(false);
        },
        [setGrantees, setIsGranteesLoading],
    );

    return {
        dialogMode,
        isGranteesLoading,
        grantees,
        granteesToAdd,
        granteesToDelete,
        onLoadGrantees,
        onSharedGranteeDelete,
        onAddedGranteeDelete,
        onGranteeAdd,
        onAddGranteeButtonClick,
        onAddGranteeBackClick,
    };
};

/**
 * @internal
 */
export interface IUseShareDialogBaseReturnType {
    onAddedGranteeDelete: (grantee: GranteeItem) => void;
    onSharedGranteeDelete: (grantee: GranteeItem) => void;
    onAddGranteeBackClick: () => void;
    onAddGranteeButtonClick: () => void;
    onGranteeAdd: (grantee: GranteeItem) => void;
    onSubmitShareGrantee: () => void;
    onSubmitAddGrantee: () => void;
    isGranteesLoading: boolean;
    granteesToAdd: GranteeItem[];
    dialogMode: DialogModeType;
    isShareDialogDirty: boolean;
    isAddDialogDirty: boolean;
    sharedGrantees: GranteeItem[];
    appliedGranteesWithOwner: GranteeItem[];
}

/**
 * @internal
 */
export const useShareDialogBase = (props: IShareDialogBaseProps): IUseShareDialogBaseReturnType => {
    const { shareStatus, sharedObjectRef, owner, onSubmit, onError } = props;
    const {
        dialogMode,
        isGranteesLoading,
        grantees,
        granteesToAdd,
        granteesToDelete,
        onLoadGrantees,
        onSharedGranteeDelete,
        onAddedGranteeDelete,
        onGranteeAdd,
        onAddGranteeButtonClick,
        onAddGranteeBackClick,
    } = useShareDialogState();

    const onLoadGranteesSuccess = useCallback(
        (result: GranteeItem[]) => {
            const groupAll = mapShareStatusToGroupAll(shareStatus);
            onLoadGrantees(result, groupAll);
        },
        [onLoadGrantees, shareStatus],
    );

    useGetAccessList({ sharedObjectRef, onSuccess: onLoadGranteesSuccess, onError });

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
        onSubmit(grantees, granteesToAdd, granteesToDelete);
    }, [grantees, granteesToAdd, granteesToDelete, isShareDialogDirty, onSubmit]);

    const onSubmitAddGrantee = useCallback(() => {
        if (!isAddDialogDirty) {
            return;
        }
        onSubmit(grantees, granteesToAdd, granteesToDelete);
    }, [grantees, granteesToAdd, granteesToDelete, isAddDialogDirty, onSubmit]);

    const sharedGrantees = useMemo(() => {
        return notInArrayFilter(grantees, granteesToDelete);
    }, [grantees, granteesToDelete]);

    const appliedGranteesWithOwner = useMemo(() => {
        const appliedGrantees = getAppliedGrantees(grantees, granteesToAdd, granteesToDelete);
        if (isGranteeUserInactive(owner)) {
            return appliedGrantees;
        }
        return [...appliedGrantees, owner];
    }, [grantees, granteesToDelete, granteesToAdd]);

    return {
        onAddedGranteeDelete,
        onSharedGranteeDelete,
        onAddGranteeBackClick,
        onAddGranteeButtonClick,
        onGranteeAdd,
        onSubmitShareGrantee,
        onSubmitAddGrantee,
        isGranteesLoading,
        granteesToAdd,
        dialogMode,
        isShareDialogDirty,
        isAddDialogDirty,
        sharedGrantees,
        appliedGranteesWithOwner,
    };
};
