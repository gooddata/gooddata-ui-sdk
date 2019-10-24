// // (C) 2007-2019 GoodData Corporation
// import React from "react";
// import PropTypes from "prop-types";
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

// class DropdownButton extends React.PureComponent {
//     static propTypes = {
//         isActive: PropTypes.boolean,
//         measureTitle: PropTypes.string.isRequired,
//         operator: PropTypes.string.isRequired,
//         operatorTitle: PropTypes.string.isRequired,
//         onClick: PropTypes.func.isRequired,
//         value: PropTypes.object.isRequired,
//     };

//     static defaultProps = {
//         isActive: false,
//     };

//     getStyle = () => {
//         const { isActive } = this.props;
//         const mainColor = isActive ? "#0e69c9" : "#1787ff";
//         return {
//             color: "#fff",
//             fontSize: "1rem",
//             backgroundColor: mainColor,
//             borderColor: mainColor,
//             borderRadius: ".5rem",
//             margin: ".15rem",
//             padding: ".5rem 1.5rem",
//             boxShadow: isActive
//                 ? "rgba(0, 0, 0, 0.25) 2px 4px 5px 0px"
//                 : "rgba(0, 0, 0, 0.2) 1px 3px 5px 0px",
//             transition:
//                 "box-shadow .25s ease-in-out, background-color .25s ease-in-out, border-color .25s ease-in-out",
//         };
//     };

//     renderStatus = () => {
//         const { operatorTitle, operator, value } = this.props;

//         if (Model.measureValueFilter.isComparisonTypeOperator(operator)) {
//             return `${operatorTitle} ${value.value}`;
//         } else if (Model.measureValueFilter.isRangeTypeOperator(operator)) {
//             return `${operatorTitle} ${value.from} - ${value.to}`;
//         }

//         return "-";
//     };

//     render() {
//         const { onClick, measureTitle } = this.props;
//         return (
//             <button style={this.getStyle()} onClick={onClick}>
//                 {measureTitle || "Measure"}
//                 <br />
//                 {this.renderStatus()}
//             </button>
//         );
//     }
// }

// export class MeasureValueFilterDropdownCustomButtonExample extends React.PureComponent {
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
//                     button={DropdownButton}
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

// export default MeasureValueFilterDropdownCustomButtonExample;
