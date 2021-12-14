// (C) 2007-2021 GoodData Corporation
import React from "react";
import { ErrorComponent, Execute, LoadingComponent } from "@gooddata/sdk-ui";
import * as Md from "../../md/full";
import { newAttributeSort, newPositiveAttributeFilter } from "@gooddata/sdk-model";

const style = { border: "1px black solid" };

const CustomErrorComponent = ({ error }: { error: any }) => (
    <div>
        <ErrorComponent
            message="There was an error getting your execution"
            description={JSON.stringify(error, null, 2)}
        />
    </div>
);

const CustomLoadingComponent = () => (
    <div>
        <div className="gd-message progress">
            <div className="gd-message-text">Loading…</div>
        </div>
        <LoadingComponent />
    </div>
);

export const ExecuteWithSlicesExample: React.FC = () => {
    return (
        <div>
            <Execute
                seriesBy={[Md.$TotalSales, Md.$FranchisedSales]}
                slicesBy={[Md.LocationState, Md.LocationCity]}
                sortBy={[newAttributeSort(Md.LocationState, "asc")]}
                filters={[newPositiveAttributeFilter(Md.LocationState, ["Florida", "Texas"])]}
                LoadingComponent={CustomLoadingComponent}
                ErrorComponent={CustomErrorComponent}
            >
                {({ result }) => {
                    const slices = result!.data().slices().toArray();

                    return (
                        <table style={style}>
                            <tbody>
                                <tr style={style}>
                                    <th>State</th>
                                    <th>City</th>
                                    <th>Total Sales</th>
                                    <th>Total Franchised Cost</th>
                                </tr>
                                {slices.map((slice) => {
                                    const sliceTitles = slice.sliceTitles();
                                    const sales = slice.dataPoints()[0];
                                    const franchisedSales = slice.dataPoints()[1];

                                    return (
                                        <tr key={slice.id} style={style}>
                                            <td style={style}>{sliceTitles[0]}</td>
                                            <td style={style}>{sliceTitles[1]}</td>
                                            <td style={style}>{sales.formattedValue()}</td>
                                            <td style={style}>{franchisedSales.formattedValue()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    );
                }}
            </Execute>
        </div>
    );
};
