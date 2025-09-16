// (C) 2019-2025 GoodData Corporation

import { useCallback } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IMeasure, IMeasureDefinition, newMeasure } from "@gooddata/sdk-model";

import { IPlaceholder } from "../base.js";
import { IPlaceholdersProviderProps, PlaceholdersProvider } from "../context.js";
import { newPlaceholder } from "../factory.js";
import { usePlaceholder } from "../hooks.js";

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
    placeholder?: IPlaceholder<any>;
    onSetPlaceholder?: (currentValue: any) => any;
}

function ComponentWithUsePlaceholderHook(props: IComponentWithUsePlaceholderHookProps) {
    const { onSetPlaceholder } = props;
    const [result, setPlaceholder] = usePlaceholder(props.placeholder);

    const onButtonClick = useCallback(() => {
        if (onSetPlaceholder) {
            setPlaceholder(onSetPlaceholder);
        }
    }, [onSetPlaceholder, setPlaceholder]);

    return (
        <div>
            <SetPlaceholderValueButton onClick={onButtonClick} />
            <ComponentWithResult result={result} />;
        </div>
    );
}

interface ISetPlaceholderValueButtonProps {
    onClick?: () => void;
}

function SetPlaceholderValueButton({ onClick }: ISetPlaceholderValueButtonProps) {
    return <button onClick={onClick}>Placeholder</button>;
}

interface IComponentWithResultProps {
    result: IMeasure<IMeasureDefinition>;
}
function ComponentWithResult({ result }: IComponentWithResultProps) {
    return (
        <div>
            <pre>{result?.measure?.localIdentifier}</pre>
        </div>
    );
}

describe("usePlaceholder", () => {
    it("should resolve default placeholder value", () => {
        const measure = newMeasure("test-measure");
        const singleValuePlaceholder = newPlaceholder(measure);
        createComponent({ placeholder: singleValuePlaceholder });

        expect(screen.queryByText(measure.measure.localIdentifier)).toBeInTheDocument();
    });

    it("should update placeholder value", async () => {
        const measure = newMeasure("updated-measure");
        const singleValuePlaceholder = newPlaceholder();
        createComponent({
            placeholder: singleValuePlaceholder,
            onSetPlaceholder: () => measure,
        });

        fireEvent.click(screen.getByText("Placeholder"));
        expect(screen.queryByText(measure.measure.localIdentifier)).toBeInTheDocument();
    });
});
