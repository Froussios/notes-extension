import { calculateSimilarityScore } from "./util";

test('Same urls', () => {
  expect(calculateSimilarityScore("http://www.examples.com/path", "http://www.examples.com/path")).toBe(3);
});

test('Same urls, different query', () => {
  expect(calculateSimilarityScore("http://www.examples.com/path?q=q", "http://www.examples.com/path")).toBe(3);
});

test('Same host, path is deeper', () => {
  expect(calculateSimilarityScore("http://www.examples.com/path/deeper", "http://www.examples.com/path")).toBe(2);
});

test('Same host, path is higher', () => {
  expect(calculateSimilarityScore("http://www.examples.com/path", "http://www.examples.com/path/deeper")).toBe(1);
});

test('Same host, different path', () => {
  expect(calculateSimilarityScore("http://www.examples.com/path/one", "http://www.examples.com/two")).toBe(1);
});

test('Different host', () => {
  expect(calculateSimilarityScore("http://www.examples.com/path/one", "http://www.google.com/path/one")).toBe(0);
});