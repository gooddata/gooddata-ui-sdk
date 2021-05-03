// (C) 2007-2019 GoodData Corporation
import React from "react";
import Select from "react-select";
import {
    PlaceholdersProvider,
    newMeasurePlaceholder,
    newMeasureGroupPlaceholder,
    newAttributePlaceholder,
    useAttributePlaceholder,
    useMeasurePlaceholderGroup,
    newAttributeGroupPlaceholder,
    useAttributeGroupPlaceholder,
    useMeasurePlaceholder,
} from "@gooddata/sdk-ui";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { Ldm, LdmExt } from "../../ldm";
import {
    attributeIdentifier,
    isAttribute,
    measureAlias,
    attributeAlias,
    measureTitle,
    measureIdentifier,
} from "@gooddata/sdk-model";

const primaryMeasure = LdmExt.AvgDailyTotalSales;
const primaryMeasurePlaceholder = newMeasurePlaceholder("primary");
const stackByAttributePlaceholder = newAttributePlaceholder("stackBy");
const viewByAttributesPlaceholder = newAttributeGroupPlaceholder("viewBy", []);
const measuresPlaceholder = newMeasureGroupPlaceholder("measures", []);

const stackByAttributes = [Ldm.LocationState, Ldm.LocationCity, Ldm.LocationOwnership];
const StackByAttributeSelect: React.FC = () => {
    const [activeStackByAttribute, setStackByAttribute] = useAttributePlaceholder(
        stackByAttributePlaceholder,
    );

    return (
        <div>
            <Select
                onChange={(option) => setStackByAttribute(option!)}
                options={stackByAttributes}
                getOptionLabel={(attr) => attributeAlias(attr) ?? attributeIdentifier(attr)!}
                getOptionValue={(attr) => attributeIdentifier(attr)!}
                placeholder="Select stack by attribute..."
                value={activeStackByAttribute}
                isClearable
            />
        </div>
    );
};

const viewByAttributes = [Ldm.LocationState, Ldm.LocationCity, Ldm.LocationOwnership];
const ViewByAttributeSelect: React.FC = () => {
    const [activeViewByAttributes, setViewByAttributes] = useAttributeGroupPlaceholder(
        viewByAttributesPlaceholder,
    );

    return (
        <div>
            <Select
                onChange={(option) => setViewByAttributes(option ? [...option] : [])}
                options={viewByAttributes}
                getOptionLabel={(attr) => attributeAlias(attr) ?? attributeIdentifier(attr)!}
                getOptionValue={(attr) => attributeIdentifier(attr)!}
                placeholder="Select view by attributes..."
                value={activeViewByAttributes}
                isMulti
                isClearable
            />
        </div>
    );
};

const measures = [LdmExt.FranchiseFees, LdmExt.TotalCosts, LdmExt.TotalSales1];
const MeasuresSelect: React.FC = () => {
    const [activeMeasures, setMeasures] = useMeasurePlaceholderGroup(measuresPlaceholder);

    return (
        <div>
            <Select
                onChange={(option) => setMeasures(option ? [...option] : [])}
                options={measures}
                placeholder="Select additional measures..."
                getOptionLabel={(attrOrMeasure) =>
                    isAttribute(attrOrMeasure)
                        ? attributeAlias(attrOrMeasure) ?? attributeIdentifier(attrOrMeasure)!
                        : measureAlias(attrOrMeasure) ?? measureTitle(attrOrMeasure)!
                }
                getOptionValue={(attrOrMeasure) =>
                    isAttribute(attrOrMeasure)
                        ? attributeIdentifier(attrOrMeasure)!
                        : measureIdentifier(attrOrMeasure)!
                }
                isMulti
                isClearable
                value={activeMeasures ?? []}
            />
        </div>
    );
};

const PrimaryMeasureToggle: React.FC = () => {
    const [activePrimaryMeasure, setPrimaryMeasure] = useMeasurePlaceholder(primaryMeasurePlaceholder);

    return (
        <button onClick={() => setPrimaryMeasure((m) => (m ? undefined : primaryMeasure))}>
            {activePrimaryMeasure ? "Disable primary measure" : "Enable primary measure"}
        </button>
    );
};

const style = { height: 600 };
const PlaceholderBarChart: React.FC = () => {
    return (
        <div style={style}>
            <BarChart
                measures={[primaryMeasurePlaceholder, measuresPlaceholder]}
                stackBy={stackByAttributePlaceholder}
                viewBy={viewByAttributesPlaceholder}
            />
        </div>
    );
};

const PlaceholdersExample: React.FC = () => {
    return (
        <PlaceholdersProvider undefinedPlaceholderHandling="warning">
            <PrimaryMeasureToggle />
            <MeasuresSelect />
            <ViewByAttributeSelect />
            <StackByAttributeSelect />
            <PlaceholderBarChart />
        </PlaceholdersProvider>
    );
};

export default PlaceholdersExample;
