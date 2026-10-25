// (C) 2022-2026 GoodData Corporation

import { type ReactNode } from "react";

import classNames from "classnames";

import { ShortenedText } from "@gooddata/sdk-ui-kit";
import { simplifyText } from "@gooddata/util";

const tooltipAlignPoints = [
    { align: "tc bc", offset: { x: 0, y: -2 } },
    { align: "cc tc", offset: { x: 0, y: 10 } },
    { align: "bl tr", offset: { x: -2, y: -8 } },
];

interface IDatasetTitleProps {
    title: string;
    isAllTime: boolean;
    isDragged: boolean;
    children: ReactNode;
}

export function DatasetTitle({ isAllTime, isDragged, title, children }: IDatasetTitleProps) {
    const className = classNames(
        "adi-filter-title",
        "adi-filter-selection",
        "s-attribute-filter-button-title",
        "s-global-attribute-filter-title",
        "s-global-filter-label-upper",
        `s-adi-filter-button-${simplifyText(title)}`,
    );
    const intervalClassNames = classNames("adi-filter-title-short", {
        "adi-filter-title-value": !isAllTime,
    });
    return (
        <div className={className}>
            <ShortenedText
                tooltipAlignPoints={tooltipAlignPoints}
                tooltipVisibleOnMouseOver={false}
                displayTooltip={!isDragged}
                className="adi-filter-title-long"
            >
                {title}
            </ShortenedText>
            {children ? <span className="adi-filter-title-colon">:&nbsp;</span> : null}
            <span className={intervalClassNames}>{children}</span>
        </div>
    );
}
