// (C) 2007-2026 GoodData Corporation

import { type ReactElement } from "react";

import classNames from "classnames";

import { useElementSize, useMediaQuery } from "@gooddata/sdk-ui-kit";

import { Buckets } from "./Buckets.js";
import { DataSampler } from "./dataSampler/DataSampler.js";
import { FilterBar } from "./filterBar/FilterBar.js";
import { PoweredByGDLogo } from "./PoweredByGDLogo.js";
import { Recommendations } from "./Recommendations.js";
import { Report } from "./Report.js";
import { PartialDataWarning } from "./report/PartialDataWarning.js";
import { Shortcuts } from "./Shortcuts.js";
import { ChartSort } from "./sort/ChartSort.js";

interface IEditorMainProps {
    isTopBarHidden: boolean;
}

export function EditorMain({ isTopBarHidden }: IEditorMainProps): ReactElement {
    const containerClasses = classNames("adi-editor-main", {
        "hidden-top-bar": isTopBarHidden,
    });

    const canvas = useElementSize<HTMLDivElement>();
    const isSmallCanvas = useMediaQuery("<sm", canvas.width);

    const filterBar = useElementSize<HTMLDivElement>();
    const isSmFilterBar = useMediaQuery("<sm", filterBar.width);

    return (
        <div className={containerClasses}>
            <Buckets />

            <div className="adi-editor-right-container">
                <div
                    ref={filterBar.ref}
                    className={classNames("adi-filter-bar", {
                        "adi-filter-bar-small": isSmFilterBar,
                    })}
                >
                    <div className="adi-filter-bar-content">
                        <FilterBar isSmallScreen={isSmFilterBar} />
                        <ChartSort />
                    </div>
                    <DataSampler isSmallScreen={isSmFilterBar} />
                </div>
                <div className="adi-editor-canvas" ref={canvas.ref}>
                    <Report isSmallScreen={isSmallCanvas} />
                    <Recommendations />
                    <Shortcuts />
                </div>

                <div className="adi-warning-partial-result">
                    <PartialDataWarning />
                </div>
                <PoweredByGDLogo />
            </div>
        </div>
    );
}
