import { and, InCondition, or, SingleCondition } from "../conditions";
import { TODAY } from "../functions";
import { eq } from "./utils";

describe("SingleCondition", () => {
  test("toQuery() with `=` operator", () => {
    const cond = new SingleCondition("foo", "=", "bar");
    expect(cond.toQuery()).toBe(`foo = "bar"`);
  });
  test("toQuery() with `!=` operator", () => {
    const cond = new SingleCondition("foo", "!=", "bar");
    expect(cond.toQuery()).toBe(`foo != "bar"`);
  });
  test("toQuery() surrounds a value with double quotes", () => {
    const cond = new SingleCondition("foo", "=", 100);
    expect(cond.toQuery()).toBe(`foo = "100"`);
  });
  test("toQuery() escapes double quotes", () => {
    const cond = new SingleCondition("foo", "=", `b"a"r`);
    expect(cond.toQuery()).toBe(`foo = "b\\"a\\"r"`);
  });
  test("toQuery() doesn't surrounds a query function with double quotes", () => {
    const cond = new SingleCondition("foo", "=", TODAY());
    expect(cond.toQuery()).toBe(`foo = TODAY()`);
  });
});

describe("InCondition", () => {
  test("toQuery() with `in` operator", () => {
    const cond = new InCondition("foo", "in", ["bar"]);
    expect(cond.toQuery()).toBe(`foo in ("bar")`);
  });
  test("toQuery() with `not in` operator", () => {
    const cond = new InCondition("foo", "not in", ["bar"]);
    expect(cond.toQuery()).toBe(`foo not in ("bar")`);
  });
  test("toQuery() with two values", () => {
    const cond = new InCondition("foo", "in", ["bar", "baz"]);
    expect(cond.toQuery()).toBe(`foo in ("bar", "baz")`);
  });
  test("throws for no values", () => {
    expect(() => new InCondition("foo", "in", [])).toThrow();
  });
  test("toQuery() surrounds a value with double quotes", () => {
    const cond = new InCondition("foo", "in", [100]);
    expect(cond.toQuery()).toBe(`foo in ("100")`);
  });
  test("toQuery() escapes double quotes", () => {
    const cond = new InCondition("foo", "in", [`b"a"r`]);
    expect(cond.toQuery()).toBe(`foo in ("b\\"a\\"r")`);
  });
  test("toQuery() doesn't surrounds a query function with double quotes", () => {
    const cond = new InCondition("foo", "in", [TODAY()]);
    expect(cond.toQuery()).toBe(`foo in (TODAY())`);
  });
});

describe("and()", () => {
  test("at least one condition", () => {
    // @ts-expect-error
    and();
  });
  test("one condition", () => {
    expect(and(eq()).toQuery()).toBe(`(foo = "bar")`);
  });
  test("two conditions", () => {
    expect(and(eq("foo", "bar"), eq("baz", "qux")).toQuery()).toBe(`(foo = "bar" and baz = "qux")`);
  });
});

describe("or()", () => {
  test("at least one condition", () => {
    // @ts-expect-error
    or();
  });
  test("one condition", () => {
    expect(or(eq("foo", "bar")).toQuery()).toBe(`(foo = "bar")`);
  });
  test("two condition", () => {
    expect(or(eq("foo", "bar"), eq("baz", "qux")).toQuery()).toBe(`(foo = "bar" or baz = "qux")`);
  });
});
