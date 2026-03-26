// (C) 2026 GoodData Corporation

import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";

export interface IExportCsvDialogData {
    delimiter: string;
}

export interface IExportCsvDialogConfig {
    initialDelimiter?: string;
    onSubmit: (data: IExportCsvDialogData) => void;
}

/**
 * @internal
 */
export interface IExportCsvDialogContext {
    isOpen: boolean;
    dialogConfig?: IExportCsvDialogConfig;
    openDialog: (config: IExportCsvDialogConfig) => void;
    closeDialog: () => void;
}

const ExportCsvDialogContext = createContext<IExportCsvDialogContext>({
    isOpen: false,
    dialogConfig: undefined,
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

    const openDialog = useCallback((config: IExportCsvDialogConfig) => {
        setDialogConfig(config);
        setIsOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setIsOpen(false);
    }, []);

    const contextValue = useMemo(
        () => ({ isOpen, dialogConfig, openDialog, closeDialog }),
        [isOpen, dialogConfig, openDialog, closeDialog],
    );

    return <ExportCsvDialogContext.Provider value={contextValue}>{children}</ExportCsvDialogContext.Provider>;
}
