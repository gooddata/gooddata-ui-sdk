// (C) 2007-2020 GoodData Corporation
import React from "react";
import classNames from "classnames";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { MeasureValueFilterDropdown } from "@gooddata/sdk-ui-filters";
import { IMeasureValueFilter, measureLocalId } from "@gooddata/sdk-model";
import { LdmExt } from "../../../ldm";

const measures = [LdmExt.FranchisedSales];

const attributes = [LdmExt.LocationName];

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
        "icon-right",
        { "icon-navigateup": isActive, "icon-navigatedown": !isActive },
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
    {},
    IMeasureValueFilterComponentExampleState
> {
    public state = {
        displayDropdown: false,
        filters: [],
    };
    constructor(props: any) {
        super(props);
    }

    public onApply = (filter: IMeasureValueFilter) => {
        this.setState({ filters: [filter], displayDropdown: false });
    };

    public onCancel = () => {
        this.setState({ displayDropdown: false });
    };

    public toggleDropdown = () => {
        this.setState(state => ({ ...state, displayDropdown: !state.displayDropdown }));
    };

    public render() {
        const { filters, displayDropdown } = this.state;
        const ref = React.createRef<HTMLDivElement>();
        return (
            <React.Fragment>
                <div ref={ref}>
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
                        anchorEl={ref.current!}
                        measureIdentifier={measureLocalId(LdmExt.FranchisedSales)}
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
