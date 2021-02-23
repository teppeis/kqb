import * as functions from "../functions";

describe("functions", () => {
  test("LOGINUSER()", () => {
    expect(functions.LOGINUSER().toString()).toBe("LOGINUSER()");
  });
  test("PRIMARY_ORGANIZATION()", () => {
    expect(functions.PRIMARY_ORGANIZATION().toString()).toBe("PRIMARY_ORGANIZATION()");
  });
  test("NOW()", () => {
    expect(functions.NOW().toString()).toBe("NOW()");
  });
  test("TODAY()", () => {
    expect(functions.TODAY().toString()).toBe("TODAY()");
  });
  test("YESTERDAY()", () => {
    expect(functions.YESTERDAY().toString()).toBe("YESTERDAY()");
  });
  test("TOMORROW()", () => {
    expect(functions.TOMORROW().toString()).toBe("TOMORROW()");
  });
  test("FROM_TODAY(1, DAYS)", () => {
    expect(functions.FROM_TODAY(1, "DAYS").toString()).toBe("FROM_TODAY(1, DAYS)");
  });
  test("FROM_TODAY(1, MONTHS)", () => {
    expect(functions.FROM_TODAY(1, "MONTHS").toString()).toBe("FROM_TODAY(1, MONTHS)");
  });
  test("THIS_WEEK()", () => {
    expect(functions.THIS_WEEK().toString()).toBe("THIS_WEEK()");
  });
  test("THIS_WEEK(FRIDAY)", () => {
    expect(functions.THIS_WEEK("FRIDAY").toString()).toBe("THIS_WEEK(FRIDAY)");
  });
  test("LAST_WEEK()", () => {
    expect(functions.LAST_WEEK().toString()).toBe("LAST_WEEK()");
  });
  test("NEXT_WEEK()", () => {
    expect(functions.NEXT_WEEK().toString()).toBe("NEXT_WEEK()");
  });

  test("THIS_MONTH()", () => {
    expect(functions.THIS_MONTH().toString()).toBe("THIS_MONTH()");
  });
  test("THIS_MONTH(1)", () => {
    expect(functions.THIS_MONTH(1).toString()).toBe("THIS_MONTH(1)");
  });
  test("THIS_MONTH(LAST)", () => {
    expect(functions.THIS_MONTH("LAST").toString()).toBe("THIS_MONTH(LAST)");
  });
  test("LAST_MONTH()", () => {
    expect(functions.LAST_MONTH().toString()).toBe("LAST_MONTH()");
  });
  test("NEXT_MONTH()", () => {
    expect(functions.NEXT_MONTH().toString()).toBe("NEXT_MONTH()");
  });
  test("THIS_YEAR()", () => {
    expect(functions.THIS_YEAR().toString()).toBe("THIS_YEAR()");
  });
  test("LAST_YEAR()", () => {
    expect(functions.LAST_YEAR().toString()).toBe("LAST_YEAR()");
  });
  test("NEXT_YEAR()", () => {
    expect(functions.NEXT_YEAR().toString()).toBe("NEXT_YEAR()");
  });
});
