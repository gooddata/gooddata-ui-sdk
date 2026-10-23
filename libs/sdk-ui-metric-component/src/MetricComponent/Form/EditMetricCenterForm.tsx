// (C) 2021-2026 GoodData Corporation

import { memo, useCallback, useReducer, useState } from "react";

import { defineMessages } from "react-intl";

import { type ICatalogAttribute, type IMetadataObject } from "@gooddata/sdk-model";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { useFormValues } from "../../shared/Form/useFormValues.js";
import { useProp } from "../../shared/hooks/useProp.js";
import { type DefaultTheme, makeStyles } from "../../shared/theme/index.js";
import { useFeaturesAndSettings } from "../FeaturesAndSettings/index.js";
import { type IMeasureDef, type IMeasureSetting } from "../metric/metricHelpers.js";

import { useCatalog } from "./hooks/useCatalog.js";
import { useExecute } from "./hooks/useExecute.js";
import { useExplain } from "./hooks/useExplain.js";
import { MaqlEditorField } from "./MaqlEditorField/MaqlEditorField.js";
import { getMaqlValue } from "./maqlFieldFunctions.js";
import { MaqlResult } from "./MaqlResult/MaqlResult.js";
import { MaqlSql } from "./MaqlResult/MaqlSql.js";

const useStyles = makeStyles()((theme: DefaultTheme) => {
    return {
        maqlBlock: {
            flex: "1 1 auto",
            position: "relative",
            display: "flex",
            flexDirection: "column",
        },
        maqlExpression: {
            flex: "1 1 auto",
        },
        maqlResult: {
            flex: "0 0 auto",
        },
        sqlBlock: {
            flex: "1 1 auto",
            position: "relative",
            width: "50%",
            maxWidth: "50%",
        },
        line: {
            width: "100%",
            height: 1,
            background: theme.globals.colors.defaultBorderDarker,
        },
    };
});

const messages = defineMessages({
    copyOk: {
        id: "metricComponent.editMetric.metric.sql.copy_to_clipboard.ok",
    },
    copyError: {
        id: "metricComponent.editMetric.metric.sql.copy_to_clipboard.error",
    },
});

export const MaqlResultArea = "maql_result";

export interface IEditMetricCenterFormProps {
    sqlOpen: boolean;
    defaultDisplay: IMeasureSetting["display"];
    computedFor: string | null;
    defaultAttributes: ICatalogAttribute[];
    onMetricClick?: (object: IMetadataObject) => void;
    onSettingsChange?: (setting: Partial<IMeasureSetting>) => void;
}

function EditMetricCenterFormComponent({
    sqlOpen = false,
    computedFor = null,
    defaultAttributes = [],
    defaultDisplay,
    onMetricClick,
    onSettingsChange,
}: IEditMetricCenterFormProps) {
    const { classes } = useStyles();
    const { canShowResults, canShowSql } = useFeaturesAndSettings();
    const { expression } = useFormValues<IMeasureDef>();

    const { attributes, setAttributes } = useAttributes(defaultAttributes, onSettingsChange);
    const { display, setDisplay } = useDisplay(defaultDisplay, onSettingsChange);
    const run = useRun(computedFor, onSettingsChange);
    const sql = useSqlOpen(sqlOpen, onSettingsChange);

    return (
        <>
            <div className={classes.maqlBlock}>
                <div className={classes.maqlExpression}>
                    <MaqlEditorField
                        isSQL={sql.isSQL}
                        onMetricOpen={onMetricClick}
                        onSQL={() => sql.setSQL(true)}
                        onRun={() => run.setComputed(getMaqlValue(expression))}
                    />
                </div>
                {canShowResults && (
                    <EditMetricData
                        run={run}
                        attributes={attributes}
                        setAttributes={setAttributes}
                        display={display}
                        setDisplay={setDisplay}
                    />
                )}
            </div>
            {canShowSql && <EditMetricSql attributes={attributes} sql={sql} />}
        </>
    );
}

export const EditMetricCenterForm = memo(EditMetricCenterFormComponent);

function EditMetricSql({
    attributes,
    sql,
}: {
    attributes: ICatalogAttribute[];
    sql: ReturnType<typeof useSqlOpen>;
}) {
    const { classes } = useStyles();
    const measure = useFormValues<IMeasureDef>();

    const onCopyDone = useCopyStatus();

    const { isSQL, sqlId, setSQL } = sql;
    const explain = useExplain(measure, { attributes }, [sqlId]);

    if (!isSQL) {
        return null;
    }

    return (
        <div className={classes.sqlBlock}>
            <MaqlSql explain={explain} onCopy={onCopyDone} onClose={() => setSQL(false)} />
        </div>
    );
}

function EditMetricData({
    attributes,
    setAttributes,
    run,
    display,
    setDisplay,
}: {
    attributes: ICatalogAttribute[];
    setAttributes: (attributes: ICatalogAttribute[]) => void;
    display: IMeasureSetting["display"];
    setDisplay: (display: IMeasureSetting["display"]) => void;
    run: ReturnType<typeof useRun>;
}) {
    const { classes } = useStyles();
    const measure = useFormValues<IMeasureDef>();

    const { computed, setComputed } = run;

    const { result, status } = useCatalog(measure, attributes, [computed]);
    const catalogLoading = status === "loading" || status === "pending";

    const execute = useExecute(
        computed ? { ...measure, expression: computed } : null,
        { attributes, ...display },
        [computed, measure.format],
    );

    if (!execute) {
        return null;
    }

    return (
        <>
            <div className={classes.line} />
            <div className={classes.maqlResult} data-area={MaqlResultArea}>
                <MaqlResult
                    execute={execute}
                    attributes={attributes}
                    catalogLoading={catalogLoading}
                    catalog={result}
                    onContext={setAttributes}
                    display={display}
                    onDisplay={setDisplay}
                    onContextOpen={() => setComputed(getMaqlValue(measure.expression))}
                />
            </div>
        </>
    );
}

function useCopyStatus() {
    const { addSuccess, addError } = useToastMessage();

    return useCallback(
        (state: boolean) => {
            if (state) {
                addSuccess(messages.copyOk);
            } else {
                addError(messages.copyError);
            }
        },
        [addError, addSuccess],
    );
}

function useSqlOpen(sqlOpen: boolean, onSettingsChange?: (setting: Partial<IMeasureSetting>) => void) {
    const { expression } = useFormValues<IMeasureDef>();
    const expressionCurrent = getMaqlValue(expression);
    const [expressionSaved, setExpression] = useState(expressionCurrent);

    const [isSQL, setSQL] = useProp(sqlOpen);
    const [sqlId, generateId] = useReducer(rand, rand());

    return {
        isSQL,
        sqlId,
        setSQL: (sqlOpen: boolean) => {
            if (sqlOpen && expressionSaved !== expression) {
                setExpression(expression);
                generateId();
            }
            setSQL(sqlOpen);
            if (onSettingsChange) {
                onSettingsChange({ sqlOpen });
            }
        },
    };
}

function useRun(computedFor: string | null, onSettingsChange?: (setting: Partial<IMeasureSetting>) => void) {
    const [computed, setComputed] = useProp(computedFor);

    return {
        computed,
        setComputed: (computedFor: string) => {
            setComputed(computedFor);
            if (onSettingsChange) {
                onSettingsChange({ computedFor });
            }
        },
    };
}

function useAttributes(
    attrs: ICatalogAttribute[],
    onSettingsChange?: (setting: Partial<IMeasureSetting>) => void,
) {
    const [attributes, setAttributes] = useProp(attrs);

    return {
        attributes,
        setAttributes: (attributes: ICatalogAttribute[]) => {
            setAttributes(attributes);
            if (onSettingsChange) {
                onSettingsChange({ attributes });
            }
        },
    };
}

function useDisplay(
    disp: IMeasureSetting["display"],
    onSettingsChange?: (setting: Partial<IMeasureSetting>) => void,
) {
    const [display, setDisplay] = useProp<IMeasureSetting["display"]>(disp);

    return {
        display,
        setDisplay: (display: IMeasureSetting["display"]) => {
            setDisplay(display);
            if (onSettingsChange) {
                onSettingsChange({ display });
            }
        },
    };
}

function rand() {
    return Math.random().toString(36).slice(2);
}
