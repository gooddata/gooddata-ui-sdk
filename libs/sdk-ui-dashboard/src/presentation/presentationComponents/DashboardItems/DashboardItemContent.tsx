// (C) 2020-2022 GoodData Corporation
import React, { forwardRef, useCallback } from "react";
import cx from "classnames";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import {
    useDashboardDispatch,
    useDashboardSelector,
    uiActions,
    selectSelectedWidgetRef,
} from "../../../model";

interface IDashboardItemContentProps {
    className?: string;
    children?: React.ReactNode;
    isSelectable?: boolean;
    objRef?: ObjRef;
}

export const DashboardItemContent = forwardRef<HTMLDivElement, IDashboardItemContentProps>(
    function DashboardItemContent({ children, className, isSelectable, objRef }, ref) {
        const selectedWidget = useDashboardSelector(selectSelectedWidgetRef);
        const dispatch = useDashboardDispatch();
        const onClick = useCallback(() => {
            if (isSelectable && objRef) {
                dispatch(uiActions.selectWidget(objRef));
            }
        }, [isSelectable, objRef, dispatch]);

        return (
            <div
                className={cx("dash-item-content", className, {
                    "is-selectable": isSelectable,
                    "is-selected": isSelectable && selectedWidget && areObjRefsEqual(selectedWidget, objRef),
                })}
                ref={ref}
                onClick={onClick}
            >
                {children}
            </div>
        );
    },
);
