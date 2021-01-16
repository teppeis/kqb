import { createBuilder } from "..";

describe("Builder", () => {
  test("empty build()", () => {
    const { builder } = createBuilder();
    expect(builder.build()).toBe("");
  });

  test("orderBy()", () => {
    const { builder } = createBuilder();
    expect(builder.orderBy("foo", "asc").build()).toBe("order by foo asc");
  });

  test("orderBy(): multiple", () => {
    const { builder } = createBuilder();
    expect(builder.orderBy("foo", "asc").orderBy("bar", "desc").build()).toBe(
      "order by foo asc, bar desc"
    );
  });

  test("limit()", () => {
    const { builder } = createBuilder();
    expect(builder.limit(100).build()).toBe("limit 100");
  });

  test("offset()", () => {
    const { builder } = createBuilder();
    expect(builder.offset(100).build()).toBe("offset 100");
  });

  test("where()", () => {
    const { builder, field } = createBuilder();
    expect(builder.where(field("foo").eq("bar")).build()).toBe(`foo = "bar"`);
  });

  test("where().and()", () => {
    const { builder, field } = createBuilder();
    expect(builder.where(field("foo").eq("bar")).and(field("baz").eq("qux")).build()).toBe(
      `foo = "bar" and baz = "qux"`
    );
  });

  test("where().or()", () => {
    const { builder, field } = createBuilder();
    expect(builder.where(field("foo").eq("bar")).or(field("baz").eq("qux")).build()).toBe(
      `foo = "bar" or baz = "qux"`
    );
  });
});

describe("Condition", () => {
  test("eq()", () => {
    const { field } = createBuilder();
    expect(field("foo").eq("bar").toQuery()).toBe(`foo = "bar"`);
  });

  test("eq(): escape double quotes", () => {
    const { field } = createBuilder();
    expect(field("foo").eq(`b"a"r`).toQuery()).toBe(`foo = "b\\"a\\"r"`);
  });

  test("notEq()", () => {
    const { field } = createBuilder();
    expect(field("foo").notEq("bar").toQuery()).toBe(`foo != "bar"`);
  });

  test("like()", () => {
    const { field } = createBuilder();
    expect(field("foo").like("bar").toQuery()).toBe(`foo like "bar"`);
  });

  test("notLike()", () => {
    const { field } = createBuilder();
    expect(field("foo").notLike("bar").toQuery()).toBe(`foo not like "bar"`);
  });
});

describe("Condition with field definitions", () => {
  type Defs = {
    name: "SINGLE_LINE_TEXT";
    age: "NUMBER";
  };

  describe("SINGLE_LINE_TEXT", () => {
    test("eq()", () => {
      const { field } = createBuilder<Defs>();
      expect(field("name").eq("foo").toQuery()).toBe(`name = "foo"`);
    });

    test("eq(): cannnot accepts a number value", () => {
      const { field } = createBuilder<Defs>();
      // @ts-expect-error
      field("name").eq(10);
    });

    test("like()", () => {
      const { field } = createBuilder<Defs>();
      expect(field("name").like("foo").toQuery()).toBe(`name like "foo"`);
    });
  });

  describe("NUMBER", () => {
    test("eq() accepts a number value", () => {
      const { field } = createBuilder<Defs>();
      expect(field("age").eq("10").toQuery()).toBe(`age = "10"`);
    });

    test("eq() accepts a number value", () => {
      const { field } = createBuilder<Defs>();
      expect(field("age").eq(10).toQuery()).toBe(`age = "10"`);
    });

    test("doesn't have like() or notLike()", () => {
      const { field } = createBuilder<Defs>();
      // @ts-expect-error
      field("age").like("foo");
      // @ts-expect-error
      field("age").notLike("foo");
    });
  });
});
