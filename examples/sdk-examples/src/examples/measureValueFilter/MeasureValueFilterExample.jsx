// // (C) 2007-2019 GoodData Corporation
// import React, { Component } from "react";
// import { PivotTable, Model } from "@gooddata/react-components";

// import "@gooddata/react-components/styles/css/main.css";
// import { projectId, franchiseFeesIdentifier, locationNameDisplayFormIdentifier } from "../utils/fixtures";

// const measures = [
//     Model.measure(franchiseFeesIdentifier)
//         .format("#,##0")
//         .localIdentifier("franchiseFees")
//         .title("Franchise Fees"),
// ];

// const attributes = [Model.attribute(locationNameDisplayFormIdentifier).localIdentifier("locationName")];
// const greaterThanFilter = Model.measureValueFilter.getFilter("franchiseFees", "GREATER_THAN", {
//     value: 700000,
// });
// const betweenFilter = Model.measureValueFilter.getFilter("franchiseFees", "BETWEEN", {
//     from: 500000,
//     to: 800000,
// });

// export class FilterByValueExample extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             filters: [],
//         };
//     }

//     renderPresetButton(label, appliedFilters, isActive) {
//         return (
//             <button
//                 className={`gd-button gd-button-secondary ${isActive ? "is-active" : ""}`}
//                 onClick={() =>
//                     this.setState({
//                         filters: appliedFilters,
//                     })
//                 }
//             >
//                 {label}
//             </button>
//         );
//     }

//     render() {
//         const { filters } = this.state;
//         return (
//             <div>
//                 <div>
//                     {this.renderPresetButton("All franchise fees", [], filters.length === 0)}
//                     {this.renderPresetButton(
//                         "Franchise fees greater than 700,000",
//                         [greaterThanFilter],
//                         filters[0] === greaterThanFilter,
//                     )}
//                     {this.renderPresetButton(
//                         "Franchise fees between 500,000 and 800,000",
//                         [betweenFilter],
//                         filters[0] === betweenFilter,
//                     )}
//                 </div>
//                 <hr className="separator" />
//                 <div style={{ height: 300 }} className="s-pivot-table">
//                     <PivotTable
//                         projectId={projectId}
//                         measures={measures}
//                         rows={attributes}
//                         filters={filters}
//                     />
//                 </div>
//             </div>
//         );
//     }
// }

// export default FilterByValueExample;
