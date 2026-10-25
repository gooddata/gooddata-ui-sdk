// (C) 2007-2026 GoodData Corporation

import { useSelector } from "react-redux";

import { getUiConfigCustomErrorSelector } from "../../selectors/extended_reference_point_selector.js";
import { type IAppState } from "../../store/types.js";

interface IReportCustomErrorProps {
    heading?: string;
    text?: string;
}

const getCustomError = (state: IAppState): IReportCustomErrorProps | null =>
    getUiConfigCustomErrorSelector(state);

export function ReportCustomError() {
    const heading = useSelector((state: IAppState) => getCustomError(state)?.heading ?? "");
    const text = useSelector((state: IAppState) => getCustomError(state)?.text ?? "");

    return (
        <div className="adi-canvas-message s-canvas-message">
            <h2>{heading}</h2>
            <p>{text}</p>
        </div>
    );
}
