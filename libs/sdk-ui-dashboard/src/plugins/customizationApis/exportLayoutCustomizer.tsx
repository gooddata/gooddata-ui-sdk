// (C) 2025-2026 GoodData Corporation

import { type IDashboardLayout, type IDashboardLayoutSection } from "@gooddata/sdk-model";

import { type IDashboardCustomizationLogger } from "./customizationLogging.js";
import { type CustomizerMutationsContext } from "./types.js";
import { breakupSlideTransformer } from "../../_staging/slideshow/breakupSlideTransformer.js";
import { containerSlideTransformer } from "../../_staging/slideshow/containerSlideTransformer.js";
import { containerSwitcherSlideTransformer } from "../../_staging/slideshow/containerSwitcherSlideTransformer.js";
import { itemsSlideTransformer } from "../../_staging/slideshow/itemsSlideTransformer.js";
import {
    sectionItemsLayoutSection,
    sectionLayoutSection,
} from "../../_staging/slideshow/sectionSlideTransformer.js";
import { switcherSlideTransformer } from "../../_staging/slideshow/switcherSlideTransformer.js";
import { containsVisualizationSwitcher } from "../../_staging/slideshow/utils/index.js";
import { widgetSlideTransformer } from "../../_staging/slideshow/widgetSlideTransformer.js";
import { type IExportLayoutCustomizer, type SectionSlidesTransformer } from "../customizer.js";

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
                    return [...subAcc, ...(res || [])];
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
