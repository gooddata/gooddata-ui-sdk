// (C) 2019-2021 GoodData Corporation
import React, { useCallback } from "react";
import { newMeasure } from "@gooddata/sdk-model";
import { mount } from "enzyme";
import { PlaceholdersProvider, IPlaceholdersProviderProps } from "../context";
import { newPlaceholder } from "../factory";
import { IPlaceholder } from "../base";
import { usePlaceholders } from "../hooks";

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
    placeholders: IPlaceholder<any>[];
    onSetPlaceholders?: (currentValue: any[]) => any[];
}

const ComponentWithUsePlaceholderHook = (props: IComponentWithUsePlaceholderHookProps) => {
    const { onSetPlaceholders } = props;
    const [results, setPlaceholders] = usePlaceholders(props.placeholders);

    const onButtonClick = useCallback(() => {
        if (onSetPlaceholders) {
            setPlaceholders(onSetPlaceholders);
        }
    }, [onSetPlaceholders]);

    return (
        <div>
            <SetPlaceholderValueButton onClick={onButtonClick} />
            <ComponentWithResult results={results} />;
        </div>
    );
};

interface ISetPlaceholderValueButtonProps {
    onClick?: () => void;
}

const SetPlaceholderValueButton = ({ onClick }: ISetPlaceholderValueButtonProps) => {
    return <button onClick={onClick}>Set placeholder value</button>;
};

interface IComponentWithResultProps {
    results: object[];
}
const ComponentWithResult = ({ results }: IComponentWithResultProps) => {
    return (
        <div>
            <pre>{JSON.stringify(results)}</pre>
        </div>
    );
};

describe("usePlaceholders", () => {
    it("should return undefined with no default placeholder values", () => {
        const singleValuePlaceholder = newPlaceholder();
        const multiValuePlaceholder = newPlaceholder();
        const Component = createComponent({ placeholders: [singleValuePlaceholder, multiValuePlaceholder] });

        expect(Component.find(ComponentWithResult).prop("results")).toEqual([undefined, undefined]);
    });

    it("should resolve default placeholder values", () => {
        const measure = newMeasure("test-measure");
        const singleValuePlaceholder = newPlaceholder(measure);
        const multiValuePlaceholder = newPlaceholder([]);
        const Component = createComponent({ placeholders: [singleValuePlaceholder, multiValuePlaceholder] });

        expect(Component.find(ComponentWithResult).prop("results")).toEqual([measure, []]);
    });

    it("should update placeholder values", () => {
        const measure = newMeasure("updated-measure");
        const measure2 = newMeasure("updated-measure2");
        const singleValuePlaceholder = newPlaceholder();
        const multiValuePlaceholder = newPlaceholder([]);

        const Component = createComponent({
            placeholders: [singleValuePlaceholder, multiValuePlaceholder],
            onSetPlaceholders: () => [measure, [measure2]],
        });

        expect(Component.find(ComponentWithResult).prop("results")).toEqual([undefined, []]);
        Component.find(SetPlaceholderValueButton).simulate("click");
        expect(Component.find(ComponentWithResult).prop("results")).toEqual([measure, [measure2]]);
    });
});
