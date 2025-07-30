// (C) 2022-2025 GoodData Corporation

import { ReactElement } from "react";

/**
 * @internal
 */
export interface IDialogListItemBase {
    id: string;
    title: string;
}

/**
 * @internal
 */
export interface IDialogListItem extends IDialogListItemBase {
    subtitle?: string;
    icon?: ReactElement;
    isDisabled?: boolean;
    isClickable?: boolean;
    isDeletable?: boolean;
    deleteTooltipText?: string;
    action?: ReactElement;
}

/**
 * @internal
 */
export interface IDialogListItemComponentProps<T extends IDialogListItem = IDialogListItem> {
    item: T;
    className?: string;
    onClick?: (item: T) => void;
    onDelete?: (item: T) => void;
}

/**
 * @internal
 */
export type DialogListItemComponent<T extends IDialogListItem = IDialogListItem> = React.FunctionComponent<
    IDialogListItemComponentProps<T>
>;

/**
 * @internal
 */
export interface IDialogListProps<T extends IDialogListItem = IDialogListItem> {
    items: Array<T>;
    isLoading?: boolean;
    className?: string;
    emptyMessageElement?: ReactElement;
    itemComponent?: DialogListItemComponent<T>;
    itemClassName?: string;
    onItemClick?: (item: T) => void;
    onItemDelete?: (item: T) => void;
}
