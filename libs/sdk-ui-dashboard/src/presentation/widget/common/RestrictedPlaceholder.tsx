// (C) 2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { type ScreenSize } from "@gooddata/sdk-model";
import { Typography } from "@gooddata/sdk-ui-kit";

import { type CustomRestrictedPlaceholderComponent } from "../../dashboardContexts/types.js";
import { type WidgetExportData } from "../../export/types.js";
import { DashboardItem } from "../../presentationComponents/DashboardItems/DashboardItem.js";
import { DashboardItemVisualization } from "../../presentationComponents/DashboardItems/DashboardItemVisualization.js";
import { CompactContentError } from "../insight/ViewModeDashboardInsight/CustomError/CompactContentError.js";
import { ErrorContainer } from "../insight/ViewModeDashboardInsight/CustomError/ErrorContainer.js";
import { shouldRenderFullContent } from "../insight/ViewModeDashboardInsight/CustomError/sizingUtils.js";

/** Smallest tile that still fits the headline on its own. */
const MEDIUM_MIN_WIDTH = 160;
const MEDIUM_MIN_HEIGHT = 100;

export type RestrictedPlaceholderVariant = "full" | "medium" | "compact";

/**
 * Which of the three renderings a tile of the given size can carry. A chart error may collapse
 * straight from "everything" to "icon only" because the user can open the widget to find out more;
 * a restricted widget cannot be opened, so it keeps the headline for as long as text fits at all.
 */
export function restrictedPlaceholderVariant(
    width: number | undefined,
    height: number | undefined,
): RestrictedPlaceholderVariant {
    if (shouldRenderFullContent(height, width)) {
        return "full";
    }
    if ((width ?? 0) >= MEDIUM_MIN_WIDTH && (height ?? 0) >= MEDIUM_MIN_HEIGHT) {
        return "medium";
    }
    return "compact";
}

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
 * The built-in restricted placeholder content: a lock with the reason and the recovery step, scaled
 * to the room available.
 *
 * @alpha
 */
export function RestrictedPlaceholderContent({ width, height }: IRestrictedPlaceholderContentProps) {
    return <RestrictedPlaceholderMessage variant={restrictedPlaceholderVariant(width, height)} />;
}

export function RestrictedPlaceholderMessage({ variant }: { variant: RestrictedPlaceholderVariant }) {
    if (variant === "compact") {
        return (
            <ErrorContainer>
                {/* the placeholder replaces the widget title too, so without this the tile would
                    announce nothing at all — CompactContentError shows its text on hover only */}
                <span className="sr-only">
                    <FormattedMessage id="widget.error.restricted_insight.message" />{" "}
                    <FormattedMessage id="widget.error.restricted_insight.description" />
                </span>
                <CompactContentError
                    className="gd-icon-lock"
                    headline="widget.error.restricted_insight.message"
                    text="widget.error.restricted_insight.description"
                />
            </ErrorContainer>
        );
    }

    return (
        <ErrorContainer>
            <div className="info-label-icon gd-icon-lock">
                <Typography tagName="h2">
                    <FormattedMessage id="widget.error.restricted_insight.message" tagName="span" />
                </Typography>
                {variant === "full" ? (
                    <Typography tagName="h2">
                        <FormattedMessage id="widget.error.restricted_insight.description" tagName="span" />
                    </Typography>
                ) : null}
            </div>
        </ErrorContainer>
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
