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
