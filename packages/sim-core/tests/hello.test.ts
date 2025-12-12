import { describe, expect, it } from "vitest";

describe("hello output", () => {
  it("prints Hello, world", () => {
    const msg = "Hello, world";
    console.log(msg);
    expect(msg).toBe("Hello, world");
  });
});
