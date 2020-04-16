// (C) 2019-2020 GoodData Corporation
import { ObjRef, IBuilder } from "@gooddata/sdk-model";
import { IDashboard, IDateFilterConfig } from "./dashboard";
import { IWidgetAlertDefinition, IWidgetAlert } from "./alert";
import { IFilterContext, IFilterContextDefinition } from "./filterContext";
import { IWidgetDefinition, IWidget } from "./widget";
import { IScheduledMail, IScheduledMailDefinition } from "./scheduledMail";
import { Layout } from "./layout";

/**
 * Dashboard builder serves to create or modify analytical dashboards
 * @alpha
 */
export interface IDashboardBuilder extends IBuilder<IDashboard> {
    /**
     * Set dashboard title
     *
     * @param title - dashboard title
     * @returns this
     */
    title(title: string): this;

    /**
     * Set dashboard description
     *
     * @param description - dashboard description
     * @returns this
     */
    description(description: string): this;

    /**
     * Set dashboard layout
     *
     * @param layout - dashboard layout
     * @returns this
     */
    layout(layout: Layout): this;

    /**
     * Set date filter config
     *
     * @param dateFilterConfig - dashboard extended date filters config
     * @returns this
     */
    dateFilterConfig(dateFilterConfig: IDateFilterConfig): this;

    /**
     * FILTER CONTEXT
     */

    /**
     * Create filter context
     *
     * @param filterContext - filter context definition
     * @returns this
     */
    filterContext(filterContext: IFilterContextDefinition): this;

    /**
     * Update filter context
     *
     * @param filterContext - updated filter context
     * @returns this
     */
    updateFilterContext(filterContext: IFilterContext): this;

    /**
     * Delete filter context
     *
     * @param filterContextextRef - ref of the filter context to delete
     * @returns this
     */
    deleteFilterContext(filterContextRef: ObjRef): this;

    /**
     * WIDGETS
     */

    /**
     * Create widget
     *
     * @param widget - widget definition
     * @returns this
     */
    widget(widget: IWidgetDefinition): this;

    /**
     * Update widget
     *
     * @param widget - updated widget
     * @returns this
     */
    updateWidget(widget: IWidget): this;

    /**
     * Delete widget
     *
     * @param widgetRef - ref of the widget to delete
     * @returns this
     */
    deleteWidget(widgetRef: ObjRef): this;

    /**
     * WIDGET ALERTS
     */

    /**
     * Add alert for particular widget
     *
     * @param widgetRef - ref of the widget
     * @param alert - alert definition
     * @returns this
     */
    alert(widgetRef: ObjRef, alert: IWidgetAlertDefinition): this;

    /**
     * Update widget alert
     *
     * @param alert - updated alert
     * @returns this
     */
    updateAlert(alert: IWidgetAlert): this;

    /**
     * Delete widget alert
     *
     * @param alertRef - ref of the alert to delete
     * @returns this
     */
    deleteAlert(alertRef: ObjRef): this;

    /**
     * WIDGET ALERT FILTER CONTEXT
     */

    /**
     * Create alert filter context
     *
     * @param alertRef - ref of the alert
     * @param filterContext - filter context definiton
     * @returns this
     */
    alertFilterContext(alertRef: ObjRef, filterContext: IFilterContextDefinition): this;

    /**
     * Update alert filter context
     *
     * @param filterContext - updated filter context
     * @returns this
     */
    updateAlertFilterContext(filterContext: IFilterContext): this;

    /**
     * Delete alert filter context
     *
     * @param filterContextRef - ref of the filter context to delete
     * @returns this
     */
    deleteAlertFilterContext(filterContextRef: ObjRef): this;

    /**
     * SCHEDULED EMAILS
     */

    /**
     * Create scheduled mail
     *
     * @param scheduledMail - scheduled mail definition
     * @returns this
     */
    scheduledMail(scheduledMail: IScheduledMailDefinition): this;

    /**
     * Update scheduled mail
     *
     * @param scheduledMail - updated scheduled mail
     * @returns this
     */
    updateScheduledMail(scheduledMail: IScheduledMail): this;

    /**
     * Delete scheduled mail
     *
     * @param scheduledMailRef - ref of the scheduled mail to delete
     * @returns this
     */
    deleteScheduledMail(scheduledMailRef: ObjRef): this;
}
