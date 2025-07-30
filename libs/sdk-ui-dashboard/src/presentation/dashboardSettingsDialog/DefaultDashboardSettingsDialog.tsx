// (C) 2020-2025 GoodData Corporation
import React, { useCallback, useState, ReactElement } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import {
    Bubble,
    BubbleHoverTrigger,
    ConfirmDialog,
    DialogListHeader,
    IAlignPoint,
    RecurrenceForm,
    simpleRecurrenceTypeMappingFn,
} from "@gooddata/sdk-ui-kit";

import {
    selectCrossFilteringEnabledAndSupported,
    selectEnableAlertsEvaluationFrequencySetup,
    selectDateFormat,
    selectEnableFilterViews,
    selectLocale,
    selectSettings,
    selectWeekStart,
    useDashboardSelector,
    selectIsWhiteLabeled,
} from "../../model/index.js";

import { IDashboardSettingsDialogProps } from "./types.js";
import { useDialogData } from "./useDialogData.js";

/**
 * @alpha
 */
export const DefaultDashboardSettingsDialog = (props: IDashboardSettingsDialogProps): ReactElement | null => {
    const { isVisible, onApply, onCancel /*, onError*/ } = props;

    const intl = useIntl();

    const [cronValid, setCronValid] = useState(true);
    const { currentData, setCurrentData, isDirty } = useDialogData();
    const dateFormat = useDashboardSelector(selectDateFormat);
    const weekStart = useDashboardSelector(selectWeekStart);
    const locale = useDashboardSelector(selectLocale);

    const isCrossFilteringEnabledAndSupported = useDashboardSelector(selectCrossFilteringEnabledAndSupported);
    const enableAlertsEvaluationFrequencySetup = useDashboardSelector(
        selectEnableAlertsEvaluationFrequencySetup,
    );
    const isFilterViewsFeatureEnabled = useDashboardSelector(selectEnableFilterViews);
    const settings = useDashboardSelector(selectSettings);
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);

    const onApplyHandler = useCallback(() => {
        onApply(currentData);
    }, [onApply, currentData]);

    if (!isVisible) {
        return null;
    }

    return (
        <ConfirmDialog
            onCancel={onCancel}
            onSubmit={onApplyHandler}
            isPositive={true}
            className="s-dialog s-settings_dashboard_dialog gd-dashboard-settings-dialog"
            headline={intl.formatMessage({ id: "settingsDashboardDialog.headline" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "apply" })}
            isSubmitDisabled={!isDirty() || !cronValid}
        >
            <div className="gd-dashboard-content-wrapper">
                <div className="gd-dashboard-settings-dialog-section">
                    <DialogListHeader
                        title={intl.formatMessage({ id: "filters.configurationPanel.header" })}
                        className="gd-dashboard-settings-filters"
                    />
                    {isCrossFilteringEnabledAndSupported ? (
                        <>
                            <ConfigurationOption
                                label={intl.formatMessage({
                                    id: "filters.configurationPanel.crossFiltering.toggle",
                                })}
                                tooltip={intl.formatMessage({
                                    id: "filters.configurationPanel.crossFiltering.toggle.tooltip",
                                })}
                                isChecked={!currentData.disableCrossFiltering}
                                onChange={(newValue: boolean) => {
                                    setCurrentData({
                                        ...currentData,
                                        disableCrossFiltering: newValue,
                                    });
                                }}
                            />
                            <ConfigurationOption
                                label={intl.formatMessage({
                                    id: "filters.configurationPanel.userFilterReset.toggle",
                                })}
                                tooltip={intl.formatMessage({
                                    id: "filters.configurationPanel.userFilterReset.toggle.tooltip",
                                })}
                                isChecked={!currentData.disableUserFilterReset}
                                onChange={(newValue: boolean) => {
                                    setCurrentData({
                                        ...currentData,
                                        disableUserFilterReset: newValue,
                                    });
                                }}
                            />
                        </>
                    ) : null}
                    {isFilterViewsFeatureEnabled ? (
                        <ConfigurationOption
                            label={intl.formatMessage({
                                id: "filters.configurationPanel.filterViews.toggle",
                            })}
                            tooltip={intl.formatMessage(
                                { id: "filters.configurationPanel.filterViews.toggle.tooltip" },
                                {
                                    p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                                },
                            )}
                            isChecked={!currentData.disableFilterViews}
                            onChange={(newValue: boolean) => {
                                setCurrentData({
                                    ...currentData,
                                    disableFilterViews: newValue,
                                });
                            }}
                        />
                    ) : null}
                    <ConfigurationOption
                        label={intl.formatMessage({ id: "filters.configurationPanel.userFilterSave.toggle" })}
                        tooltip={intl.formatMessage({
                            id: "filters.configurationPanel.userFilterSave.toggle.tooltip",
                        })}
                        isChecked={!currentData.disableUserFilterSave}
                        onChange={(newValue: boolean) => {
                            setCurrentData({
                                ...currentData,
                                disableUserFilterSave: newValue,
                            });
                        }}
                    />
                </div>
                {enableAlertsEvaluationFrequencySetup ? (
                    <div className="gd-dashboard-settings-dialog-section">
                        <DialogListHeader
                            title={intl.formatMessage({ id: "settingsDashboardDialog.section.alert" })}
                            className="gd-dashboard-settings-filters"
                        />
                        <RecurrenceForm
                            allowHourlyRecurrence={true}
                            cronExpression={currentData.evaluationFrequency ?? ""}
                            placeholder={settings.alertDefault?.defaultCron}
                            timezone={settings.alertDefault?.defaultTimezone}
                            onChange={(e, _, valid) => {
                                setCronValid(valid);
                                setCurrentData({
                                    ...currentData,
                                    evaluationFrequency: e || undefined,
                                });
                            }}
                            repeatLabel={intl.formatMessage({
                                id: "settingsDashboardDialog.section.alert.label",
                            })}
                            showRepeatTypeDescription={true}
                            showTimezoneInOccurrence={true}
                            dateFormat={dateFormat}
                            weekStart={weekStart}
                            locale={locale}
                            showInheritValue={true}
                            isWhiteLabeled={isWhiteLabeled}
                            customRecurrenceTypeMappingFn={simpleRecurrenceTypeMappingFn}
                        />
                        <div className="gd-dashboard-settings-evaluation-note">
                            {currentData.evaluationFrequency === undefined ? (
                                <FormattedMessage id="settingsDashboardDialog.section.alert.inherit" />
                            ) : (
                                <FormattedMessage
                                    id="settingsDashboardDialog.section.alert.note"
                                    values={{
                                        strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
                                    }}
                                />
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </ConfirmDialog>
    );
};

const BUBBLE_ALIGN_POINTS: IAlignPoint[] = [{ align: "bc tl" }];

interface IConfigurationOptionProps {
    label: React.ReactNode;
    tooltip: React.ReactNode;
    isChecked: boolean;
    onChange: (newValue: boolean) => void;
}

const ConfigurationOption: React.FC<IConfigurationOptionProps> = ({
    label,
    tooltip,
    isChecked,
    onChange,
}) => (
    <div className="configuration-category-item">
        <label className="input-checkbox-toggle">
            <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => {
                    onChange(!e.currentTarget.checked);
                }}
            />
            <span className="input-label-text">
                {label}
                <BubbleHoverTrigger
                    showDelay={0}
                    hideDelay={0}
                    eventsOnBubble={true}
                    className="configuration-category-item-tooltip-icon"
                >
                    <span className="gd-icon-circle-question gd-filter-configuration__help-icon" />
                    <Bubble alignPoints={BUBBLE_ALIGN_POINTS}>
                        <div className="gd-filter-configuration__help-tooltip">{tooltip}</div>
                    </Bubble>
                </BubbleHoverTrigger>
            </span>
        </label>
    </div>
);
