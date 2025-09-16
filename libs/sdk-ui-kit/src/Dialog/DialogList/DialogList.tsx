// (C) 2022-2025 GoodData Corporation

import cx from "classnames";

import { DialogListEmpty } from "./DialogListEmpty.js";
import { DialogListItemBasic } from "./DialogListItemBasic.js";
import { DialogListLoading } from "./DialogListLoading.js";
import { IDialogListProps } from "./typings.js";

/**
 * @internal
 */
export function DialogList({
    items,
    isLoading,
    className,
    emptyMessageElement,
    itemComponent,
    itemClassName,
    onItemClick,
    onItemDelete,
}: IDialogListProps) {
    if (isLoading) {
        return <DialogListLoading />;
    }

    if (items.length === 0) {
        return <DialogListEmpty message={emptyMessageElement} />;
    }

    const ListItemComponent = itemComponent ?? DialogListItemBasic;
    const classNames = cx("gd-dialog-list-wrapper s-dialog-list-wrapper", className);

    return (
        <div className={classNames}>
            <div className="gd-dialog-list">
                {items.map((item) => (
                    <ListItemComponent
                        key={item.id}
                        className={itemClassName}
                        item={item}
                        onClick={onItemClick}
                        onDelete={onItemDelete}
                    />
                ))}
            </div>
        </div>
    );
}
