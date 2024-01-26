// (C) 2021-2024 GoodData Corporation
import { IFiltersCustomizer } from "../customizer.js";
import { IDashboardCustomizationLogger } from "./customizationLogging.js";
import { DefaultAttributeFiltersCustomizer } from "./attributeFiltersCustomizer.js";
import { DefaultDateFiltersCustomizer } from "./dateFiltersCustomizer.js";
import { CustomizerMutationsContext } from "./types.js";

export class DefaultFiltersCustomizer implements IFiltersCustomizer {
    private readonly attributeFiltersCustomizer: DefaultAttributeFiltersCustomizer;
    private readonly dateFiltersCustomizer: DefaultDateFiltersCustomizer;

    constructor(
        private readonly logger: IDashboardCustomizationLogger,
        private readonly mutationContext: CustomizerMutationsContext,
    ) {
        this.attributeFiltersCustomizer = new DefaultAttributeFiltersCustomizer(
            this.logger,
            this.mutationContext,
        );
        this.dateFiltersCustomizer = new DefaultDateFiltersCustomizer(this.logger);
    }

    public attribute(): DefaultAttributeFiltersCustomizer {
        return this.attributeFiltersCustomizer;
    }

    public date(): DefaultDateFiltersCustomizer {
        return this.dateFiltersCustomizer;
    }

    public sealCustomizer = (): IFiltersCustomizer => {
        this.attributeFiltersCustomizer.sealCustomizer();
        this.dateFiltersCustomizer.sealCustomizer();

        return this;
    };
}
