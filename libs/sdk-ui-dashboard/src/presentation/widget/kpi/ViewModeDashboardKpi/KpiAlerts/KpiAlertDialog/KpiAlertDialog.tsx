// (C) 2007-2022 GoodData Corporation
import React, { Component, ReactNode, ReactText } from "react";
import isEqual from "lodash/isEqual.js";
import last from "lodash/last.js";
import { FormattedMessage, injectIntl, WrappedComponentProps } from "react-intl";
import { Button, Input, Typography, Overlay, useMediaQuery, Spinner, Message } from "@gooddata/sdk-ui-kit";
import {
    IDateFilter,
    IFilter,
    isAttributeFilter,
    isDateFilter,
    IDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    IWidgetAlertDefinition,
} from "@gooddata/sdk-model";

import { KpiAlertOperationStatus } from "../../../common/index.js";

import { KpiAlertDialogDateRange } from "./KpiAlertDialogDateRange.js";
import { kpiAlertDialogAlignPoints, kpiAlertDialogMobileAlignPoints } from "./alignPoints.js";
import { IBrokenAlertFilter } from "../types.js";
import { KpiAlertDialogBrokenFilters } from "./KpiAlertDialogBrokenFilters/KpiAlertDialogBrokenFilters.js";
import {
    thresholdFromDecimalToPercent,
    thresholdFromPercentToDecimal,
} from "../utils/alertThresholdUtils.js";
import { areKpiAlertFiltersSameAsDashboard } from "./utils/filterUtils.js";
import { KpiAlertDialogWhenTriggeredPicker } from "./KpiAlertDialogWhenTriggeredPicker.js";

export interface IKpiAlertDialogProps {
    alert?: IWidgetAlertDefinition;
    alertSavingStatus?: KpiAlertOperationStatus;
    alertUpdatingStatus?: KpiAlertOperationStatus;
    alertDeletingStatus?: KpiAlertOperationStatus;
    thresholdPlaceholder?: string;
    isThresholdRepresentingPercent?: boolean;
    isAlertDialogOpening?: boolean;
    isAlertLoading?: boolean;
    isKpiFormatLoading?: boolean;
    brokenAlertFilters?: IBrokenAlertFilter[];

    userEmail: string;
    isDateFilterIgnored?: boolean;
    filters?: IFilter[];
    dateFormat: string;

    /**
     * Triggered when either the "Close" button or the "Cancel" button is clicked.
     */
    onAlertDialogCloseClick: () => void;

    /**
     * Triggered when a new alert creation or an update of the settings of an existing alert is triggered.
     * The function is called with the current values of the alert dialog inputs.
     */
    onAlertDialogSaveClick: (
        threshold: number,
        whenTriggered: IWidgetAlertDefinition["whenTriggered"],
    ) => void;

    /**
     * Triggered when the "Delete" button is clicked.
     */
    onAlertDialogDeleteClick: () => void;

    /**
     * Triggered when the "Update filters" button in broken alert state is clicked.
     * This should make sure the alert is updated with the filters currently used by its KPI (and therefore fix the alert).
     */
    onAlertDialogUpdateClick: () => void;

    /**
     * Triggered when user clicks the "Apply alert filters to dashboard" button in case the dashboard has different filters than the alert.
     * If not specified, the corresponding button will not be rendered.
     */
    onApplyAlertFiltersClick?: () => void;
}

interface IKpiAlertDialogState {
    threshold: string;
    alertType: IWidgetAlertDefinition["whenTriggered"];
}

const DEFAULT_WHEN_TRIGGERED = "aboveThreshold";

const KpiAlertDialogWrapper: React.FC<{ children: (isMobile: boolean) => JSX.Element }> = ({ children }) => {
    const isMobile = useMediaQuery("mobileDevice");
    return children(isMobile);
};

export class KpiAlertDialog extends Component<
    IKpiAlertDialogProps & WrappedComponentProps,
    IKpiAlertDialogState
> {
    static defaultProps: Pick<
        IKpiAlertDialogProps,
        | "isAlertLoading"
        | "isKpiFormatLoading"
        | "thresholdPlaceholder"
        | "isDateFilterIgnored"
        | "isThresholdRepresentingPercent"
        | "filters"
        | "isAlertDialogOpening"
        | "alertDeletingStatus"
        | "alertSavingStatus"
        | "alertUpdatingStatus"
    > = {
        isAlertLoading: false,
        isKpiFormatLoading: false,
        thresholdPlaceholder: "",
        isDateFilterIgnored: false,
        isThresholdRepresentingPercent: false,
        filters: [],
        isAlertDialogOpening: false,
        alertDeletingStatus: "idle",
        alertSavingStatus: "idle",
        alertUpdatingStatus: "idle",
    };

    private threshold = React.createRef<Input>();
    private saveButton = React.createRef<Button>();

    constructor(props: IKpiAlertDialogProps & WrappedComponentProps) {
        super(props);

        this.state = {
            alertType: props.alert?.whenTriggered ?? DEFAULT_WHEN_TRIGGERED,
            threshold: `${this.getVisualThreshold()}`,
        };
    }

    componentDidMount(): void {
        this.focusThresholdInput();
    }

    componentDidUpdate(prevProps: IKpiAlertDialogProps & WrappedComponentProps): void {
        if (prevProps.isAlertLoading) {
            this.focusThresholdInput();
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps: IKpiAlertDialogProps & WrappedComponentProps): void {
        if (this.props.isAlertLoading || !isEqual(this.props.alert, nextProps.alert)) {
            this.setState({
                alertType: nextProps.alert?.whenTriggered ?? DEFAULT_WHEN_TRIGGERED,
                threshold: `${this.getVisualThreshold(nextProps)}`,
            });
        }
        if (this.props.isKpiFormatLoading) {
            this.setState({
                threshold: `${this.getVisualThreshold(nextProps)}`,
            });
        }
    }

    render() {
        return (
            <KpiAlertDialogWrapper>
                {(isMobile) => {
                    return (
                        <Overlay
                            alignTo={".is-alert-dialog.dash-item-content"}
                            alignPoints={
                                isMobile ? kpiAlertDialogMobileAlignPoints : kpiAlertDialogAlignPoints
                            }
                            closeOnOutsideClick={!isMobile}
                            onClose={this.closeDialog}
                            className="kpi-alert-dialog-overlay"
                        >
                            {this.renderDialogBox()}
                        </Overlay>
                    );
                }}
            </KpiAlertDialogWrapper>
        );
    }

    renderAttributeFiltersInfo(): React.ReactNode {
        const { alert, filters } = this.props;

        const attributeFilterCount = alert
            ? // for existing alerts, count the stored attribute filters
              alert.filterContext?.filters.filter(isDashboardAttributeFilter).length
            : // otherwise (i.e. when creating a new alert) count attribute filters "from outside"
              filters!.filter(isAttributeFilter).length;

        if (!attributeFilterCount) {
            return false;
        }

        return (
            <div className="kpi-alert-dialog-text text-info">
                <FormattedMessage
                    id="kpiAlertDialog.withAttributeFilters"
                    values={{ numFilters: attributeFilterCount }}
                />
            </div>
        );
    }

    getVisualThreshold(props = this.props): number | string {
        const threshold =
            props.alert?.threshold != undefined && this.isThresholdRepresentingPercent(props)
                ? thresholdFromDecimalToPercent(props.alert?.threshold)
                : props.alert?.threshold;
        return threshold ?? "";
    }

    renderDialogBox(): React.ReactNode {
        return (
            <div className="kpi-alert-dialog">
                <div className="action-close gd-icon-cross" onClick={this.onCloseClick} />
                {this.renderDialogContent()}
            </div>
        );
    }

    renderDeleteLink(): React.ReactNode {
        const { alert, alertDeletingStatus, intl } = this.props;
        if (alert) {
            const isDeleting = alertDeletingStatus === "inProgress";
            const deleteButtonTitle = isDeleting
                ? intl.formatMessage({ id: "kpiAlertDialog.deleting" })
                : intl.formatMessage({ id: "kpiAlertDialog.delete" });

            return (
                <Button
                    key="delete-button"
                    className="s-delete_button gd-button-link-dimmed delete-link"
                    value={deleteButtonTitle}
                    onClick={this.deleteKpiAlert}
                    disabled={isDeleting}
                />
            );
        }

        return false;
    }

    renderUpdateButton(): React.ReactNode {
        const { alert, alertUpdatingStatus, intl, onAlertDialogUpdateClick } = this.props;

        if (alert) {
            const isUpdating = alertUpdatingStatus === "inProgress";
            const updateButtonTitle = isUpdating
                ? intl.formatMessage({ id: "kpiAlertDialog.updatingTitle" })
                : intl.formatMessage({ id: "kpiAlertDialog.updateBrokenTitle" });

            return (
                <Button
                    key="update-button"
                    className="s-update-button gd-button-action save-button"
                    value={updateButtonTitle}
                    onClick={onAlertDialogUpdateClick}
                    disabled={isUpdating}
                />
            );
        }

        return false;
    }

    renderBrokenAlert(): React.ReactNode {
        return (
            <div className="alert-broken">
                <Typography tagName="h3">
                    <FormattedMessage id="kpiAlertDialog.brokenAlert" />
                </Typography>
                <KpiAlertDialogBrokenFilters brokenFilters={this.props.brokenAlertFilters} />
                <div className="info">
                    <FormattedMessage id="kpiAlertDialog.brokenAlertAppeal" />
                </div>
                {this.renderUpdatingErrorMessage()}
                {this.renderDeletingErrorMessage()}
                <div className="buttons">
                    {this.renderUpdateButton()}
                    {this.renderDeleteLink()}
                </div>
            </div>
        );
    }

    renderDialogContent(): React.ReactNode {
        const {
            isAlertDialogOpening,
            isAlertLoading,
            thresholdPlaceholder,
            isKpiFormatLoading,
            intl,
            brokenAlertFilters,
            userEmail,
        } = this.props;

        const { threshold, alertType } = this.state;

        if (isAlertDialogOpening || isAlertLoading || isKpiFormatLoading) {
            return (
                <div className="kpi-alert-dialog-content">
                    <Spinner className="gd-dot-spinner-centered" />
                </div>
            );
        }

        if (brokenAlertFilters?.length) {
            return <div className="kpi-alert-dialog-content">{this.renderBrokenAlert()}</div>;
        }

        const inputSuffix = this.isThresholdRepresentingPercent() ? "%" : "";

        const hasError = !this.isAlertValid() && !this.isAlertEmpty();

        const emailMe = (
            <span className="underline-dotted" title={userEmail}>
                <FormattedMessage id="kpiAlertDialog.emailMe" />
            </span>
        );

        return (
            <div className="kpi-alert-dialog-content">
                <div className="kpi-alert-dialog-text kpi-alert-dialog-text-on-top">
                    <FormattedMessage id="kpiAlertDialog.emailMeWhen" values={{ emailMe }} />
                </div>

                <KpiAlertDialogWhenTriggeredPicker
                    whenTriggered={alertType}
                    intl={intl}
                    onWhenTriggeredChange={this.onSelect}
                />

                <div className="input-container">
                    <Input
                        className="s-threshold-input"
                        hasError={hasError}
                        isSmall
                        maxlength={16}
                        onChange={this.onChange}
                        onEscKeyPress={this.closeDialog}
                        onEnterKeyPress={this.saveKpiAlert}
                        placeholder={thresholdPlaceholder}
                        ref={this.threshold}
                        suffix={inputSuffix}
                        value={threshold}
                    />
                </div>

                {this.renderFiltersMessage()}
                {this.renderFiltersDifferMessage()}
                {this.renderValidationMessage()}
                {this.renderSavingErrorMessage()}
                {this.renderDeletingErrorMessage()}

                <div className="buttons">
                    <Button
                        ref={this.saveButton}
                        className="gd-button-action save-button s-save_button"
                        value={this.getSaveButtonTitle()}
                        onClick={this.saveKpiAlert}
                        disabled={!this.isSavingEnabled()}
                    />
                    <Button
                        className="gd-button-secondary cancel-button s-cancel_button"
                        value={intl.formatMessage({ id: "cancel" })}
                        onClick={this.onCancelClick}
                    />
                    {this.renderDeleteLink()}
                </div>
            </div>
        );
    }

    renderDateFilterInfo(): React.ReactNode {
        if (this.props.isDateFilterIgnored) {
            return false;
        }

        const { dateFormat, filters, alert } = this.props;

        const dateFilters = alert
            ? alert.filterContext?.filters.filter(isDashboardDateFilter) ?? []
            : filters!.filter(isDateFilter);

        const dateFilter = last<IDashboardDateFilter | IDateFilter>(dateFilters);

        return <KpiAlertDialogDateRange filter={dateFilter} dateFormat={dateFormat} />;
    }

    renderFiltersMessage(): React.ReactNode {
        const { intl, userEmail } = this.props;
        const emailInfo = intl.formatMessage({ id: "kpiAlertDialog.emailInfo" }, { userEmail });

        return (
            <div>
                <div>
                    <div className="kpi-alert-dialog-text text-info">
                        {this.renderDateFilterInfo()}
                        {this.renderAttributeFiltersInfo()}
                    </div>
                    <div className="kpi-alert-dialog-text email-info">{emailInfo}</div>
                </div>
            </div>
        );
    }

    renderFiltersDifferMessage(): React.ReactNode {
        const filtersDiffer = !areKpiAlertFiltersSameAsDashboard(this.props.alert, this.props.filters!);
        const shouldShowFiltersDifferMessage = !!this.props.alert && filtersDiffer;
        return shouldShowFiltersDifferMessage ? (
            <Message type="warning">
                <FormattedMessage id="kpiAlertDialog.filtersDiffer" />
                {!!this.props.onApplyAlertFiltersClick && (
                    <>
                        {" "}
                        <a className="s-apply-alert-filters" onClick={this.applyAlertFilterSetting}>
                            <FormattedMessage id="kpiAlertDialog.filtersApply" />
                        </a>
                    </>
                )}
            </Message>
        ) : (
            false
        );
    }

    renderValidationMessage(): React.ReactNode {
        if (!this.isAlertValid() && !this.isAlertEmpty()) {
            return (
                <Message type="error">
                    <FormattedMessage
                        id="kpiAlertDialog.invalidNumber"
                        values={{
                            strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                            br: <br />,
                        }}
                    />
                </Message>
            );
        }

        return false;
    }

    renderSavingErrorMessage(): React.ReactNode {
        if (this.props.alertSavingStatus === "error") {
            return (
                <Message type="error">
                    <FormattedMessage id="kpiAlertDialog.savingFailed" />
                </Message>
            );
        }

        return false;
    }

    renderUpdatingErrorMessage(): React.ReactNode {
        if (this.props.alertUpdatingStatus === "error") {
            return (
                <Message type="error">
                    <FormattedMessage id="kpiAlertDialog.updateBrokenFailed" />
                </Message>
            );
        }

        return false;
    }

    renderDeletingErrorMessage(): React.ReactNode {
        if (this.props.alertDeletingStatus === "error") {
            return (
                <Message type="error">
                    <FormattedMessage id="kpiAlertDialog.deleteingFailed" />
                </Message>
            );
        }

        return false;
    }

    getSaveButtonTitle(): string {
        return this.props.alertSavingStatus === "inProgress"
            ? this.getUpdatingOrSavingTitle()
            : this.getUpdateOrSetTitle();
    }

    getUpdateOrSetTitle(): string {
        const { alert, intl } = this.props;

        return alert
            ? intl.formatMessage({ id: "kpiAlertDialog.updateTitle" })
            : intl.formatMessage({ id: "kpiAlertDialog.setTitle" });
    }

    getUpdatingOrSavingTitle(): string {
        const { alert, intl } = this.props;

        return alert
            ? intl.formatMessage({ id: "kpiAlertDialog.updatingTitle" })
            : intl.formatMessage({ id: "kpiAlertDialog.settingTitle" });
    }

    isThresholdRepresentingPercent(props = this.props): boolean {
        return !!props.isThresholdRepresentingPercent;
    }

    isSavingEnabled(): boolean {
        return this.isAlertValid() && !this.isAlertEmpty() && this.props.alertSavingStatus !== "inProgress";
    }

    isAlertValid(): boolean {
        // This is some special function, which works also with strings
        return !isNaN(this.state.threshold as any); // eslint-disable-line no-restricted-globals
    }

    isAlertEmpty(): boolean {
        return this.state.threshold === undefined || this.state.threshold === "";
    }

    onCloseClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        e.stopPropagation();
        this.closeDialog();
    };

    onCancelClick = (e: React.MouseEvent): void => {
        e.stopPropagation();
        this.closeDialog();
    };

    closeDialog = (): void => {
        this.props.onAlertDialogCloseClick();
    };

    onSelect = (alertType: IWidgetAlertDefinition["whenTriggered"]): void => {
        this.setState({ alertType });
    };

    onChange = (value: string | ReactText): void => {
        this.setState({ threshold: value.toString() });
    };

    saveKpiAlert = (): void => {
        const whenTriggered = this.state.alertType;

        let threshold = parseFloat(this.state.threshold); // convert e.g. valid .2 to 0.2
        threshold = this.isThresholdRepresentingPercent()
            ? thresholdFromPercentToDecimal(threshold)
            : threshold;

        if (this.isAlertValid() && !this.isAlertEmpty()) {
            this.props.onAlertDialogSaveClick(threshold, whenTriggered);
        }
    };

    deleteKpiAlert = (): void => {
        this.props.onAlertDialogDeleteClick();
    };

    focusThresholdInput(): void {
        setTimeout(() => {
            if (this.threshold?.current?.inputNodeRef?.inputNodeRef) {
                const thresholdInputElement = this.threshold.current.inputNodeRef.inputNodeRef;

                thresholdInputElement.focus();
                thresholdInputElement.select();
            }
        }, 100);
    }

    applyAlertFilterSetting = (): void => {
        setTimeout(() => {
            this.props.onApplyAlertFiltersClick?.();
        }, 0);
    };
}

export default injectIntl(KpiAlertDialog);
