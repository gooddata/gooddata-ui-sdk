// (C) 2019-2021 GoodData Corporation
import React, { useCallback } from "react";
import { newMeasure } from "@gooddata/sdk-model";
import { mount } from "enzyme";
import { PlaceholdersProvider, IPlaceholdersProviderProps } from "../context";
import { newPlaceholder } from "../factory";
import { IPlaceholder } from "../base";
import { usePlaceholder } from "../hooks";

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
    placeholder?: IPlaceholder<any>;
    onSetPlaceholder?: (currentValue: any) => any;
}

const ComponentWithUsePlaceholderHook = (props: IComponentWithUsePlaceholderHookProps) => {
    const { onSetPlaceholder } = props;
    const [result, setPlaceholder] = usePlaceholder(props.placeholder);

    const onButtonClick = useCallback(() => {
        if (onSetPlaceholder) {
            setPlaceholder(onSetPlaceholder);
        }
    }, [onSetPlaceholder]);

    return (
        <div>
            <SetPlaceholderValueButton onClick={onButtonClick} />
            <ComponentWithResult result={result} />;
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
    result: object;
}
const ComponentWithResult = ({ result }: IComponentWithResultProps) => {
    return (
        <div>
            <pre>{JSON.stringify(result)}</pre>
        </div>
    );
};

describe("usePlaceholder", () => {
    it("should return undefined with no default placeholder value", () => {
        const singleValuePlaceholder = newPlaceholder();
        const Component = createComponent({ placeholder: singleValuePlaceholder });

        expect(Component.find(ComponentWithResult).prop("result")).toEqual(undefined);
    });

    it("should resolve default placeholder value", () => {
        const measure = newMeasure("test-measure");
        const singleValuePlaceholder = newPlaceholder(measure);
        const Component = createComponent({ placeholder: singleValuePlaceholder });

        expect(Component.find(ComponentWithResult).prop("result")).toEqual(measure);
    });

    it("should update placeholder value", () => {
        const measure = newMeasure("updated-measure");
        const singleValuePlaceholder = newPlaceholder();
        const Component = createComponent({
            placeholder: singleValuePlaceholder,
            onSetPlaceholder: () => measure,
        });

        expect(Component.find(ComponentWithResult).prop("result")).toEqual(undefined);
        Component.find(SetPlaceholderValueButton).simulate("click");
        expect(Component.find(ComponentWithResult).prop("result")).toEqual(measure);
    });

    it("should return undefined if no placeholder is provided", () => {
        const Component = createComponent({ placeholder: undefined });

        expect(Component.find(ComponentWithResult).prop("result")).toEqual(undefined);
    });

    it("should throw an error if no placeholder is provided when setting its value", () => {
        const Component = createComponent({ placeholder: undefined, onSetPlaceholder: () => undefined });
        const boom = () => Component.find(SetPlaceholderValueButton).simulate("click");

        expect(boom).toThrowError();
    });
});
