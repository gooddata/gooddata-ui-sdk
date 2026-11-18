// (C) 2026 GoodData Corporation

import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";

export interface IExportCsvDialogData {
    delimiter?: string;
}

export interface IExportCsvDialogConfig {
    onSubmit: (data: IExportCsvDialogData) => void;
}

/**
 * @internal
 */
export interface IExportCsvDialogContext {
    isOpen: boolean;
    dialogConfig?: IExportCsvDialogConfig;
    /**
     * Id of the element that receives focus when the dialog closes (typically the trigger of the export flow).
     */
    returnFocusTo?: string;
    openDialog: (config: IExportCsvDialogConfig, returnFocusTo?: string) => void;
    closeDialog: () => void;
}

const ExportCsvDialogContext = createContext<IExportCsvDialogContext>({
    isOpen: false,
    dialogConfig: undefined,
    returnFocusTo: undefined,
    closeDialog: () => {},
    openDialog: () => {},
});

/**
 * @internal
 */
export const useExportCsvDialogContext = (): IExportCsvDialogContext => {
    return useContext(ExportCsvDialogContext);
};

/**
 * @internal
 */
export function ExportCsvDialogContextProvider({ children }: { children?: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState<IExportCsvDialogConfig>();
    const [returnFocusTo, setReturnFocusTo] = useState<string>();

    const openDialog = useCallback((config: IExportCsvDialogConfig, focusTarget?: string) => {
        setDialogConfig(config);
        setReturnFocusTo(focusTarget);
        setIsOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setIsOpen(false);
    }, []);

    const contextValue = useMemo(
        () => ({ isOpen, dialogConfig, returnFocusTo, openDialog, closeDialog }),
        [isOpen, dialogConfig, returnFocusTo, openDialog, closeDialog],
    );

    return <ExportCsvDialogContext.Provider value={contextValue}>{children}</ExportCsvDialogContext.Provider>;
}
