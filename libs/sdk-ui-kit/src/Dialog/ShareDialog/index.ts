// (C) 2021 GoodData Corporation

//share dialog
export type { ISharedObject, IShareDialogProps, ISharingApplyPayload, IShareDialogLabels } from "./types";

export { ShareDialog } from "./ShareDialog";

// export of internal base dialogs
export type {
    GranteeType,
    GranteeStatus,
    GranteeItem,
    IGranteeBase,
    IGranteeUser,
    IGranteeGroup,
    IGranteeGroupAll,
    IGranteeInactiveOwner,
    IShareDialogBaseProps,
    IGranteeItemProps,
    IShareGranteeBaseProps,
    IShareGranteeContentProps,
    IAddGranteeBaseProps,
    DialogModeType,
    IAffectedSharedObject,
    IComponentLabelsProviderProps,
} from "./ShareDialogBase/types";

export { isGranteeUser, isGranteeGroup } from "./ShareDialogBase/types";

export { ShareDialogBase } from "./ShareDialogBase/ShareDialogBase";

export { ShareGranteeBase } from "./ShareDialogBase/ShareGranteeBase";

export { AddGranteeBase } from "./ShareDialogBase/AddGranteeBase";

export { GranteeItemComponent } from "./ShareDialogBase/GranteeItem";

export { ComponentLabelsProvider } from "./ShareDialogBase/ComponentLabelsContext";

export { getGranteeItemTestId } from "./ShareDialogBase/utils";
