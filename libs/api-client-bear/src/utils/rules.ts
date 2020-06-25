// (C) 2007-2020 GoodData Corporation
import invariant from "ts-invariant";
import find from "lodash/find";
import every from "lodash/every";

export type RulePredicate = (measureDefinition: any, mdObj: any) => boolean;

export type RuleCallback = (measure: any, mdObj: any, measureIndex: number, attributesMap: any) => any;

export class Rules {
    private rules: any[];

    constructor() {
        this.rules = [];
    }

    public addRule(tests: RulePredicate[], callback: RuleCallback) {
        this.rules.push([tests, callback]);
    }

    public match(subject: any, params: any) {
        const [, callback] = find(this.rules, ([tests]) => every(tests, (test) => test(subject, params)));

        invariant(callback, "No suitable rule to handle the parameters found.");

        return callback;
    }
}
