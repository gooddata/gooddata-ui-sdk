// (C) 2007-2023 GoodData Corporation
import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { IFilter, IWidgetAlertDefinition, IKpiWidgetDefinition } from "@gooddata/sdk-model";
import { GoodDataSdkError, isNoDataSdkError } from "@gooddata/sdk-ui";
import { Bubble, BubbleHoverTrigger, IAlignPoint } from "@gooddata/sdk-ui-kit";

import { DashboardItemKpi } from "../../../../presentationComponents/index.js";
import { IKpiResult, IKpiAlertResult, KpiAlertOperationStatus } from "../../common/index.js";

import { isAlertingTemporarilyDisabledForGivenFilter } from "./utils/filterUtils.js";
import { KpiDescriptionTrigger } from "./KpiDescriptionTrigger.js";

// adapted from jQuery:
// https://github.com/jquery/jquery/blob/a503c691dc06c59acdafef6e54eca2613c6e4032/src/offset.js#L83-L97
function getNodeDocumentRelativeOffsetTop(node: HTMLDivElement): number {
    // Return zeros for disconnected and hidden (display: none) elements (gh-2310)
    // Support: IE <=11+
    // Running getBoundingClientRect on a
    // disconnected node in IE throws an error
    if (!node.getClientRects().length) {
        return 0;
    }

    // Get document-relative position by adding viewport scroll to viewport-relative gBCR
    const rect = node.getBoundingClientRect();
    const win = node.ownerDocument.defaultView;
    return rect.top + (win?.pageYOffset ?? 0);
}

export interface IDashboardItemWithKpiAlertProps {
    // KPI
    kpi: IKpiWidgetDefinition;
    isLoading: boolean;
    filters?: IFilter[];
    kpiResult: IKpiResult | undefined;

    // Alert
    alert?: IWidgetAlertDefinition;
    kpiAlertResult?: IKpiAlertResult | undefined;
    alertExecutionError?: GoodDataSdkError;
    isAlertExecutionLoading?: boolean;

    canSetAlert?: boolean;
    userWorkspaceSettings?: IUserWorkspaceSettings;
    isAlertDialogOpen?: boolean;
    isAlertHighlighted?: boolean;
    isAlertLoading?: boolean;
    alertSavingStatus?: KpiAlertOperationStatus;
    alertUpdatingStatus?: KpiAlertOperationStatus;
    alertDeletingStatus?: KpiAlertOperationStatus;
    isAlertBroken?: boolean;

    isReadOnlyMode?: boolean;

    /**
     * Flag indicating the given item can be selected.
     */
    isSelectable?: boolean;
    /**
     * Flag indicating the given item is selected.
     */
    isSelected?: boolean;
    /**
     * Callback to call when an item is selected.
     */
    onSelected?: () => void;

    // Callbacks
    onAlertDialogOpenClick: () => void;

    contentClassName?: string;
    kpiClassName?: string;
    /**
     * When true, alert will not be highlighted when triggered.
     */
    suppressAlertTriggered?: boolean;
    /**
     * When true, description trigger will not be shown
     */
    suppressDescriptionTrigger?: boolean;
    children: (params: { clientWidth?: number; clientHeight?: number }) => React.ReactNode;
    renderHeadline: (clientHeight?: number) => React.ReactNode;
    renderAlertDialog: () => React.ReactNode;
}

interface IDashboardItemWithKpiAlertState {
    isKpiAlertAfterSaving: boolean;
    isKpiAlertAfterDeleting: boolean;
    isAlertHighlighted: boolean;
}

const disabledBubbleAlignPoints: IAlignPoint[] = [{ align: "cr cl" }, { align: "cl cr" }];
const enabledBubbleAlignPoints: IAlignPoint[] = [{ align: "tc bc" }, { align: "tc br" }];

export class DashboardItemWithKpiAlert extends Component<
    IDashboardItemWithKpiAlertProps,
    IDashboardItemWithKpiAlertState
> {
    static defaultProps: Pick<
        IDashboardItemWithKpiAlertProps,
        | "isAlertHighlighted"
        | "filters"
        | "alertDeletingStatus"
        | "alertSavingStatus"
        | "alertUpdatingStatus"
        | "suppressAlertTriggered"
        | "suppressDescriptionTrigger"
        | "isReadOnlyMode"
    > = {
        isAlertHighlighted: false,
        filters: [],
        alertDeletingStatus: "idle",
        alertSavingStatus: "idle",
        alertUpdatingStatus: "idle",
        suppressAlertTriggered: false,
        suppressDescriptionTrigger: false,
        isReadOnlyMode: false,
    };

    private timeouts: Record<string, NodeJS.Timeout> = {};
    private isScrolledToHighlightedAlert = false;
    private node = React.createRef<HTMLDivElement>();

    state: IDashboardItemWithKpiAlertState = {
        isKpiAlertAfterSaving: false,
        isKpiAlertAfterDeleting: false,
        isAlertHighlighted: false,
    };

    componentDidMount(): void {
        // handle cases when this component is rendered already highlighted
        if (this.props.isAlertHighlighted) {
            this.updateStatePropertyForTime("isAlertHighlighted", 5000);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps: IDashboardItemWithKpiAlertProps): void {
        if (this.isKpiAlertSaved(nextProps)) {
            this.updateStatePropertyForTime("isKpiAlertAfterSaving", 1000);
        }

        if (this.isKpiAlertDeleted(nextProps)) {
            this.updateStatePropertyForTime("isKpiAlertAfterDeleting", 1000);
        }

        if (!this.props.isAlertHighlighted && nextProps.isAlertHighlighted) {
            this.updateStatePropertyForTime("isAlertHighlighted", 5000);
        }
    }

    componentDidUpdate(): void {
        if (this.props.isAlertHighlighted && !this.isScrolledToHighlightedAlert) {
            this.isScrolledToHighlightedAlert = true;
            const node = this.node.current;

            if (node) {
                window.scrollTo(0, getNodeDocumentRelativeOffsetTop(node));
            }
        }
    }

    componentWillUnmount(): void {
        this.clearUpdatingTimeout();
    }

    // toggle property to true for given amount of time
    updateStatePropertyForTime(name: keyof IDashboardItemWithKpiAlertState, timeout: number): void {
        const { isKpiAlertAfterSaving, isKpiAlertAfterDeleting, isAlertHighlighted } = this.state;

        this.clearUpdatingTimeout(name);

        this.setState({
            isKpiAlertAfterSaving,
            isKpiAlertAfterDeleting,
            isAlertHighlighted,
            [name]: true,
        });

        this.timeouts[name] = setTimeout(() => {
            this.setState({
                isKpiAlertAfterSaving,
                isKpiAlertAfterDeleting,
                isAlertHighlighted,
                [name]: false,
            });
        }, timeout);
    }

    clearUpdatingTimeout(name?: string): void {
        if (name && this.timeouts[name]) {
            clearTimeout(this.timeouts[name]);
            delete this.timeouts[name];
        } else {
            Object.keys(this.timeouts).forEach((key) => clearTimeout(this.timeouts[key]));
            this.timeouts = {};
        }
    }

    isKpiAlertSaved(nextProps: IDashboardItemWithKpiAlertProps): boolean {
        return (
            !this.state.isKpiAlertAfterSaving &&
            this.props.alertSavingStatus === "inProgress" &&
            nextProps.alertSavingStatus === "idle"
        );
    }

    isKpiAlertDeleted(nextProps: IDashboardItemWithKpiAlertProps): boolean {
        return (
            !this.state.isKpiAlertAfterDeleting &&
            this.props.alertDeletingStatus === "inProgress" &&
            nextProps.alertDeletingStatus === "idle"
        );
    }

    renderAlertBox = (): React.ReactNode => {
        const isAlertingTemporarilyDisabled = isAlertingTemporarilyDisabledForGivenFilter(
            this.props.kpi,
            this.props.filters!,
            this.props.userWorkspaceSettings,
        );

        const alertIconClasses = cx(
            "dash-item-action",
            "dash-item-action-alert",
            "s-dash-item-action-alert",
            "gd-icon-bell",
            {
                "alert-set": this.state.isKpiAlertAfterSaving,
                "alert-deleted": this.state.isKpiAlertAfterDeleting,
            },
        );

        // TODO: Remove "isAlertingTemporarilyDisabledForGivenFilter" when alerts support absolute filters (RAIL-1456, RAIL-1457).
        //       When alert is set, we allow opening the alert box so user can edit/delete it.
        if (
            this.props.isReadOnlyMode ||
            !this.props.canSetAlert ||
            (isAlertingTemporarilyDisabled && !this.props.alert)
        ) {
            return (
                <BubbleHoverTrigger
                    showDelay={0}
                    hideDelay={0}
                    tagName="div"
                    className={cx(alertIconClasses, "disabled")}
                >
                    {/* no children here since alert icon is only a styled div with classes ^^^ */}
                    <Bubble className="bubble-primary" alignPoints={disabledBubbleAlignPoints}>
                        {this.getBubbleMessage(isAlertingTemporarilyDisabled)}
                    </Bubble>
                </BubbleHoverTrigger>
            );
        }

        return (
            <div onClick={this.onAlertDialogOpenClick}>
                <BubbleHoverTrigger className={alertIconClasses} showDelay={500} hideDelay={0} tagName="div">
                    <Bubble className="bubble-primary" alignPoints={enabledBubbleAlignPoints}>
                        <FormattedMessage id="kpi.alertBox.title" />
                    </Bubble>
                </BubbleHoverTrigger>
            </div>
        );
    };

    onAlertDialogOpenClick = (): void => {
        this.props.onAlertDialogOpenClick();
    };

    getClassNames(): { content: string; kpi: string } {
        const { kpiAlertResult } = this.props;
        const isNoData = isNoDataSdkError(this.props.alertExecutionError);
        const hasEvaluationResult = isNoData || kpiAlertResult?.measureResult !== undefined;
        const content = cx(this.props.contentClassName, {
            "is-alert-dialog": this.props.isAlertDialogOpen,
            "has-set-alert": !!this.props.alert,
            "is-alert-triggered":
                hasEvaluationResult && this.props.alert?.isTriggered && !this.props.suppressAlertTriggered,
            "is-alert-broken": hasEvaluationResult && this.props.isAlertBroken,
            "is-alert-highlighted": this.state.isAlertHighlighted,
            "is-alert-evaluating": this.props.isAlertExecutionLoading,
        });

        const kpi = cx(
            this.props.kpiClassName,
            "s-dashboard-kpi-component",
            "widget-loaded",
            "visualization",
            {
                "kpi-with-pop": this.props.kpi.kpi.comparisonType !== "none",
                "content-loading": this.props.isLoading,
                "content-loaded": !this.props.isLoading,
            },
        );
        return {
            content,
            kpi,
        };
    }

    getBubbleMessage(isAlertingTemporarilyDisabled: boolean): React.ReactElement {
        const { isReadOnlyMode } = this.props;

        if (isReadOnlyMode) {
            return <FormattedMessage id="kpi.alertBox.disabledInReadOnly" />;
        }

        if (isAlertingTemporarilyDisabled) {
            return <FormattedMessage id="visualization.alert_not_supported" />;
        }
        return <FormattedMessage id="kpi.alertBox.unverifiedEmail" />;
    }

    render(): JSX.Element {
        const classnames = this.getClassNames();

        return (
            <DashboardItemKpi
                contentClassName={classnames.content}
                visualizationClassName={classnames.kpi}
                contentRef={this.node}
                renderAfterContent={() => this.props.isAlertDialogOpen && this.props.renderAlertDialog()}
                renderBeforeVisualization={() =>
                    !this.props.suppressDescriptionTrigger &&
                    this.props.userWorkspaceSettings?.enableDescriptions ? (
                        <KpiDescriptionTrigger kpi={this.props.kpi} />
                    ) : null
                }
                renderHeadline={(clientHeight) => (
                    <>
                        {/* TODO: the alert box should be rendered using renderBeforeKpi prop, but Graphene selectors */}
                        {/* aren't ready for that, so we abuse the renderHeadline prop a little for now... */}
                        {this.renderAlertBox()}
                        {this.props.renderHeadline(clientHeight)}
                    </>
                )}
                isSelectable={this.props.isSelectable}
                isSelected={this.props.isSelected}
                onSelected={this.props.onSelected}
            >
                {this.props.children}
            </DashboardItemKpi>
        );
    }
}
