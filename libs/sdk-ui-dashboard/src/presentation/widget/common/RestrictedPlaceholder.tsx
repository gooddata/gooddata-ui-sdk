// (C) 2026 GoodData Corporation

import { type CSSProperties } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type ScreenSize } from "@gooddata/sdk-model";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { Bubble, BubbleHoverTrigger, type IAlignPoint } from "@gooddata/sdk-ui-kit";

import { type CustomRestrictedPlaceholderComponent } from "../../dashboardContexts/types.js";
import { type WidgetExportData } from "../../export/types.js";
import { DashboardItem } from "../../presentationComponents/DashboardItems/DashboardItem.js";
import { DashboardItemVisualization } from "../../presentationComponents/DashboardItems/DashboardItemVisualization.js";

const tooltipAlignPoints: IAlignPoint[] = [{ align: "bc tc" }];

const errorContentStyle: CSSProperties = {
    // it centres its column, and centring splits the overflow between both ends: on a tile too small
    // for the message that takes the lock off the top. From the start, the lock and the reason are
    // what survives the clip.
    justifyContent: "flex-start",
    minWidth: 0,
};

/**
 * Props of the replaceable content of a restricted placeholder. The dashboard owns the tile and,
 * for a visualization switcher, the entry list; a consumer supplies only what goes inside.
 *
 * @alpha
 */
export interface IRestrictedPlaceholderContentProps {
    /** Width of the area the content is given, in pixels; absent before it is measured. */
    width?: number;
    /** Height of the area the content is given, in pixels; absent before it is measured. */
    height?: number;
}

/**
 * The built-in restricted placeholder content: a lock with the reason and the recovery step.
 *
 * It is the error tile the dashboard already shows for a visualization that is gone, with the lock
 * in place of the warning, so the two read as the same kind of message. It renders the same at every
 * size — the tile clips what does not fit and the hover tooltip carries the whole message — so one
 * widget cannot read differently in two render modes. The measured size is therefore not used, and
 * is passed to a consumer's replacement only.
 *
 * @alpha
 */
export function RestrictedPlaceholderContent(_props: IRestrictedPlaceholderContentProps) {
    const intl = useIntl();

    return (
        <BubbleHoverTrigger className="gd-restricted-placeholder-trigger">
            <ErrorComponent
                className="gd-restricted-placeholder"
                dataTestId="restricted-placeholder"
                icon="gd-icon-lock"
                // it does not shrink on its own - flex: 1 0 auto - so a narrow tile would push its
                // centred lock outside the visible area
                width="100%"
                style={errorContentStyle}
                message={intl.formatMessage({ id: "widget.error.restricted_insight.message" })}
                description={intl.formatMessage({ id: "widget.error.restricted_insight.description" })}
                // deliberately not given the tile size: ErrorComponent would clamp its content to 44
                // or 64px, which is right for a chart error sharing the tile with a widget headline
                // and wrong here, where the placeholder replaces the headline and owns the tile
            />
            <Bubble alignPoints={tooltipAlignPoints}>
                {intl.formatMessage({ id: "widget.error.restricted_insight.message" })}
                <br />
                {intl.formatMessage({ id: "widget.error.restricted_insight.description" })}
            </Bubble>
        </BubbleHoverTrigger>
    );
}

/**
 * Props of the component standing in for a widget the current user is not allowed to see.
 *
 * @alpha
 */
export interface IRestrictedPlaceholderProps {
    screen: ScreenSize;
    dashboardItemClasses: string;

    /**
     * Present only while the dashboard is being exported; carries the attributes the export
     * pipeline reads off the rendered item.
     */
    exportData?: WidgetExportData;
}

/**
 * Stands in for an insight widget the current user is not allowed to see. It replaces the widget title
 * too, because a stored title can name the restricted object.
 */
export function RestrictedPlaceholder({
    screen,
    dashboardItemClasses,
    exportData,
    Content,
}: IRestrictedPlaceholderProps & { Content: CustomRestrictedPlaceholderComponent }) {
    return (
        <DashboardItem
            className={cx(dashboardItemClasses, "type-visualization", "gd-dashboard-view-widget")}
            screen={screen}
            exportData={exportData?.section}
            as="div"
        >
            <DashboardItemVisualization isExport={!!exportData}>
                {({ clientHeight, clientWidth }) => (
                    // the wrapper the insight path also puts here: it is the positioned box the
                    // content's absolutely sized container resolves its 100% height against, and
                    // without it that box is the padded dash item, so the content overflows the tile
                    <div className="visualization-content">
                        <Content width={clientWidth} height={clientHeight} />
                    </div>
                )}
            </DashboardItemVisualization>
        </DashboardItem>
    );
}
