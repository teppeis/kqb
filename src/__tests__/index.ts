import { createBuilder, and, or } from "..";

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

  test("where(): nested conditions", () => {
    const { builder, field } = createBuilder();
    expect(
      builder
        .where(
          and(
            field("a1").eq("a2"),
            field("b1").like("b2"),
            or(field("c1").notEq("c2"), field("d1").notLike("d2"))
          )
        )
        .or(field("e1").eq("e2"))
        .build()
    ).toBe(`(a1 = "a2" and b1 like "b2" and (c1 != "c2" or d1 not like "d2")) or e1 = "e2"`);
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

  test("in()", () => {
    const { field } = createBuilder();
    expect(field("foo").in(`b"a"r`, "baz", "qux").toQuery()).toBe(
      `foo in ("b\\"a\\"r", "baz", "qux")`
    );
  });

  test("notIn()", () => {
    const { field } = createBuilder();
    expect(field("foo").notIn("bar", "baz", "qux").toQuery()).toBe(
      `foo not in ("bar", "baz", "qux")`
    );
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

describe("and()", () => {
  test("at least one condition", () => {
    // @ts-expect-error
    and();
  });

  test("one condition", () => {
    const { field } = createBuilder();
    expect(and(field("foo").eq("bar")).toQuery()).toBe(`(foo = "bar")`);
  });

  test("two conditions", () => {
    const { field } = createBuilder();
    expect(and(field("foo").eq("bar"), field("baz").like("qux")).toQuery()).toBe(
      `(foo = "bar" and baz like "qux")`
    );
  });
});

describe("or()", () => {
  test("at least one condition", () => {
    // @ts-expect-error
    or();
  });

  test("one condition", () => {
    const { field } = createBuilder();
    expect(or(field("foo").eq("bar")).toQuery()).toBe(`(foo = "bar")`);
  });

  test("two condition", () => {
    const { field } = createBuilder();
    expect(or(field("foo").eq("bar"), field("baz").like("qux")).toQuery()).toBe(
      `(foo = "bar" or baz like "qux")`
    );
  });
});
