// (C) 2025 GoodData Corporation

import { ILegendDetails } from "@gooddata/sdk-ui-vis-commons";

import { IAvailableLegends, IGeoLegendItem } from "../../types/common/legends.js";
import { IGeoCommonData } from "../../types/geoData/common.js";

export interface ILegendBodyProps {
    containerId: string;
    legendDetails: ILegendDetails | null;
    categoryItems: IGeoLegendItem[];
    geoData: IGeoCommonData | null;
    availableLegends: IAvailableLegends;
    colorLegendValue: string | null;
    legendWidth: number;
    legendHeight: number;
    isFluidLayout: boolean;
    responsive: boolean | "autoPositionWithPopup";
    onCategoryItemClick: (item: IGeoLegendItem) => void;
}
