// (C) 2020-2022 GoodData Corporation
import React, { forwardRef } from "react";
import isEqual from "lodash/isEqual";
import noop from "lodash/noop";
import cx from "classnames";
import {
    useDashboardDispatch,
    useDashboardSelector,
    uiActions,
    selectSelectedWidgetRef,
} from "../../../model";
import { ObjRef } from "@gooddata/sdk-model";

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

        const onClick = isSelectable ? () => objRef && dispatch(uiActions.selectWidget(objRef)) : noop;

        return (
            <div
                className={cx("dash-item-content", className, {
                    "is-selectable": isSelectable,
                    "is-selected": isEqual(selectedWidget, objRef),
                })}
                ref={ref}
                onClick={onClick}
            >
                {children}
            </div>
        );
    },
);
