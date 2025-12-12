// (C) 2021-2025 GoodData Corporation

import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";

import { type IExportDialogBaseProps } from "@gooddata/sdk-ui-kit";

export type ExportXlsxDialogConfig = Omit<IExportDialogBaseProps, "children">;

/**
 * @internal
 */
export interface IExportXlsxDialogContext {
    isOpen: boolean;
    dialogConfig: ExportXlsxDialogConfig;
    openDialog: (config?: ExportXlsxDialogConfig) => void;
    closeDialog: () => void;
}

const ExportXlsxDialogContext = createContext<IExportXlsxDialogContext>({
    isOpen: false,
    dialogConfig: {},
    closeDialog: () => {},
    openDialog: () => {},
});

/**
 * @internal
 */
export const useExportXlsxDialogContext = (): IExportXlsxDialogContext => {
    return useContext(ExportXlsxDialogContext);
};

/**
 * @internal
 */
export function ExportXlsxDialogContextProvider({ children }: { children?: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState<ExportXlsxDialogConfig>({});

    const openDialog = useCallback((config: ExportXlsxDialogConfig = {}) => {
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

    return (
        <ExportXlsxDialogContext.Provider value={contextValue}>{children}</ExportXlsxDialogContext.Provider>
    );
}
