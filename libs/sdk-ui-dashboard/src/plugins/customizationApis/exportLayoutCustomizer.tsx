// (C) 2025 GoodData Corporation
import { IDashboardLayout, IDashboardLayoutSection } from "@gooddata/sdk-model";

import { IExportLayoutCustomizer, SectionSlidesTransformer } from "../customizer.js";
import {
    breakupSlideTransformer,
    containerSlideTransformer,
    itemsSlideTransformer,
    switcherSlideTransformer,
    widgetSlideTransformer,
    sectionItemsLayoutSection,
    sectionLayoutSection,
    containerSwitcherSlideTransformer,
    containsVisualizationSwitcher,
} from "../../_staging/slideshow/index.js";

import { IDashboardCustomizationLogger } from "./customizationLogging.js";
import { CustomizerMutationsContext } from "./types.js";

export class ExportLayoutCustomizer<TWidget> implements IExportLayoutCustomizer<TWidget> {
    private transformers: SectionSlidesTransformer<TWidget>[] = [];

    constructor(
        private readonly logger: IDashboardCustomizationLogger,
        private readonly mutationContext: CustomizerMutationsContext,
    ) {}

    public addTransformer(fn: SectionSlidesTransformer<TWidget>): ExportLayoutCustomizer<TWidget> {
        this.transformers.push(fn);
        return this;
    }

    public applyTransformations(layout: IDashboardLayout<TWidget>): IDashboardLayout<TWidget> {
        const transformers = this.transformers;
        const { exports } = this.mutationContext;

        const sections =
            layout?.sections.reduce((acc, section) => {
                const created = transformers.reduce((subAcc, transformer) => {
                    const res = transformer(section, {
                        defaultSection: sectionLayoutSection,
                        defaultItems: sectionItemsLayoutSection,
                        breakUpSlide: breakupSlideTransformer,
                        widgetSlide: widgetSlideTransformer,
                        switcherSlide: switcherSlideTransformer,
                        containerSlide: containerSlideTransformer,
                        containerSwitcherSlide: containerSwitcherSlideTransformer,
                        itemsSlide: itemsSlideTransformer,
                        containsVisualisationSwitcher: containsVisualizationSwitcher,
                    });
                    return [...subAcc, ...(res ? res : [])];
                }, [] as IDashboardLayoutSection<TWidget>[]);

                return [...acc, ...created];
            }, [] as IDashboardLayoutSection<TWidget>[]) ?? [];

        if (sections.length === 0) {
            this.logger.warn(
                "Layout has no sections after applying transformations. The layout will be empty.",
            );
        }
        if (transformers.length > 0) {
            exports.push("transformed");
        }

        return {
            ...layout,
            type: "IDashboardLayout",
            sections,
        };
    }
}
