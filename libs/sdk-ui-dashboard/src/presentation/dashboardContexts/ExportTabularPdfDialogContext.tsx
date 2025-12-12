// (C) 2025 GoodData Corporation

import { type ReactNode, createContext, useContext, useState } from "react";

import { type IExportTabularPdfDialogProps } from "@gooddata/sdk-ui-kit";

export type IExportTabularPdfDialogConfig = Omit<IExportTabularPdfDialogProps, "children">;

interface IExportTabularPdfDialogContextValue {
    isOpen: boolean;
    config: IExportTabularPdfDialogConfig;
    openDialog: (config: IExportTabularPdfDialogConfig) => void;
    closeDialog: () => void;
}

const ExportTabularPdfDialogContext = createContext<IExportTabularPdfDialogContextValue | undefined>(
    undefined,
);

/**
 * @internal
 */
export function ExportTabularPdfDialogContextProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [config, setConfig] = useState<IExportTabularPdfDialogConfig>({});

    const openDialog = (newConfig: IExportTabularPdfDialogConfig) => {
        setConfig(newConfig);
        setIsOpen(true);
    };

    const closeDialog = () => {
        setIsOpen(false);
        // Keep config intact - it might be useful for reopening with same settings
    };

    const value: IExportTabularPdfDialogContextValue = {
        isOpen,
        config,
        openDialog,
        closeDialog,
    };

    return (
        <ExportTabularPdfDialogContext.Provider value={value}>
            {children}
        </ExportTabularPdfDialogContext.Provider>
    );
}

/**
 * @internal
 */
export const useExportTabularPdfDialogContext = (): IExportTabularPdfDialogContextValue => {
    const context = useContext(ExportTabularPdfDialogContext);
    if (!context) {
        throw new Error(
            "useExportTabularPdfDialogContext must be used within ExportTabularPdfDialogContextProvider",
        );
    }
    return context;
};
