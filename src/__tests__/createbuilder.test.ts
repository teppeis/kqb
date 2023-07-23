import { Builder } from "../builder";
import { createBuilder } from "../createbuilder";
import { assertExactType } from "./utils";

describe("createBuilder", () => {
  describe("without field definition argument", () => {
    test("the type of returned builder is Builder<any>", () => {
      const { builder } = createBuilder();
      assertExactType<typeof builder, Builder<any>>(builder);
      expect(builder).toBeInstanceOf(Builder);
    });
    test("returned field() returns AnyOperator", () => {
      const { field } = createBuilder();
      const operator = field("foo");
      const value = "bar";
      // all operators
      expect(operator.eq(value).toQuery()).toBe('foo = "bar"');
      expect(operator.gt(value).toQuery()).toBe('foo > "bar"');
      expect(operator.in(value).toQuery()).toBe('foo in ("bar")');
      expect(operator.like(value).toQuery()).toBe('foo like "bar"');
      // not any
      expect(() =>
        operator
          // @ts-expect-error
          .not_existing_operator(value),
      ).toThrow();
    });
    test("returned builder and field work", () => {
      const { builder, field } = createBuilder();
      expect(
        builder
          .where(field("foo").eq("bar"))
          .orderBy("baz", "asc")
          .limit(100)
          .offset(200)
          .build(),
      ).toBe('foo = "bar" order by baz asc limit 100 offset 200');
    });
  });

  describe("with field definition argument", () => {
    const defs = {
      date: "DATE",
      sub: {
        $type: "SUBTABLE",
        $fields: {
          date_sub: "DATE",
        },
      },
      ref: {
        $type: "REFERENCE_TABLE",
        $fields: {
          date_ref: "DATE",
        },
      },
    } as const;

    test("the type of returned builder is correct", () => {
      const { builder } = createBuilder(defs);
      type EXPECTED_TYPE = typeof defs & { readonly $id: "RECORD_NUMBER" };
      assertExactType<typeof builder, Builder<EXPECTED_TYPE>>(builder);
      expect(builder).toBeInstanceOf(Builder);
    });
    test("top-level DATE field returns DateOperator", () => {
      const { field } = createBuilder(defs);
      const operator = field("date");
      const d = "2021-01-01";
      expect(operator.eq(d).toQuery()).toBe('date = "2021-01-01"');
      expect(operator.gt(d).toQuery()).toBe('date > "2021-01-01"');
      expect(() =>
        operator
          // @ts-expect-error
          .in(d),
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .like(d),
      ).toThrow();
    });
    test("DATE field in a subtable returns DateOperatorForTable", () => {
      const { field } = createBuilder(defs);
      const operator = field("date_sub");
      const d = "2021-01-01";
      expect(operator.in(d).toQuery()).toBe('date_sub in ("2021-01-01")');
      expect(operator.gt(d).toQuery()).toBe('date_sub > "2021-01-01"');
      expect(() =>
        operator
          // @ts-expect-error
          .eq(d),
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .like(d),
      ).toThrow();
    });
    test("DATE field in a reference table returns DateOperatorForTable", () => {
      const { field } = createBuilder(defs);
      const operator = field("ref.date_ref");
      const d = "2021-01-01";
      expect(operator.in(d).toQuery()).toBe('ref.date_ref in ("2021-01-01")');
      expect(operator.gt(d).toQuery()).toBe('ref.date_ref > "2021-01-01"');
      expect(() =>
        operator
          // @ts-expect-error
          .eq(d),
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .like(d),
      ).toThrow();
    });
  });
});
