// (C) 2021-2025 GoodData Corporation

import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";

import { IExportDialogBaseProps } from "@gooddata/sdk-ui-kit";

export type ExportDialogConfig = Omit<IExportDialogBaseProps, "children">;

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
    closeDialog: () => {},
    openDialog: () => {},
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
export function ExportDialogContextProvider({ children }: { children?: ReactNode }) {
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
}
