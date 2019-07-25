// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import * as classNames from "classnames";
import noop = require("lodash/noop");
import { VisualizationObject } from "@gooddata/typings";

import Button from "@gooddata/goodstrap/lib/Button/Button";

import { ITotalWithData } from "../../../../interfaces/Totals";
import { TOTALS_ADD_ROW_HEIGHT } from "../constants/layout";

const LAST_ADDED_TOTAL_ROW_HIGHLIGHT_PERIOD = 1000;

export interface IRemoveRowsProps {
    totalsWithData: ITotalWithData[];
    lastAddedTotalType?: VisualizationObject.TotalType;
    onRemove?: (totalType: VisualizationObject.TotalType) => void;
    onLastAddedTotalRowHighlightPeriodEnd?: () => void;
}

export class RemoveRows extends React.Component<IRemoveRowsProps> {
    public static defaultProps: Partial<IRemoveRowsProps> = {
        onRemove: noop,
        onLastAddedTotalRowHighlightPeriodEnd: noop,
        totalsWithData: [],
    };

    private wrapperRef: HTMLElement;

    constructor(props: IRemoveRowsProps) {
        super(props);

        this.setWrapperRef = this.setWrapperRef.bind(this);
    }

    public render() {
        const { totalsWithData, lastAddedTotalType } = this.props;

        const style = { bottom: `${TOTALS_ADD_ROW_HEIGHT}px` };

        if (lastAddedTotalType) {
            setTimeout(
                this.props.onLastAddedTotalRowHighlightPeriodEnd,
                LAST_ADDED_TOTAL_ROW_HIGHLIGHT_PERIOD,
            );
        }

        return (
            <div className="indigo-totals-remove" style={style} ref={this.setWrapperRef}>
                {totalsWithData.map(total => this.renderRow(total))}
            </div>
        );
    }

    public getWrapperRef() {
        return this.wrapperRef;
    }

    private setWrapperRef(ref: HTMLElement) {
        this.wrapperRef = ref;
    }

    private renderRow(total: ITotalWithData) {
        const { onRemove, lastAddedTotalType } = this.props;

        const islastAddedTotalType = total.type === lastAddedTotalType;

        const classes = classNames("indigo-totals-remove-row", `totals-remove-row-${total.type}`, {
            "last-added": islastAddedTotalType,
        });

        const onClick = () => onRemove(total.type);

        return (
            <div className={classes} key={`totals-row-overlay-${total.type}`}>
                <Button
                    className={classNames(
                        `s-totals-rows-remove-${total.type}`,
                        "indigo-totals-row-remove-button",
                    )}
                    onClick={onClick}
                />
            </div>
        );
    }
}
