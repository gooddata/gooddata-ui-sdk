// (C) 2021-2026 GoodData Corporation

import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";

import { type IExportDialogBaseProps } from "@gooddata/sdk-ui-kit";

export type ExportXlsxDialogConfig = Omit<IExportDialogBaseProps, "children">;

/**
 * @internal
 */
export interface IExportXlsxDialogContext {
    isOpen: boolean;
    dialogConfig: ExportXlsxDialogConfig;
    /**
     * Id of the element that receives focus when the dialog closes (typically the trigger of the export flow).
     */
    returnFocusTo?: string;
    openDialog: (config?: ExportXlsxDialogConfig, returnFocusTo?: string) => void;
    closeDialog: () => void;
}

const ExportXlsxDialogContext = createContext<IExportXlsxDialogContext>({
    isOpen: false,
    dialogConfig: {},
    returnFocusTo: undefined,
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
    const [returnFocusTo, setReturnFocusTo] = useState<string>();

    const openDialog = useCallback((config: ExportXlsxDialogConfig = {}, focusTarget?: string) => {
        setIsOpen(true);
        setDialogConfig(config);
        setReturnFocusTo(focusTarget);
    }, []);

    const closeDialog = useCallback(() => {
        setIsOpen(false);
    }, []);

    const contextValue = useMemo(
        () => ({ isOpen, dialogConfig, returnFocusTo, openDialog, closeDialog }),
        [isOpen, dialogConfig, returnFocusTo, openDialog, closeDialog],
    );

    return (
        <ExportXlsxDialogContext.Provider value={contextValue}>{children}</ExportXlsxDialogContext.Provider>
    );
}
