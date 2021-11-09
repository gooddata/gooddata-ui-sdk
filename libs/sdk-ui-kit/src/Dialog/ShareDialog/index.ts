// (C) 2021 GoodData Corporation

//share dialog
export type { IShareDialogProps, ISharingApplyPayload } from "./types";

export { ShareDialog } from "./ShareDialog";

// export of internal base dialogs
export type {
    GranteeType,
    GranteeItem,
    IGranteeBase,
    IGranteeUser,
    IGranteeGroup,
    IGranteeGroupAll,
    IGranteeUserInactive,
    IShareDialogBaseProps,
    IGranteeItemProps,
    IShareGranteeBaseProps,
    IShareGranteeContentProps,
    IAddGranteeBaseProps,
    DialogModeType,
} from "./ShareDialogBase/types";

export { isGranteeUser, isGranteeGroup } from "./ShareDialogBase/types";

export { ShareDialogBase } from "./ShareDialogBase/ShareDialogBase";

export { ShareGranteeBase } from "./ShareDialogBase/ShareGranteeBase";

export { AddGranteeBase } from "./ShareDialogBase/AddGranteeBase";

export { GranteeItemComponent } from "./ShareDialogBase/GranteeItem";

export { getGranteeItemTestId } from "./ShareDialogBase/utils";
