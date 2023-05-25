// (C) 2021 GoodData Corporation
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import noop from "lodash/noop.js";
import { IExportDialogBaseProps } from "@gooddata/sdk-ui-kit";

export interface ExportDialogConfig extends Omit<IExportDialogBaseProps, "children"> {
    onSubmit?: (params: { includeFilterContext: boolean; mergeHeaders: boolean }) => void;
}

/**
 * @internal
 */
export interface IExportDialogContext {
    isOpen: boolean;
    dialogConfig: ExportDialogConfig;
    openDialog: (config?: ExportDialogConfig) => void;
    closeDialog: () => void;
}

const ExportDialogContext = createContext<IExportDialogContext>({
    isOpen: false,
    dialogConfig: {},
    closeDialog: noop,
    openDialog: noop,
});

/**
 * @internal
 */
export const useExportDialogContext = (): IExportDialogContext => {
    return useContext(ExportDialogContext);
};

/**
 * @internal
 */
export const ExportDialogContextProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState<ExportDialogConfig>({});

    const openDialog = useCallback((config: ExportDialogConfig = {}) => {
        setIsOpen(true);
        setDialogConfig(config);
    }, []);

    const closeDialog = useCallback(() => {
        setIsOpen(false);
    }, []);

    const contextValue = useMemo(
        () => ({ isOpen, dialogConfig, openDialog, closeDialog }),
        [isOpen, dialogConfig, openDialog, closeDialog],
    );

    return <ExportDialogContext.Provider value={contextValue}>{children}</ExportDialogContext.Provider>;
};
