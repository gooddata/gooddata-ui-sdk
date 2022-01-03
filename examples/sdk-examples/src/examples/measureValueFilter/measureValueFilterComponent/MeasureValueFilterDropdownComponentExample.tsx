// (C) 2007-2022 GoodData Corporation
import React from "react";
import classNames from "classnames";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { MeasureValueFilterDropdown } from "@gooddata/sdk-ui-filters";
import { IMeasureValueFilter, measureLocalId, localIdRef, modifyMeasure } from "@gooddata/sdk-model";
import * as Md from "../../../md/full";

const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) => m.format("#,##0").title("Franchise Sales"));

const measures = [FranchisedSales];

const attributes = [Md.LocationName.Default];

const defaultFilter: IMeasureValueFilter = {
    measureValueFilter: {
        measure: localIdRef(measureLocalId(measures[0])),
    },
};

interface IMeasureValueFilterDropdownButton {
    isActive: boolean;
    measureTitle: string;
    onClick: () => any;
}

const DropdownButton = ({ isActive, measureTitle, onClick }: IMeasureValueFilterDropdownButton) => {
    const className = classNames(
        "gd-mvf-dropdown-button",
        "s-mvf-dropdown-button",
        "gd-button",
        "gd-button-secondary",
        "button-dropdown",
        "gd-icon-right",
        { "gd-icon-navigateup": isActive, "gd-icon-navigatedown": !isActive },
    );

    return (
        <button className={className} onClick={onClick}>
            {measureTitle}
        </button>
    );
};

interface IMeasureValueFilterComponentExampleState {
    displayDropdown: any;
    filters: IMeasureValueFilter[];
}

export class MeasureValueFilterComponentExample extends React.PureComponent<
    unknown,
    IMeasureValueFilterComponentExampleState
> {
    public state = {
        displayDropdown: false,
        filters: [],
    };
    public ref = React.createRef<HTMLDivElement>();

    public onApply = (filter: IMeasureValueFilter): void => {
        this.setState({ filters: [filter ?? defaultFilter], displayDropdown: false });
    };

    public onCancel = (): void => {
        this.setState({ displayDropdown: false });
    };

    public toggleDropdown = (): void => {
        this.setState((state) => ({ ...state, displayDropdown: !state.displayDropdown }));
    };

    public render(): React.ReactNode {
        const { filters, displayDropdown } = this.state;

        return (
            <React.Fragment>
                <div ref={this.ref}>
                    <DropdownButton
                        onClick={this.toggleDropdown}
                        isActive={displayDropdown}
                        measureTitle="Custom button"
                    />
                </div>
                {displayDropdown ? (
                    <MeasureValueFilterDropdown
                        onApply={this.onApply}
                        onCancel={this.onCancel}
                        filter={filters[0]}
                        anchorEl={this.ref.current!}
                        measureIdentifier={measureLocalId(FranchisedSales)}
                    />
                ) : null}
                <hr className="separator" />
                <div style={{ height: 300 }} className="s-pivot-table">
                    <PivotTable measures={measures} rows={attributes} filters={filters} />
                </div>
            </React.Fragment>
        );
    }
}

export default MeasureValueFilterComponentExample;
