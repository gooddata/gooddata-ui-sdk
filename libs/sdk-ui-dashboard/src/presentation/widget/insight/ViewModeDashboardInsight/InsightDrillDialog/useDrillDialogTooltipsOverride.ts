// (C) 2026 GoodData Corporation

import { useEffect } from "react";

export const DRILL_DIALOG_OPENED_CLASSNAME = "gd-drill-dialog-opened";
export const DRILL_DIALOG_OPEN_COUNT_ATTRIBUTE = "data-gd-drill-dialog-count";

function getOpenDrillDialogCount(): number {
    const count = Number(document.body.getAttribute(DRILL_DIALOG_OPEN_COUNT_ATTRIBUTE));
    return Number.isInteger(count) && count > 0 ? count : 0;
}

function setOpenDrillDialogCount(count: number) {
    if (count > 0) {
        document.body.setAttribute(DRILL_DIALOG_OPEN_COUNT_ATTRIBUTE, String(count));
        document.body.classList.add(DRILL_DIALOG_OPENED_CLASSNAME);
    } else {
        document.body.removeAttribute(DRILL_DIALOG_OPEN_COUNT_ATTRIBUTE);
        document.body.classList.remove(DRILL_DIALOG_OPENED_CLASSNAME);
    }
}

export function useDrillDialogTooltipsOverride() {
    useEffect(() => {
        setOpenDrillDialogCount(getOpenDrillDialogCount() + 1);
        return () => {
            setOpenDrillDialogCount(getOpenDrillDialogCount() - 1);
        };
    }, []);
}
