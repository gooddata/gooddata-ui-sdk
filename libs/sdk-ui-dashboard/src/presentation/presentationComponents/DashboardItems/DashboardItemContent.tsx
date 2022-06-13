// (C) 2020-2022 GoodData Corporation
import React, { forwardRef } from "react";
import isEqual from "lodash/isEqual";
import noop from "lodash/noop";
import cx from "classnames";
import { useDashboardDispatch, useDashboardSelector, uiActions } from "../../../model";
import { selectSelectedWidgetRef } from "../../../model/store/ui/uiSelectors";
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

        if (isSelectable) {
            className += " is-selectable";
        }

        if (isEqual(selectedWidget, objRef)) {
            className += " is-selected";
        }

        const onClick = isSelectable ? () => objRef && dispatch(uiActions.selectWidget(objRef)) : noop;

        return (
            <div className={cx("dash-item-content", className)} ref={ref} onClick={onClick}>
                {children}
            </div>
        );
    },
);
