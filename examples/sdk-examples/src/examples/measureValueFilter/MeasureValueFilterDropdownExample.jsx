// // (C) 2007-2019 GoodData Corporation
// import React, { Component } from "react";
// import { PivotTable, Model, MeasureValueFilterDropdown } from "@gooddata/react-components";

// import "@gooddata/react-components/styles/css/main.css";
// import {
//     projectId,
//     franchiseFeesIdentifier,
//     franchisedSalesIdentifier,
//     locationNameDisplayFormIdentifier,
// } from "../utils/fixtures";

// const franchiseFeesMeasure = Model.measure(franchiseFeesIdentifier)
//     .format("#,##0")
//     .localIdentifier("franchiseFees")
//     .title("Franchise Fees");
// const franchiseSalesMeasure = Model.measure(franchisedSalesIdentifier)
//     .format("#,##0")
//     .localIdentifier("franchiseSales")
//     .title("Franchise Sales");
// const measures = [franchiseFeesMeasure, franchiseSalesMeasure];

// const attributes = [Model.attribute(locationNameDisplayFormIdentifier).localIdentifier("locationName")];

// export class MeasureValueFilterDropdownExample extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             filter: null,
//         };
//     }

//     onApply = filter => {
//         this.setState({ filter });
//     };

//     render() {
//         const { filter } = this.state;
//         return (
//             <div>
//                 <MeasureValueFilterDropdown
//                     onApply={this.onApply}
//                     measureTitle={franchiseSalesMeasure.measure.title}
//                     measureIdentifier={franchiseSalesMeasure.measure.localIdentifier}
//                     filter={filter || null}
//                 />
//                 <hr className="separator" />
//                 <div style={{ height: 300 }} className="s-pivot-table">
//                     <PivotTable
//                         projectId={projectId}
//                         measures={measures}
//                         rows={attributes}
//                         filters={filter ? [filter] : []}
//                     />
//                 </div>
//             </div>
//         );
//     }
// }

// export default MeasureValueFilterDropdownExample;
