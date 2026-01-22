// (C) 2021-2026 GoodData Corporation

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
export {
    isGranteeUser,
    isGranteeGroup,
    isGranularGranteeUser,
    isGranularGranteeGroup,
    isGranteeRules,
    type GranteeType,
    type GranteeStatus,
    type GranteeItem,
    type IGranteeBase,
    type IGranteeUser,
    type IGranteeGroup,
    type IGranteeGroupAll,
    type IGranularGranteeUser,
    type IGranularGranteeGroup,
    type IGranteeRules,
    type IGranteeInactiveOwner,
    type IShareDialogBaseProps,
    type IGranteeItemProps,
    type IShareGranteeBaseProps,
    type IShareGranteeContentProps,
    type IAddGranteeBaseProps,
    type DialogModeType,
    type IAffectedSharedObject,
    type IComponentLabelsProviderProps,
} from "./ShareDialogBase/types.js";

export { ShareDialogBase } from "./ShareDialogBase/ShareDialogBase.js";

export { ShareGranteeBase } from "./ShareDialogBase/ShareGranteeBase.js";

export { AddGranteeBase } from "./ShareDialogBase/AddGranteeBase.js";

export { GranteeItemComponent } from "./ShareDialogBase/GranteeItem.js";

export { ComponentLabelsProvider } from "./ShareDialogBase/ComponentLabelsContext.js";

export { getGranteeItemTestId } from "./ShareDialogBase/utils.js";
