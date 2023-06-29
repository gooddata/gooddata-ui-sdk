// (C) 2007-2020 GoodData Corporation
import { invariant } from "ts-invariant";
import find from "lodash/find.js";
import every from "lodash/every.js";

export type RulePredicate = (measureDefinition: any, mdObj: any) => boolean;

export type RuleCallback = (measure: any, mdObj: any, measureIndex: number, attributesMap: any) => any;

export class Rules {
    private rules: any[];

    constructor() {
        this.rules = [];
    }

    public addRule(tests: RulePredicate[], callback: RuleCallback): void {
        this.rules.push([tests, callback]);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public match(subject: any, params: any): any {
        const [, callback] = find(this.rules, ([tests]) => every(tests, (test) => test(subject, params)));

        invariant(callback, "No suitable rule to handle the parameters found.");

        return callback;
    }
}
