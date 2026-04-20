// (C) 2021-2026 GoodData Corporation

import { type IFiltersCustomizer } from "../customizer.js";
import { DefaultAttributeFiltersCustomizer } from "./attributeFiltersCustomizer.js";
import { type IDashboardCustomizationLogger } from "./customizationLogging.js";
import { DefaultDateFiltersCustomizer } from "./dateFiltersCustomizer.js";
import { DefaultFilterGroupsCustomizer } from "./filterGroupsCustomizer.js";
import { type CustomizerMutationsContext } from "./types.js";

export class DefaultFiltersCustomizer implements IFiltersCustomizer {
    private readonly attributeFiltersCustomizer: DefaultAttributeFiltersCustomizer;
    private readonly dateFiltersCustomizer: DefaultDateFiltersCustomizer;
    private readonly filterGroupCustomizer: DefaultFilterGroupsCustomizer;

    constructor(
        private readonly logger: IDashboardCustomizationLogger,
        private readonly mutationContext: CustomizerMutationsContext,
    ) {
        this.attributeFiltersCustomizer = new DefaultAttributeFiltersCustomizer(
            this.logger,
            this.mutationContext,
        );
        this.dateFiltersCustomizer = new DefaultDateFiltersCustomizer(this.logger);
        this.filterGroupCustomizer = new DefaultFilterGroupsCustomizer(this.logger);
    }

    public attribute(): DefaultAttributeFiltersCustomizer {
        return this.attributeFiltersCustomizer;
    }

    public date(): DefaultDateFiltersCustomizer {
        return this.dateFiltersCustomizer;
    }

    public filterGroup(): DefaultFilterGroupsCustomizer {
        return this.filterGroupCustomizer;
    }

    public sealCustomizer = (): IFiltersCustomizer => {
        this.attributeFiltersCustomizer.sealCustomizer();
        this.dateFiltersCustomizer.sealCustomizer();
        this.filterGroupCustomizer.sealCustomizer();

        return this;
    };
}
