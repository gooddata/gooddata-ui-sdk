// (C) 2023-2025 GoodData Corporation
import React, { useCallback, useEffect, useRef } from "react";

import { defaultImport } from "default-import";
import ReactMeasure, { MeasuredComponentProps } from "react-measure";

import { HeadlineElementType } from "@gooddata/sdk-ui";

import { BaseHeadlineContext } from "./BaseHeadlineContext.js";
import { CompareSection } from "./CompareSection.js";
import { PrimarySection } from "./PrimarySection.js";
import { IChartConfig } from "../../../../../interfaces/index.js";
import { IBaseHeadlineData } from "../../interfaces/BaseHeadlines.js";
import { HeadlineFiredDrillEvent } from "../../interfaces/DrillEvents.js";
import { IHeadlineDataItem } from "../../interfaces/Headlines.js";

const RESIZE_GUARD_TIMEOUT = 3000;
const Measure = defaultImport(ReactMeasure);

interface IHeadlineProps {
    data: IBaseHeadlineData;
    config?: IChartConfig;
    onDrill?: HeadlineFiredDrillEvent;
    onAfterRender?: () => void;
}

export const BaseHeadline: React.FC<IHeadlineProps> = ({ data, config, onDrill, onAfterRender }) => {
    const { primaryItem, secondaryItem, tertiaryItem } = data;

    const afterRenderCalled = useRef(false);

    const fireDrillEvent = useCallback(
        (item: IHeadlineDataItem, elementType: HeadlineElementType, elementTarget: EventTarget) => {
            if (onDrill) {
                const itemContext = {
                    localIdentifier: item.localIdentifier,
                    value: item.value,
                    element: elementType,
                };

                onDrill(itemContext, elementTarget);
            }
        },
        [onDrill],
    );

    useEffect(() => {
        // guard if onResize would fail to resize the widget
        const timeoutId = setTimeout(() => {
            if (!afterRenderCalled.current) {
                onAfterRender?.();
                afterRenderCalled.current = true;
            }
        }, RESIZE_GUARD_TIMEOUT);

        return () => clearTimeout(timeoutId);
    }, [onAfterRender]);

    return (
        <Measure
            client={true}
            onResize={(dimensions) => {
                // onResize is called also initially when dimensions
                // are not yet fully materialized, defer afterRender
                if (
                    dimensions?.client?.width > 0 &&
                    dimensions?.client?.height > 0 &&
                    !afterRenderCalled.current
                ) {
                    afterRenderCalled.current = true;
                    onAfterRender();
                }
            }}
        >
            {({ measureRef, contentRect }: MeasuredComponentProps) => {
                return (
                    <BaseHeadlineContext.Provider
                        value={{
                            clientWidth: contentRect.client?.width,
                            clientHeight: contentRect.client?.height,
                            config,
                            fireDrillEvent,
                        }}
                    >
                        <div className="headline" ref={measureRef}>
                            <PrimarySection primaryItem={primaryItem} isOnlyPrimaryItem={!secondaryItem} />
                            {secondaryItem ? (
                                <CompareSection secondaryItem={secondaryItem} tertiaryItem={tertiaryItem} />
                            ) : null}
                        </div>
                    </BaseHeadlineContext.Provider>
                );
            }}
        </Measure>
    );
};
