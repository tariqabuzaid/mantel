const { describe, it, expect } = require("@jest/globals");
const { getTopEntries } = require("../utils");

describe("getTopEntries", () => {
	it("returns top N entries sorted by value", () => {
		const input = { a: 5, b: 3, c: 8, d: 6 };
		const result = getTopEntries(input, 3);
		expect(result).toEqual([
			{ key: "c", count: 8 },
			{ key: "d", count: 6 },
			{ key: "a", count: 5 },
		]);
	});

	it("includes tied values even if it exceeds topN", () => {
		const input = { a: 5, b: 6, c: 6, d: 3 };
		const result = getTopEntries(input, 1);
		expect(result).toEqual([
			{ key: "b", count: 6 },
			{ key: "c", count: 6 },
		]);
	});

	it("returns all entries if all have same count", () => {
		const input = { a: 2, b: 2, c: 2, d: 2 };
		const result = getTopEntries(input, 2);
		expect(result).toEqual([
			{ key: "a", count: 2 },
			{ key: "b", count: 2 },
			{ key: "c", count: 2 },
			{ key: "d", count: 2 },
		]);
	});

	it("returns empty array if input is empty", () => {
		const input = {};
		const result = getTopEntries(input, 3);
		expect(result).toEqual([]);
	});
});
