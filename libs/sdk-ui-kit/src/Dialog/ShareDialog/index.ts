// (C) 2021-2023 GoodData Corporation

//share dialog
export type {
    ISharedObject,
    IShareDialogProps,
    ISharingApplyPayload,
    IShareDialogLabels,
    CurrentUserPermissions,
    ShareDialogInteractionType,
    IShareDialogInteractionData,
    ShareDialogInteractionGranteeData,
} from "./types.js";

export { ShareDialog } from "./ShareDialog.js";

// export of internal base dialogs
export type {
    GranteeType,
    GranteeStatus,
    GranteeItem,
    IGranteeBase,
    IGranteeUser,
    IGranteeGroup,
    IGranteeGroupAll,
    IGranularGranteeUser,
    IGranularGranteeGroup,
    IGranteeInactiveOwner,
    IShareDialogBaseProps,
    IGranteeItemProps,
    IShareGranteeBaseProps,
    IShareGranteeContentProps,
    IAddGranteeBaseProps,
    DialogModeType,
    IAffectedSharedObject,
    IComponentLabelsProviderProps,
} from "./ShareDialogBase/types.js";

export {
    isGranteeUser,
    isGranteeGroup,
    isGranularGranteeUser,
    isGranularGranteeGroup,
} from "./ShareDialogBase/types.js";

export { ShareDialogBase } from "./ShareDialogBase/ShareDialogBase.js";

export { ShareGranteeBase } from "./ShareDialogBase/ShareGranteeBase.js";

export { AddGranteeBase } from "./ShareDialogBase/AddGranteeBase.js";

export { GranteeItemComponent } from "./ShareDialogBase/GranteeItem.js";

export { ComponentLabelsProvider } from "./ShareDialogBase/ComponentLabelsContext.js";

export { getGranteeItemTestId } from "./ShareDialogBase/utils.js";
