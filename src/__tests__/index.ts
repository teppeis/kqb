import { hello } from "..";

test("hello returns `hello!`", () => {
  expect(hello()).toBe("hello!");
});
