// (C) 2021-2026 GoodData Corporation

import { useRef } from "react";

import { ErrorComponent } from "@gooddata/sdk-ui";
import { LoadingSpinner } from "@gooddata/sdk-ui-kit";

import { type ISqlEditorApi, SqlEditor } from "../../../MaqlEditor/sql/SqlEditor.js";
import { makeStyles } from "../../../shared/theme/index.js";
import { type useExplain } from "../hooks/useExplain.js";

import { HeaderAction, MaqlSqlHeader } from "./MaqlSqlHeader.js";

const useStyles = makeStyles()((theme) => ({
    root: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: theme.globals.colors.editorBackground,
        borderLeft: `1px solid ${theme.globals.colors.defaultBorderDarker}`,
    },
    headerHolder: {
        flex: "0 0 auto",
        display: "flex",
        height: 36,
    },
    contentHolder: {
        flex: "1 1 auto",
        display: "flex",
        position: "relative",
    },
    loading: {
        position: "absolute",
        top: "50%",
        left: "50%",
        marginLeft: "-16px",
        marginTop: "-16px",
    },
}));

export interface IMaqlSqlProps {
    explain: ReturnType<typeof useExplain>;
    onClose?: () => void;
    onCopy?: (status: boolean) => void;
}

export function MaqlSql({ explain, onClose, onCopy }: IMaqlSqlProps) {
    const { classes, cx } = useStyles();
    const { sql, status, error } = explain;
    const api = useRef<ISqlEditorApi | null>(null);

    return (
        <div className={cx(classes.root)}>
            <div className={cx(classes.headerHolder)}>
                <MaqlSqlHeader
                    canCopy={!!explain.sql}
                    onAction={(action) => {
                        switch (action) {
                            case HeaderAction.Copy:
                                if (onCopy) {
                                    onCopy(api.current?.copy() ?? false);
                                }
                                break;
                            case HeaderAction.Close:
                                if (onClose) {
                                    onClose();
                                }
                                break;
                        }
                    }}
                />
            </div>
            <div className={cx(classes.contentHolder)}>
                {(status === "loading" || status === "pending") && (
                    <LoadingSpinner className={cx(classes.loading, "large")} />
                )}
                {status === "success" && sql && (
                    <SqlEditor defaultValue={sql} readonly inline={false} ref={api} />
                )}
                {status === "error" && error && (
                    <ErrorComponent message={error.name} description={error.message} />
                )}
            </div>
        </div>
    );
}
