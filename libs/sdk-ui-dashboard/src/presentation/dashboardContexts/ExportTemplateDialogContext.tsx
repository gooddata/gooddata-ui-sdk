// (C) 2026 GoodData Corporation

import { type ReactNode, createContext, useContext, useState } from "react";

import { type IExportTemplate } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IExportTemplateDialogConfig {
    templates: IExportTemplate[];
    onConfirm: (templateId: string) => void;
    onCancel?: () => void;
}

/**
 * @internal
 */
export interface IExportTemplateDialogContext {
    isOpen: boolean;
    dialogConfig: IExportTemplateDialogConfig | undefined;
    openDialog: (config: IExportTemplateDialogConfig) => void;
    closeDialog: () => void;
}

const ExportTemplateDialogContext = createContext<IExportTemplateDialogContext>({
    isOpen: false,
    dialogConfig: undefined,
    closeDialog: () => {},
    openDialog: () => {},
});

/**
 * @internal
 */
export const useExportTemplateDialogContext = (): IExportTemplateDialogContext => {
    return useContext(ExportTemplateDialogContext);
};

/**
 * @internal
 */
export function ExportTemplateDialogContextProvider({ children }: { children?: ReactNode }) {
    const [dialogConfig, setDialogConfig] = useState<IExportTemplateDialogConfig | undefined>(undefined);

    const openDialog = (config: IExportTemplateDialogConfig) => {
        setDialogConfig(config);
    };

    const closeDialog = () => {
        setDialogConfig(undefined);
    };

    return (
        <ExportTemplateDialogContext.Provider
            value={{ isOpen: dialogConfig !== undefined, dialogConfig, openDialog, closeDialog }}
        >
            {children}
        </ExportTemplateDialogContext.Provider>
    );
}
