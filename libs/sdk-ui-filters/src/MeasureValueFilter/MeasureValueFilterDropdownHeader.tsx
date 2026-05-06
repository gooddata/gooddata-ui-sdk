// (C) 2026 GoodData Corporation

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";
import { ShortenedText } from "@gooddata/sdk-ui-kit";

import { MeasureValueFilterDetailsBubble } from "./MeasureValueFilterDetailsBubble.js";

/**
 * Props for {@link MeasureValueFilterDropdownHeader}.
 *
 * @internal
 */
export interface IMeasureValueFilterDropdownHeaderProps {
    /**
     * Metric title shown in the header.
     */
    title: string;
    /**
     * Loader invoked the first time the details tooltip opens.
     */
    loadMetricDetails?: () => Promise<IMeasureMetadataObject | undefined>;
}

/**
 * Header of the MeasureValueFilter dropdown — title with a question-mark icon
 * that reveals lazily loaded metric details on hover/focus.
 *
 * @internal
 */
export function MeasureValueFilterDropdownHeader({
    title,
    loadMetricDetails,
}: IMeasureValueFilterDropdownHeaderProps) {
    return (
        <div className="gd-mvf-dropdown-header s-mvf-dropdown-header">
            <div className="gd-mvf-dropdown-header__title">
                <ShortenedText
                    className="gd-mvf-dropdown-header__title-text"
                    tooltipAlignPoints={[{ align: "tc bc" }]}
                    ellipsisPosition="end"
                >
                    {title}
                </ShortenedText>
                {loadMetricDetails ? (
                    <span className="gd-mvf-dropdown-header__title-icon">
                        <MeasureValueFilterDetailsBubble title={title} requestHandler={loadMetricDetails} />
                    </span>
                ) : null}
            </div>
        </div>
    );
}
