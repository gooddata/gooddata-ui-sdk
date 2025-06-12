// (C) 2022 GoodData Corporation

import React from "react";
import cx from "classnames";

import { DialogListLoading } from "./DialogListLoading.js";
import { DialogListEmpty } from "./DialogListEmpty.js";
import { DialogListItemBasic } from "./DialogListItemBasic.js";
import { IDialogListProps } from "./typings.js";

/**
 * @internal
 */
export const DialogList: React.VFC<IDialogListProps> = (props) => {
    const {
        items,
        isLoading,
        className,
        emptyMessageElement,
        itemComponent,
        itemClassName,
        onItemClick,
        onItemDelete,
    } = props;

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
};
