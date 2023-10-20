// (C) 2023 GoodData Corporation

import { useState } from "react";

import { DialogMode } from "./types.js";

export const useShareDialogBase = () => {
    const [dialogMode, setDialogMode] = useState<DialogMode>("WORKSPACE_VIEW");

    return {
        dialogMode,
        setDialogMode,
    }
}
