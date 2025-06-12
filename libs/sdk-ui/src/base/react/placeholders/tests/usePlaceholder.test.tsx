// (C) 2019-2022 GoodData Corporation
import React, { useCallback } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { IMeasure, IMeasureDefinition, newMeasure } from "@gooddata/sdk-model";
import { describe, it, expect } from "vitest";

import { PlaceholdersProvider, IPlaceholdersProviderProps } from "../context.js";
import { newPlaceholder } from "../factory.js";
import { IPlaceholder } from "../base.js";
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

const ComponentWithUsePlaceholderHook = (props: IComponentWithUsePlaceholderHookProps) => {
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
};

interface ISetPlaceholderValueButtonProps {
    onClick?: () => void;
}

const SetPlaceholderValueButton = ({ onClick }: ISetPlaceholderValueButtonProps) => {
    return <button onClick={onClick}>Placeholder</button>;
};

interface IComponentWithResultProps {
    result: IMeasure<IMeasureDefinition>;
}
const ComponentWithResult = ({ result }: IComponentWithResultProps) => {
    return (
        <div>
            <pre>{result?.measure?.localIdentifier}</pre>
        </div>
    );
};

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
