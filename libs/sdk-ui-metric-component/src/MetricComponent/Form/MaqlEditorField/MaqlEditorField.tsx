// (C) 2021-2026 GoodData Corporation

import { useCallback, useRef, useState } from "react";

import { defineMessages } from "react-intl";

import { type IMetadataObject } from "@gooddata/sdk-model";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { type IMaqlEditorApi } from "../../../MaqlEditor/maql/MaqlEditor.js";
import { makeStyles } from "../../../shared/theme/index.js";
import { FormField } from "../data.js";
import { useMetricFormField } from "../hooks/useMetricFormField.js";
import { getMaqlValue } from "../maqlFieldFunctions.js";

import { MaqlEditorEditor } from "./MaqlEditorEditor.js";
import { HeaderAction, MaqlEditorHeader } from "./MaqlEditorHeader.js";

const useStyles = makeStyles()((theme) => ({
    root: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: theme.globals.colors.editorBackground,
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
}));

export interface IMaqlEditorFieldProps {
    isSQL: boolean;
    onSQL?: () => void;
    onRun?: () => void;
    onMetricOpen?: (object: IMetadataObject) => void;
}

const messages = defineMessages({
    runSuccess: {
        id: "metricComponent.editMetric.run.success",
    },
});

export function MaqlEditorField({ isSQL, onSQL, onRun, onMetricOpen }: IMaqlEditorFieldProps) {
    const { classes, cx } = useStyles();
    const { value } = useMetricFormField(FormField.expression);
    const api = useRef<IMaqlEditorApi | null>(null);

    const [titles, setTitles] = useState(true);

    const { addSuccess } = useToastMessage();
    const onRunWithAck = useCallback(() => {
        addSuccess(messages.runSuccess);
        if (onRun) {
            onRun();
        }
    }, [onRun, addSuccess]);

    return (
        <div className={cx(classes.root)}>
            <div className={cx(classes.headerHolder)}>
                <MaqlEditorHeader
                    areTitles={titles}
                    isSQL={isSQL}
                    isMaqlDefined={!!getMaqlValue(value)}
                    onAction={(action) => {
                        switch (action) {
                            case HeaderAction.Format:
                                api.current?.autoformat();
                                break;
                            case HeaderAction.Titles:
                                setTitles(!titles);
                                break;
                            case HeaderAction.SQL:
                                if (onSQL) {
                                    onSQL();
                                }
                                break;
                            case HeaderAction.Run:
                                if (onRun) {
                                    onRun();
                                }
                                break;
                        }
                    }}
                />
            </div>
            <div className={cx(classes.contentHolder)}>
                <MaqlEditorEditor
                    ref={api}
                    titles={titles}
                    onMetricOpen={onMetricOpen}
                    onRun={onRunWithAck}
                />
            </div>
        </div>
    );
}
