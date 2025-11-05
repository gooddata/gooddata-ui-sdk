// (C) 2020-2025 GoodData Corporation

import { ReactElement, ReactNode, useCallback, useEffect, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { ICatalogDateDataset, ObjRef, objRefToString } from "@gooddata/sdk-model";
import {
    Bubble,
    BubbleHoverTrigger,
    ConfirmDialog,
    DialogListHeader,
    Dropdown,
    IAlignPoint,
    RecurrenceForm,
    SingleSelectListItem,
    UiButton,
    UiListbox,
    simpleRecurrenceTypeMappingFn,
} from "@gooddata/sdk-ui-kit";

import { IDashboardSettingsDialogProps } from "./types.js";
import { useDialogData } from "./useDialogData.js";
import {
    InsightDateDatasets,
    QueryInsightDateDatasets,
    queryDateDatasetsForInsight,
    selectCrossFilteringEnabledAndSupported,
    selectDateFormat,
    selectEnableAlertsEvaluationFrequencySetup,
    selectEnableDashboardSectionHeadersDateDataSet,
    selectEnableFilterViews,
    selectIsWhiteLabeled,
    selectLocale,
    selectSettings,
    selectWeekStart,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../model/index.js";

/**
 * @alpha
 */
export function DefaultDashboardSettingsDialog({
    isVisible,
    onApply,
    onCancel /*, onError*/,
}: IDashboardSettingsDialogProps): ReactElement | null {
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
    const enableDashboardSectionHeadersDateDataSet = useDashboardSelector(
        selectEnableDashboardSectionHeadersDateDataSet,
    );

    const {
        run: queryDateDatasets,
        result,
        status,
    } = useDashboardQueryProcessing<
        QueryInsightDateDatasets,
        InsightDateDatasets,
        Parameters<typeof queryDateDatasetsForInsight>
    >({
        queryCreator: queryDateDatasetsForInsight,
    });

    useEffect(() => {
        if (isVisible && enableDashboardSectionHeadersDateDataSet) {
            queryDateDatasets();
        }
    }, [queryDateDatasets, isVisible, enableDashboardSectionHeadersDateDataSet]);

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
            isPositive
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
                                    p: (chunks: ReactNode) => <p>{chunks}</p>,
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
                    {enableDashboardSectionHeadersDateDataSet ? (
                        <DateDatasetDropdown
                            label={intl.formatMessage({
                                id: "settingsDashboardDialog.sectionHeaders.dateDataset",
                            })}
                            tooltip={intl.formatMessage({
                                id: "settingsDashboardDialog.sectionHeaders.dateDataset.tooltip",
                            })}
                            dateDatasets={result?.dateDatasetsOrdered ?? []}
                            selectedDataSet={currentData.sectionHeadersDateDataSet}
                            isLoading={status === "pending" || status === "running"}
                            onChange={(dateDataSet: ObjRef | undefined) => {
                                setCurrentData({
                                    ...currentData,
                                    sectionHeadersDateDataSet: dateDataSet,
                                });
                            }}
                        />
                    ) : null}
                </div>
                {enableAlertsEvaluationFrequencySetup ? (
                    <div className="gd-dashboard-settings-dialog-section">
                        <DialogListHeader
                            title={intl.formatMessage({ id: "settingsDashboardDialog.section.alert" })}
                            className="gd-dashboard-settings-filters"
                        />
                        <RecurrenceForm
                            allowHourlyRecurrence
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
                            showRepeatTypeDescription
                            showTimezoneInOccurrence
                            dateFormat={dateFormat}
                            weekStart={weekStart}
                            locale={locale}
                            showInheritValue
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
                                        strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                                    }}
                                />
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </ConfirmDialog>
    );
}

const BUBBLE_ALIGN_POINTS: IAlignPoint[] = [{ align: "bc tl" }];

interface IConfigurationOptionProps {
    label: ReactNode;
    tooltip: ReactNode;
    isChecked: boolean;
    onChange: (newValue: boolean) => void;
}

function ConfigurationOption({ label, tooltip, isChecked, onChange }: IConfigurationOptionProps) {
    return (
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
                        eventsOnBubble
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
}

interface IDateDatasetDropdownProps {
    label: ReactNode;
    tooltip: ReactNode;
    dateDatasets: readonly ICatalogDateDataset[];
    selectedDataSet: ObjRef | undefined;
    isLoading: boolean;
    onChange: (dateDataSet: ObjRef | undefined) => void;
}

function DateDatasetDropdown({
    label,
    tooltip,
    dateDatasets,
    selectedDataSet,
    isLoading,
    onChange,
}: IDateDatasetDropdownProps) {
    const intl = useIntl();

    const selectedDatasetTitle = isLoading
        ? intl.formatMessage({ id: "loading" })
        : selectedDataSet
          ? (dateDatasets.find((ds) => objRefToString(ds.dataSet.ref) === objRefToString(selectedDataSet))
                ?.dataSet.title ?? intl.formatMessage({ id: "dateDataset.notFound" }))
          : intl.formatMessage({ id: "dateDataset.autoSelect" });

    return (
        <div className="configuration-category-item">
            <span className="input-label-text">
                {label}
                <BubbleHoverTrigger
                    showDelay={0}
                    hideDelay={0}
                    eventsOnBubble
                    className="configuration-category-item-tooltip-icon"
                >
                    <span className="gd-icon-circle-question gd-filter-configuration__help-icon" />
                    <Bubble alignPoints={BUBBLE_ALIGN_POINTS}>
                        <div className="gd-filter-configuration__help-tooltip">{tooltip}</div>
                    </Bubble>
                </BubbleHoverTrigger>
            </span>
            <Dropdown
                closeOnParentScroll
                autofocusOnOpen
                alignPoints={[{ align: "bl tl" }, { align: "tl bl" }]}
                className="gd-dashboard-settings-date-dataset-dropdown"
                renderButton={({ isOpen, toggleDropdown }) => (
                    <UiButton
                        label={selectedDatasetTitle}
                        onClick={toggleDropdown}
                        isDisabled={isLoading}
                        iconAfter={isOpen ? "navigateUp" : "navigateDown"}
                        size="small"
                    />
                )}
                renderBody={({ closeDropdown, ariaAttributes }) => {
                    const autoSelectItem = {
                        type: "interactive" as const,
                        id: "__auto__",
                        stringTitle: intl.formatMessage({ id: "dateDataset.autoSelect" }),
                        data: undefined,
                    };

                    const datasetItems = dateDatasets.map((ds) => ({
                        type: "interactive" as const,
                        id: objRefToString(ds.dataSet.ref),
                        stringTitle: ds.dataSet.title,
                        data: ds.dataSet.ref,
                    }));

                    const items = [autoSelectItem, ...datasetItems];

                    const selectedItemId = selectedDataSet ? objRefToString(selectedDataSet) : "__auto__";

                    return (
                        <UiListbox
                            maxWidth={300}
                            items={items}
                            selectedItemId={selectedItemId}
                            onSelect={(item) => {
                                onChange(item.data as ObjRef | undefined);
                                closeDropdown();
                            }}
                            onClose={closeDropdown}
                            ariaAttributes={ariaAttributes}
                            InteractiveItemComponent={({ item, isSelected, isFocused, onSelect }) => (
                                <SingleSelectListItem
                                    className="gd-dashboard-settings-dialog-date-dataset-dropdown-list-item"
                                    title={item.stringTitle}
                                    isSelected={isSelected}
                                    isFocused={isFocused}
                                    onClick={onSelect}
                                />
                            )}
                        />
                    );
                }}
                overlayPositionType="sameAsTarget"
            />
        </div>
    );
}
