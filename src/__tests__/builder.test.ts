import { and, createBuilder, or } from "..";
import { Builder } from "../builder";
import { condition, eq } from "./utils";

describe("Builder", () => {
  let builder: Builder<any>;
  beforeEach(() => {
    builder = new Builder();
  });
  test("empty build()", () => {
    expect(builder.build()).toBe("");
  });
  test("orderBy()", () => {
    expect(builder.orderBy("foo", "asc").build()).toBe("order by foo asc");
  });
  test("orderBy(): multiple calls", () => {
    expect(builder.orderBy("foo", "asc").orderBy("bar", "desc").build()).toBe(
      "order by foo asc, bar desc",
    );
  });
  test("orderBy(): multiple args", () => {
    expect(builder.orderBy(["foo", "asc"], ["bar", "desc"]).build()).toBe(
      "order by foo asc, bar desc",
    );
  });
  test("limit()", () => {
    expect(builder.limit(100).build()).toBe("limit 100");
  });
  test("offset()", () => {
    expect(builder.offset(100).build()).toBe("offset 100");
  });
  test("where()", () => {
    expect(builder.where(eq()).build()).toBe(`foo = "bar"`);
  });
  test("where().and()", () => {
    expect(builder.where(eq()).and(eq("baz", "qux")).build()).toBe(
      `foo = "bar" and baz = "qux"`,
    );
  });
  test("where().or()", () => {
    expect(builder.where(eq()).or(eq("baz", "qux")).build()).toBe(
      `foo = "bar" or baz = "qux"`,
    );
  });
  test("where(): nested conditions", () => {
    const { builder, field } = createBuilder();
    expect(
      builder
        .where(
          and(
            condition("a1", "=", "a2"),
            condition("b1", "like", "b2"),
            or(condition("c1", "!=", "c2"), condition("d1", "not like", "d2")),
          ),
        )
        .or(field("e1").eq("e2"))
        .build(),
    ).toBe(
      `(a1 = "a2" and b1 like "b2" and (c1 != "c2" or d1 not like "d2")) or e1 = "e2"`,
    );
  });
});

describe("Builder with field definitions", () => {
  const defs = {
    name: "SINGLE_LINE_TEXT",
    age: "NUMBER",
    message: "MULTI_LINE_TEXT",
    subtable1: {
      $type: "SUBTABLE",
      $fields: {
        created: "DATETIME",
      },
    },
    reftable1: {
      $type: "REFERENCE_TABLE",
      $fields: {
        count: "NUMBER",
      },
    },
  } as const;

  test("orderBy(): sortable fields", () => {
    const { builder } = createBuilder(defs);
    expect(builder.orderBy("name", "asc").build()).toBe("order by name asc");
  });
  test("orderBy(): not sortable filds", () => {
    const { builder } = createBuilder(defs);
    // @ts-expect-error
    builder.orderBy("message", "asc");
  });
  test("orderBy(): fields in subtables are not sortable", () => {
    const { builder } = createBuilder(defs);
    // @ts-expect-error
    builder.orderBy("created", "asc");
  });
  test("orderBy(): fields in reference tables are not sortable", () => {
    const { builder } = createBuilder(defs);
    // @ts-expect-error
    builder.orderBy("reftable1.count", "asc");
  });
  test("orderBy(): builtin $id field", () => {
    const { builder } = createBuilder(defs);
    expect(builder.orderBy("$id", "asc").build()).toBe("order by $id asc");
  });
});
