import { createBuilder } from "../createbuilder";
import { convertFieldsJsonToDefs } from "../fields";
import { fields } from "./__fixtures__/fields-json";
import { assertExactType } from "./utils";

describe("convertFieldsJsonToDefs", () => {
  test("convert normal fields", () => {
    const defs = convertFieldsJsonToDefs(fields);
    assertExactType(defs.Text, "SINGLE_LINE_TEXT" as const);
    assertExactType(defs.Number, "NUMBER" as const);
  });
  test("convert builtin fields", () => {
    const defs = convertFieldsJsonToDefs(fields);
    assertExactType(defs.$id, "RECORD_NUMBER" as const);
  });
  test("convert subtables", () => {
    const defs = convertFieldsJsonToDefs(fields);
    assertExactType(defs.Table.$type, "SUBTABLE" as const);
    assertExactType(defs.Table.$fields.Text_0, "SINGLE_LINE_TEXT" as const);
    assertExactType(defs.Table.$fields.Number_1, "NUMBER" as const);
  });
  test("doesn't convert reference tables (TODO)", () => {
    const defs = convertFieldsJsonToDefs(fields);
    expect(
      // @ts-expect-error
      defs.ref,
    ).toBe(undefined);
  });
  test("createBuilder", () => {
    const { builder, field } = createBuilder(convertFieldsJsonToDefs(fields));
    const query = builder
      .where(field("Assignee").in("u1"))
      .and(field("Date").eq().TODAY())
      .orderBy("Number", "asc")
      .build();
    console.log(query);
  });
});
