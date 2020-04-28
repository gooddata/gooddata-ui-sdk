// (C) 2007-2019 GoodData Corporation
// import React from "react";
// import { Executor, LoadingComponent, ErrorComponent } from "@gooddata/sdk-ui";
// import { newAttribute } from "@gooddata/sdk-model";
// import toPairs from "lodash/toPairs";
// import groupBy from "lodash/groupBy";

// import {
//     projectId,
//     locationStateDisplayFormIdentifier,
//     locationNameDisplayFormIdentifier,
// } from "../../constants/fixtures";
// import { useBackend } from "../../context/auth";

// const getAttributeHeaderItemName = x => x.attributeHeaderItem.name;
// const withIndex = fn => {
//     let index = 0;
//     return (...args) => fn(index++, ...args);
// };

// const resultStyle = {
//     maxHeight: 200,
//     overflow: "auto",
//     padding: "1rem",
//     backgroundColor: "#EEE",
// };

// export const ExecuteAttributeValuesExample: React.FC = () => {
//     const backend = useBackend();
//     const execution = backend
//         .workspace(projectId)
//         .execution()
//         .forItems([
//             newAttribute(locationStateDisplayFormIdentifier),
//             newAttribute(locationNameDisplayFormIdentifier),
//         ]);

//     return (
//         <div>
//             <Executor execution={execution}>
//                 {({ error, isLoading, result }) => {
//                     if (error) {
//                         return (
//                             <ErrorComponent
//                                 message="There was an error getting your execution"
//                                 description={JSON.stringify(error, null, "  ")}
//                             />
//                         );
//                     }
//                     if (isLoading || !result) {
//                         return <LoadingComponent />;
//                     }

//                     const [[locationStateHeaders, locationNameHeaders]] = result.headerItems();
//                     const locationStates = locationStateHeaders.map(getAttributeHeaderItemName);
//                     const locations = locationNameHeaders.map(getAttributeHeaderItemName);
//                     const locationsByState = groupBy(locations, withIndex(index => locationStates[index]));
//                     const locationStateLocationsPairs = toPairs(locationsByState);

//                     return (
//                         <div>
//                             <ul className="attribute-values s-execute-attribute-values">
//                                 {locationStateLocationsPairs.map(([locationState, _locations]) => (
//                                     <li key={locationState}>
//                                         <strong>{locationState}</strong>
//                                         <ul>
//                                             {_locations.map(location => (
//                                                 <li key={location}>{location}</li>
//                                             ))}
//                                         </ul>
//                                     </li>
//                                 ))}
//                             </ul>

//                             <p>Full execution response and result as JSON:</p>
//                             <pre style={resultStyle}>
//                                 {JSON.stringify({ result, isLoading, error }, null, 2)}
//                             </pre>
//                         </div>
//                     );
//                 }}
//             </Executor>
//         </div>
//     );
// };
