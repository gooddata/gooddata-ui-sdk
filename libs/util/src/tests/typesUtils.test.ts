// (C) 2021-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { combineGuards } from "../typesUtils.js";

type Bird = { fly: () => "fly" };
type Insect = { annoy: () => "annoy" };
type Dog = { beTheBest: () => "dogdogdog" };

type Animal = Bird | Insect | Dog;

const isBird = (animal: unknown): animal is Bird => {
    return "fly" in (animal as Animal);
};

const isInsect = (animal: unknown): animal is Insect => {
    return "annoy" in (animal as Animal);
};

const isDog = (animal: unknown): animal is Dog => {
    return "beTheBest" in (animal as Animal);
};

const dog: Dog = {
    beTheBest: () => "dogdogdog",
};

const fly: Insect = {
    annoy: () => "annoy",
};

const parrot: Bird = {
    fly: () => "fly",
};

const hasWings = combineGuards(isBird, isInsect);
const isAnimal = combineGuards(isBird, isInsect, isDog);

describe("combineGuards", () => {
    it("should correct combine two guards and return false for not matching object", () => {
        expect(hasWings(dog)).toEqual(false);
    });

    it("should correct combine two guards and return true for matching object", () => {
        expect(hasWings(fly)).toEqual(true);
    });

    it("should correct combine two guards and false true for null", () => {
        expect(hasWings(null)).toEqual(false);
    });

    it("should correct combine two guards and false true for undefined", () => {
        expect(hasWings(undefined)).toEqual(false);
    });

    it("should correct combine three guards and return false for not matching object", () => {
        expect(isAnimal({ some: () => "unknown" })).toEqual(false);
    });

    it("should correct combine three guards and return true for matching object", () => {
        expect(isAnimal(fly)).toEqual(true);
    });

    it("should correct filter array and return just animals with wings", () => {
        const array = [dog, parrot, fly, {}, undefined, null];
        const result = array.filter(hasWings);

        expect(result.length).toEqual(2);
    });
});
