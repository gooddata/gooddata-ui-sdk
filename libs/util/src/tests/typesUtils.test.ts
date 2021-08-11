// (C) 2021 GoodData Corporation

import { combineGuards } from "../typesUtils";

type Bird = { fly: () => "fly" };
type Insect = { annoy: () => "annoy" };
type Dog = { beTheBest: () => "dogdogdog" };

type Animal = Bird | Insect | Dog;

const isBird = (animal: Animal): animal is Bird => {
    if ("fly" in animal) return true;
    return false;
};

const isInsect = (animal: Animal): animal is Insect => {
    if ("annoy" in animal) return true;
    return false;
};

const isDog = (animal: Animal): animal is Dog => {
    if ("beTheBest" in animal) return true;
    return false;
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
