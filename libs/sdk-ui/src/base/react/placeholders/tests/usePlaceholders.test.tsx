// (C) 2019-2025 GoodData Corporation

import { useCallback } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IMeasure, IMeasureDefinition, newMeasure } from "@gooddata/sdk-model";

import { IPlaceholder } from "../base.js";
import { IPlaceholdersProviderProps, PlaceholdersProvider } from "../context.js";
import { newPlaceholder } from "../factory.js";
import { usePlaceholders } from "../hooks.js";

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
    placeholders: IPlaceholder<any>[];
    onSetPlaceholders?: (currentValue: any[]) => any[];
}

function ComponentWithUsePlaceholderHook(props: IComponentWithUsePlaceholderHookProps) {
    const { onSetPlaceholders } = props;
    const [results, setPlaceholders] = usePlaceholders(props.placeholders);

    const onButtonClick = useCallback(() => {
        if (onSetPlaceholders) {
            setPlaceholders(onSetPlaceholders);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onSetPlaceholders]);

    return (
        <div>
            <SetPlaceholderValueButton onClick={onButtonClick} />
            <ComponentWithResult results={results} />;
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
    results: IMeasure<IMeasureDefinition>[];
}
function ComponentWithResult({ results }: IComponentWithResultProps) {
    return (
        <div>
            {results.map((res, i) => (
                <div key={i}>{res?.measure?.localIdentifier}</div>
            ))}
        </div>
    );
}

describe("usePlaceholders", () => {
    it("should resolve default placeholder values", () => {
        const measure = newMeasure("test-measure");
        const singleValuePlaceholder = newPlaceholder(measure);
        const multiValuePlaceholder = newPlaceholder([]);
        createComponent({
            placeholders: [singleValuePlaceholder, multiValuePlaceholder],
        });
        expect(screen.queryByText(measure.measure.localIdentifier)).toBeInTheDocument();
    });

    it("should update placeholder values", async () => {
        const measure = newMeasure("updated-measure");
        const measure2 = newMeasure("updated-measure2");
        const singleValuePlaceholder = newPlaceholder();
        const multiValuePlaceholder = newPlaceholder();

        createComponent({
            placeholders: [singleValuePlaceholder, multiValuePlaceholder],
            onSetPlaceholders: () => [measure, measure2],
        });

        fireEvent.click(screen.getByText("Placeholder"));
        await waitFor(() => {
            expect(screen.queryByText(measure.measure.localIdentifier)).toBeInTheDocument();
            expect(screen.queryByText(measure2.measure.localIdentifier)).toBeInTheDocument();
        });
    });
});
