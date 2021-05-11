// (C) 2007-2019 GoodData Corporation
import React from "react";
import Select from "react-select";
import {
    PlaceholdersProvider,
    newPlaceholder,
    newComposedPlaceholder,
    usePlaceholders,
    usePlaceholder,
    useResolveValueWithPlaceholders,
} from "@gooddata/sdk-ui";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { Ldm, LdmExt } from "../../ldm";
import isEmpty from "lodash/isEmpty";
import {
    attributeIdentifier,
    isAttribute,
    measureAlias,
    attributeAlias,
    measureTitle,
    measureIdentifier,
    modifySimpleMeasure,
    newAbsoluteDateFilter,
    modifyMeasure,
    IAttribute,
    IMeasure,
    IMeasureDefinition,
} from "@gooddata/sdk-model";

const primaryMeasure = modifyMeasure(Ldm.$TotalSales, (m) => m.localId("primaryMeasure"));
const primaryMeasurePlaceholder = newPlaceholder<IMeasure<IMeasureDefinition>>();
const filterPlaceholder = newPlaceholder(
    newAbsoluteDateFilter(Ldm.DateDatasets.Date.ref, "2017-01-01", "2017-09-01"),
);
const stackByAttributePlaceholder = newPlaceholder<IAttribute>();
const viewByAttributesPlaceholder = newPlaceholder<IAttribute[]>([]);
const measuresPlaceholder = newPlaceholder<IMeasure[]>([]);

const computedMeasurePlaceholder = newComposedPlaceholder(
    [primaryMeasurePlaceholder, filterPlaceholder],
    ([pm, filter]): IMeasure => {
        if (!pm) {
            return (undefined as unknown) as IMeasure;
        }
        return modifySimpleMeasure(pm, (m) => m.filters(filter).localId("derivedMeasure"));
    },
);

const stackByAttributes = [Ldm.LocationState, Ldm.LocationCity, Ldm.LocationOwnership];
const StackByAttributeSelect: React.FC = () => {
    const [activeStackByAttribute, setStackByAttribute] = usePlaceholder(stackByAttributePlaceholder);

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
    const [activeViewByAttributes, setViewByAttributes] = usePlaceholder(viewByAttributesPlaceholder);

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

const measures = [LdmExt.FranchiseFees, LdmExt.TotalCosts, LdmExt.FranchisedSales];
const MeasuresSelect: React.FC = () => {
    const [activeMeasures, setMeasures] = usePlaceholder(measuresPlaceholder);

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
                value={activeMeasures}
            />
        </div>
    );
};

const PrimaryMeasureToggle: React.FC = () => {
    const [activePrimaryMeasure, setPrimaryMeasure] = usePlaceholder(primaryMeasurePlaceholder);

    return (
        <button
            onClick={() =>
                setPrimaryMeasure((m) => {
                    return m ? undefined : primaryMeasure;
                })
            }
        >
            {activePrimaryMeasure ? "Disable primary measure" : "Enable primary measure"}
        </button>
    );
};

const AtomicPreset: React.FC = () => {
    const [, setPlaceholders] = usePlaceholders([
        primaryMeasurePlaceholder,
        measuresPlaceholder,
        viewByAttributesPlaceholder,
        stackByAttributePlaceholder,
    ]);

    return (
        <button
            onClick={() => setPlaceholders([primaryMeasure, measures, viewByAttributes, Ldm.LocationState])}
        >
            Select preset
        </button>
    );
};

const style = { height: 600 };
const PlaceholderBarChart: React.FC = () => {
    const measures = [primaryMeasurePlaceholder, measuresPlaceholder, computedMeasurePlaceholder];
    const resolvedMeasures = useResolveValueWithPlaceholders(measures);

    return (
        <div style={style}>
            {isEmpty(resolvedMeasures) ? (
                <h2>Select at least one measure to display the chart</h2>
            ) : (
                <BarChart
                    measures={measures}
                    stackBy={stackByAttributePlaceholder}
                    viewBy={[viewByAttributesPlaceholder]}
                />
            )}
        </div>
    );
};

const PlaceholdersExample: React.FC = () => {
    return (
        <PlaceholdersProvider>
            <PrimaryMeasureToggle />
            <AtomicPreset />
            <MeasuresSelect />
            <ViewByAttributeSelect />
            <StackByAttributeSelect />
            <PlaceholderBarChart />
        </PlaceholdersProvider>
    );
};

export default PlaceholdersExample;
