// (C) 2019-2021 GoodData Corporation
import React from "react";
import { newMeasure, newRelativeDateFilter, modifySimpleMeasure } from "@gooddata/sdk-model";
import { mount } from "enzyme";
import { PlaceholdersProvider, IPlaceholdersProviderProps } from "../context";
import { newComposedPlaceholder, newPlaceholder } from "../factory";
import { IComposedPlaceholder } from "../base";
import { useComposedPlaceholder } from "../hooks";

const createComponent = (
    componentProps: IComponentWithUsePlaceholderHookProps,
    providerProps?: IPlaceholdersProviderProps,
) =>
    mount(
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

    return <ComponentWithResult result={result} />;
};

interface IComponentWithResultProps {
    result: object;
}

const ComponentWithResult = ({ result }: IComponentWithResultProps) => {
    return (
        <div>
            <pre>{JSON.stringify(result)}</pre>
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

        const Component = createComponent({ placeholder: composedPlaceholder });
        expect(Component.find(ComponentWithResult).prop("result")).toEqual(expectedMeasure);
    });

    it("should resolve composed placeholder value with custom resolution context", () => {
        const testMeasure = newMeasure("test-measure");
        const testFormat = "$#,##";
        const composedPlaceholder = newComposedPlaceholder([testMeasure], ([measure], { customFormat }) => {
            return modifySimpleMeasure(measure, (m) => m.format(customFormat));
        });
        const expectedMeasure = modifySimpleMeasure(testMeasure, (m) => m.format(testFormat));

        const Component = createComponent({
            placeholder: composedPlaceholder,
            resolutionContext: { customFormat: testFormat },
        });
        expect(Component.find(ComponentWithResult).prop("result")).toEqual(expectedMeasure);
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

        const Component = createComponent({
            placeholder: composedPlaceholder3,
            resolutionContext: { customFormat: testFormat },
        });

        expect(Component.find(ComponentWithResult).prop("result")).toEqual([
            expectedMeasure1,
            expectedMeasure2,
        ]);
    });
});
