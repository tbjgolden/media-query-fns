import { hello } from ".";

test("hello says hello", () => {
  expect(hello("world")).toBe(`Hello world!`);
});
