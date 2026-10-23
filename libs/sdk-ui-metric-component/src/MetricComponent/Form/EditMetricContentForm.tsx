// (C) 2021-2026 GoodData Corporation

import { type ReactElement, type Ref, forwardRef, useMemo, useRef } from "react";

import classNames from "classnames";

import { type IMeasureReferencing } from "@gooddata/sdk-backend-spi";
import {
    type IInsight,
    type IMetadataObject,
    type ISeparators,
    type IWorkspacePermissions,
    canEditMetric,
    canShareMetric,
    isMeasureMetadataObject,
    isMeasureMetadataObjectDefinition,
} from "@gooddata/sdk-model";
import { type IObjectShareDraft } from "@gooddata/sdk-ui-ext";

import { FormMode } from "../../shared/Form/data.js";
import { FormProvider, type FormProviderComponent } from "../../shared/Form/Form.js";
import { type IFormApi } from "../../shared/Form/FormApi.js";
import { handler, useApi } from "../../shared/hooks/useApi.js";
import { type DefaultTheme, makeStyles } from "../../shared/theme/index.js";
import { useFeaturesAndSettings } from "../FeaturesAndSettings/index.js";
import { type IMeasureDef, type IMeasureSetting } from "../metric/metricHelpers.js";
import { transformToMetricDefinition } from "../metric/transformer.js";

import { CloseButton } from "./CloseButton/CloseButton.js";
import { type FormField, type ValidationSpecialInfo } from "./data.js";
import { EditMetricCenterForm } from "./EditMetricCenterForm.js";
import { EditMetricContentFooter } from "./Footer/EditMetricContentFooter.js";
import { EditMetricContentHeader } from "./Header/EditMetricContentHeader.js";
import { MetricTagsField } from "./Header/MetricTagsField.js";
import { useInvalidFocus } from "./hooks/useInvalidFocus.js";
import { useMetricValidation } from "./hooks/useMetricValidation.js";
import { EditMetricContentNumberFormat } from "./NumberFormat/EditMetricContentNumberFormat.js";

const useStyles = makeStyles()((theme: DefaultTheme) => {
    const headerSize = 107;
    const footerSize = 138;

    return {
        root: {
            width: "100%",
            height: "100%",

            "*": {
                boxSizing: "border-box",
            },
        },
        form: {
            width: "100%",
            height: "100%",
            backgroundColor: theme.globals.colors.defaultWhite,
            display: "flex",
            minHeight: `calc(50vh + ${headerSize}px + ${footerSize}px)`,
            flexDirection: "column",
        },
        line: {
            width: "100%",
            height: 1,
            background: theme.globals.colors.defaultBorderDarker,
        },
        smallLine: {
            height: 1,
            background: theme.globals.colors.line,
            margin: "0 20px",

            "&:last-child": {
                display: "none",
            },
        },
        space: {
            height: 16,
        },
        headerBlock: { flex: "0 0 auto" },
        centerBlock: { flex: "1 1 auto", display: "flex" },
        footerBlock: { flex: "0 0 auto" },
        footerContent: {
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: 20,
            flexWrap: "wrap",
        },
        tagsSection: {
            display: "flex",
            alignItems: "center",
            minWidth: 200,
            flex: "1 1 auto",
        },
    };
});

export interface IEditMetricDialogFormApi {
    close: () => void;
    save: () => Promise<void>;
    saveAs: () => Promise<void>;
    saveForce: (data?: Partial<IMeasureDef>) => Promise<void>;
}

export interface IEditMetricDialogFormProps {
    metric: IMeasureDef;
    setting: IMeasureSetting;
    permissions: IWorkspacePermissions;
    initialFocus?: FormField;
    usage?: IMeasureReferencing;
    regenerateId?: boolean;
    showCloseButton?: boolean;
    ref?: Ref<IEditMetricDialogFormApi | undefined>;
    onSave: (metric: IMeasureDef, force?: boolean) => Promise<void>;
    onSaveAs: (metric: IMeasureDef) => Promise<void>;
    onDelete: () => void;
    onClose: (metric: Partial<IMeasureDef>, valid: boolean) => void;
    onCancel: () => void;
    onDirtyChanged?: (dirty: boolean) => void;
    onValueChange?: (metric: IMeasureDef, valid: boolean) => void;
    onSettingsChange?: (setting: Partial<IMeasureSetting>) => void;
    activeInsight?: IInsight;
    insightOpenType?: "external" | "internal";
    onInsightClick?: (object: IInsight) => void;
    metricOpenType?: "external" | "internal";
    onMetricClick?: (object: IMetadataObject) => void;
    isWhiteLabeled?: boolean;
    separators?: ISeparators;
    useReferences?: boolean;
    currencyFormatOverride?: string | null;
    enableMetricFormatOverrides?: boolean;
    /** Access drafted so far, kept by the tab. */
    draftAccess?: IObjectShareDraft;
    onDraftAccessChange?: (draftAccess: IObjectShareDraft | undefined) => void;
}

const FormComponent = FormProvider as FormProviderComponent<IMeasureDef, ValidationSpecialInfo>;

export const EditMetricContentForm = forwardRef<
    IEditMetricDialogFormApi | undefined,
    IEditMetricDialogFormProps
>(function EditMetricContentForm(
    {
        metric,
        setting,
        permissions,
        initialFocus,
        usage,
        regenerateId,
        showCloseButton = true,
        onSave,
        onSaveAs,
        onDelete,
        onClose,
        onCancel,
        onDirtyChanged,
        onValueChange,
        onSettingsChange,
        metricOpenType,
        onMetricClick,
        activeInsight,
        insightOpenType,
        onInsightClick,
        isWhiteLabeled,
        separators,
        useReferences,
        currencyFormatOverride,
        enableMetricFormatOverrides,
        draftAccess,
        onDraftAccessChange,
    }: IEditMetricDialogFormProps,
    ref,
): ReactElement {
    const { classes } = useStyles();
    const { enableMetricPermissions } = useFeaturesAndSettings();
    const comp = useRef<IFormApi<IMeasureDef>>(undefined);
    const locked = metric.isLocked || false;

    const { computedFor, sqlOpen, display, attributes } = setting;

    const invalidFocusHandler = useInvalidFocus();
    const metricValidationHandler = useMetricValidation(locked, {
        allowEmptyCurrencyFormat: Boolean(currencyFormatOverride),
        validateCurrencyMetricType: Boolean(enableMetricFormatOverrides),
    });
    const isDefinition = isMeasureMetadataObjectDefinition(metric);

    const canCreate = permissions.canCreateMetric;
    // a metric that has not been saved yet carries no object-level permissions; creating it is
    // gated by canCreate below, not by canEdit
    const metricPermissions = isMeasureMetadataObject(metric) ? metric.permissions : undefined;
    const canEdit = canEditMetric(metricPermissions, permissions, enableMetricPermissions);
    const canShare = isDefinition
        ? enableMetricPermissions && canCreate
        : canShareMetric(metricPermissions, permissions, enableMetricPermissions);

    useApi<IEditMetricDialogFormApi | undefined>(
        ref,
        {
            close: handler(comp, (api) => api.close()),
            save: handler(comp, (api) => api.save()),
            saveForce: handler(comp, (api, data?: Partial<IMeasureDef>) => api.saveForce(data)),
            saveAs: handler(comp, (api) => api.saveAs()),
        },
        [comp],
    );

    // Ensure metricType is explicitly included in form data (in case it's not enumerable)
    const formData = useMemo(
        () => ({
            ...metric,
            metricType: metric.metricType,
        }),
        [metric],
    );

    return (
        <FormComponent
            ref={comp}
            data={formData}
            transformer={transformToMetricDefinition}
            invalidFocus={invalidFocusHandler}
            validator={metricValidationHandler}
            editable={isDefinition ? canCreate : canEdit}
            writeable={canCreate}
            locked={locked}
            mode={isDefinition ? FormMode.New : FormMode.Edit}
            initialFocus={initialFocus}
            onDirtyChanged={onDirtyChanged}
            onValueChange={onValueChange}
            onSave={onSave}
            onSaveAs={onSaveAs}
            onClose={onClose}
        >
            <form onSubmit={() => comp.current?.save()} className={classes.root}>
                <div className={classNames(classes.form, "edit-metric-form-content")}>
                    <div className={classes.headerBlock}>
                        <EditMetricContentHeader
                            metric={metric}
                            canShare={canShare}
                            draftAccess={draftAccess}
                            onDraftAccessChange={onDraftAccessChange}
                            usage={usage}
                            separators={separators}
                            regenerateId={regenerateId}
                            activeInsight={activeInsight}
                            insightOpenType={insightOpenType}
                            onInsightClick={onInsightClick}
                            metricOpenType={metricOpenType}
                            onMetricClick={onMetricClick}
                            useReferences={useReferences}
                        />
                        {showCloseButton && <CloseButton onClick={() => comp.current?.close()} />}
                        <div className={classes.line} />
                    </div>
                    <div className={classes.centerBlock}>
                        <EditMetricCenterForm
                            defaultAttributes={attributes}
                            defaultDisplay={display}
                            computedFor={computedFor}
                            sqlOpen={sqlOpen}
                            onMetricClick={onMetricClick}
                            onSettingsChange={onSettingsChange}
                        />
                    </div>
                    <div className={classes.footerBlock}>
                        <div className={classes.line} />
                        <div className={classes.space} />
                        <div className={classes.footerContent}>
                            <div>
                                <EditMetricContentNumberFormat
                                    separators={separators}
                                    currencyFormatOverride={currencyFormatOverride}
                                    enableMetricFormatOverrides={enableMetricFormatOverrides}
                                />
                            </div>
                            <div className={classes.tagsSection}>
                                <MetricTagsField />
                            </div>
                        </div>
                        <div className={classes.space} />
                        <div className={classes.smallLine} />
                        <EditMetricContentFooter
                            onCancel={onCancel}
                            onDelete={onDelete}
                            isWhiteLabeled={isWhiteLabeled}
                        />
                    </div>
                </div>
            </form>
        </FormComponent>
    );
});
