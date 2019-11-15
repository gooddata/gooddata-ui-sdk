// (C) 2019 GoodData Corporation

describe("promise", () => {
    it("can be awaited multiple times", async () => {
        const p = new Promise<string>(resolve => {
            resolve("haluz");
        });

        const r1 = await p;
        expect(r1).toEqual("haluz");

        const r2 = await p;
        expect(r2).toEqual("haluz");
    });
});
