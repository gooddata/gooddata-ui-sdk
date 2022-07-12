// (C) 2007-2022 GoodData Corporation
import React, { useState, useCallback, useEffect } from "react";
import { useDataExport, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { IExportConfig, IPreparedExecution } from "@gooddata/sdk-backend-spi";

import * as Md from "../../md/full";

interface IButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    disabled: boolean;
}

export const Button: React.FC<IButtonProps> = ({ children, onClick, disabled }) => (
    <button
        className={`gd-button gd-button-secondary ${disabled ? "disabled" : ""}`}
        onClick={onClick}
        disabled={disabled}
    >
        {children}
    </button>
);

const DownloaderId = "downloader";
export const downloadFile = (uri: string) => {
    let anchor = document.getElementById(DownloaderId);
    if (!anchor) {
        anchor = document.createElement("a");
        anchor.id = DownloaderId;
        document.body.appendChild(anchor);
    }
    (anchor as any).href = uri;
    anchor.click();
};

export const UseDataExportExample: React.FC = () => {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const [{ execution, exportConfig }, setExecution] = useState<{
        execution: IPreparedExecution | null;
        exportConfig: IExportConfig;
    }>({
        execution: null,
        exportConfig: {},
    });

    const onExecute = useCallback(
        (exportConfig: IExportConfig) => {
            setExecution({
                execution: backend
                    .workspace(workspace)
                    .execution()
                    .forItems([Md.LocationState, Md.LocationName.Default]),
                exportConfig,
            });
        },
        [backend, workspace],
    );

    const reset = useCallback(() => {
        setExecution({
            execution: null,
            exportConfig: {},
        });
    }, []);

    const { status, result } = useDataExport({ execution, exportConfig });

    useEffect(() => {
        if (result) {
            downloadFile(result);
            reset();
        }
    }, [result, reset]);

    return (
        <div>
            <p>
                <b>Hook status:</b> <i>{status}</i>
            </p>
            <Button onClick={() => onExecute({ format: "csv" })} disabled={status === "loading"}>
                Custom export
            </Button>
        </div>
    );
};
