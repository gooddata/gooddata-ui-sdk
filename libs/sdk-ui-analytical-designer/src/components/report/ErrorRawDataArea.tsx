// (C) 2023-2026 GoodData Corporation

import { useMemo } from "react";

import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { type IErrorRawData } from "../../typings/report.js";

import { parseRawDataToTextareaContent } from "./reportUtils.js";

interface IErrorRawDataDialogProps {
    errorRawData: IErrorRawData;
}

const HEADER_TOOLTIP_ALIGN_POINTS = [{ align: "tr br", offset: { x: -16, y: 2 } }];

export function ErrorRawDataArea({ errorRawData }: IErrorRawDataDialogProps) {
    const errorRawDataString = useMemo(() => parseRawDataToTextareaContent(errorRawData), [errorRawData]);

    return (
        <div className="error-raw-data-area-wrapper">
            <div className="error-raw-data-area">
                <BubbleHoverTrigger hideDelay={0} showDelay={0}>
                    <div className="error-raw-data-area-header s-error-raw-data-area-header">
                        <FormattedMessage id="error_raw_data_area.header" />
                        <span className="gd-icon-circle-question error-raw-data-header-icon" />
                    </div>
                    <Bubble
                        className="bubble-primary error-raw-data-area-tooltip"
                        alignPoints={HEADER_TOOLTIP_ALIGN_POINTS}
                    >
                        <FormattedMessage id="error_raw_data_area.header.tooltip" />
                    </Bubble>
                </BubbleHoverTrigger>
                <div className="error-raw-data-area-content">
                    <pre>{errorRawDataString}</pre>
                </div>
            </div>
        </div>
    );
}
