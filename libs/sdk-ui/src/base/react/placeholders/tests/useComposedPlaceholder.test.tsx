// (C) 2019-2022 GoodData Corporation
import React from "react";
import {
    newMeasure,
    newRelativeDateFilter,
    modifySimpleMeasure,
    IMeasure,
    IMeasureDefinition,
} from "@gooddata/sdk-model";
import { render } from "@testing-library/react";
import { PlaceholdersProvider, IPlaceholdersProviderProps } from "../context";
import { newComposedPlaceholder, newPlaceholder } from "../factory";
import { IComposedPlaceholder } from "../base";
import { useComposedPlaceholder } from "../hooks";

const createComponent = (
    componentProps: IComponentWithUsePlaceholderHookProps,
    providerProps?: IPlaceholdersProviderProps,
) =>
    render(
        <PlaceholdersProvider {...providerProps}>
            <ComponentWithUsePlaceholderHook {...componentProps} />
        </PlaceholdersProvider>,
    );

interface IComponentWithUsePlaceholderHookProps {
    placeholder: IComposedPlaceholder<any, any, any>;
    resolutionContext?: any;
}

const ComponentWithUsePlaceholderHook = (props: IComponentWithUsePlaceholderHookProps) => {
    const result = useComposedPlaceholder(props.placeholder, props.resolutionContext);

    return <ComponentWithResult result={result.length ? result : [result]} />;
};

interface IComponentWithResultProps {
    result: IMeasure<IMeasureDefinition>[];
}

const ComponentWithResult = ({ result }: IComponentWithResultProps) => {
    return (
        <div>
            {result.map((res, i) => (
                <div key={i}>{res.measure.localIdentifier}</div>
            ))}
        </div>
    );
};

describe("useComposedPlaceholder", () => {
    it("should resolve composed placeholder value", () => {
        const testMeasure = newMeasure("test-measure");
        const measurePlaceholder = newPlaceholder(testMeasure);
        const testFilter = newRelativeDateFilter("test-date-dataset", "GDC.time.month", 0, -12);
        const filtersPlaceholder = newPlaceholder([testFilter]);
        const composedPlaceholder = newComposedPlaceholder(
            [measurePlaceholder, filtersPlaceholder],
            ([measure, filters]) => {
                return modifySimpleMeasure(measure, (m) => m.filters(...filters));
            },
        );
        const expectedMeasure = modifySimpleMeasure(testMeasure, (m) => m.filters(testFilter));

        const { queryByText } = createComponent({ placeholder: composedPlaceholder });
        expect(queryByText(expectedMeasure.measure.localIdentifier)).toBeInTheDocument();
    });

    it("should resolve composed placeholder value with custom resolution context", () => {
        const testMeasure = newMeasure("test-measure");
        const testFormat = "$#,##";
        const composedPlaceholder = newComposedPlaceholder([testMeasure], ([measure], { customFormat }) => {
            return modifySimpleMeasure(measure, (m) => m.format(customFormat));
        });
        const expectedMeasure = modifySimpleMeasure(testMeasure, (m) => m.format(testFormat));

        const { queryByText } = createComponent({
            placeholder: composedPlaceholder,
            resolutionContext: { customFormat: testFormat },
        });
        expect(queryByText(expectedMeasure.measure.localIdentifier)).toBeInTheDocument();
    });

    it("should resolve composed placeholder value with custom resolution context and multiple composed placeholders", () => {
        const testMeasure1 = newMeasure("test-measure1");
        const testMeasure2 = newMeasure("test-measure2");
        const testFormat = "$#,##";
        const composedPlaceholder1 = newComposedPlaceholder([testMeasure1], ([measure], { customFormat }) => {
            return modifySimpleMeasure(measure, (m) => m.format(customFormat));
        });
        const composedPlaceholder2 = newComposedPlaceholder([testMeasure2], ([measure], { customFormat }) => {
            return modifySimpleMeasure(measure, (m) => m.format(customFormat));
        });
        const composedPlaceholder3 = newComposedPlaceholder([composedPlaceholder1, composedPlaceholder2]);

        const expectedMeasure1 = modifySimpleMeasure(testMeasure1, (m) => m.format(testFormat));
        const expectedMeasure2 = modifySimpleMeasure(testMeasure2, (m) => m.format(testFormat));
        const { queryByText } = createComponent({
            placeholder: composedPlaceholder3,
            resolutionContext: { customFormat: testFormat },
        });

        expect(queryByText(expectedMeasure1.measure.localIdentifier)).toBeInTheDocument();
        expect(queryByText(expectedMeasure2.measure.localIdentifier)).toBeInTheDocument();
    });
});
