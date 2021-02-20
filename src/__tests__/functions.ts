import * as f from "../functions";

describe("functions", () => {
  test("FROM_TODAY(1, DAYS)", () => {
    expect(f.FROM_TODAY(1, "DAYS").toString()).toBe("FROM_TODAY(1, DAYS)");
  });
  test("THIS_WEEK()", () => {
    expect(f.THIS_WEEK().toString()).toBe("THIS_WEEK()");
  });
  test("THIS_WEEK(FRIDAY)", () => {
    expect(f.THIS_WEEK("FRIDAY").toString()).toBe("THIS_WEEK(FRIDAY)");
  });
  test("THIS_MONTH(1)", () => {
    expect(f.THIS_MONTH(1).toString()).toBe("THIS_MONTH(1)");
  });

  test("THIS_MONTH()", () => {
    expect(f.THIS_MONTH().toString()).toBe("THIS_MONTH()");
  });
  test("THIS_MONTH(1)", () => {
    expect(f.THIS_MONTH(1).toString()).toBe("THIS_MONTH(1)");
  });
  test("THIS_MONTH(LAST)", () => {
    expect(f.THIS_MONTH("LAST").toString()).toBe("THIS_MONTH(LAST)");
  });
});
