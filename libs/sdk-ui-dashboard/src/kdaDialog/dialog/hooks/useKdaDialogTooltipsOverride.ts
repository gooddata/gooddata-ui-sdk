// (C) 2025 GoodData Corporation

import { useEffect } from "react";

const CLASSNAME = "gd-kda-dialog-opened";

export function useKdaDialogTooltipsOverride() {
    useEffect(() => {
        document.body.classList.add(CLASSNAME);
        return () => {
            document.body.classList.remove(CLASSNAME);
        };
    }, []);
}
