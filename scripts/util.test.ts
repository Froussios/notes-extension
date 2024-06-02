import { calculateSimilarityScore } from "./util";

describe("Util compares", function () {
  it('Same urls', () => {
    expect(calculateSimilarityScore("http://www.examples.com/path", "http://www.examples.com/path")).toBe(3);
  });

  it('Same urls, different query', () => {
    expect(calculateSimilarityScore("http://www.examples.com/path?q=q", "http://www.examples.com/path")).toBe(3);
  });

  it('Same host, path is deeper', () => {
    expect(calculateSimilarityScore("http://www.examples.com/path/deeper", "http://www.examples.com/path")).toBe(2);
  });

  it('Same host, path is higher', () => {
    expect(calculateSimilarityScore("http://www.examples.com/path", "http://www.examples.com/path/deeper")).toBe(1);
  });

  it('Same host, different path', () => {
    expect(calculateSimilarityScore("http://www.examples.com/path/one", "http://www.examples.com/two")).toBe(1);
  });

  it('Different host', () => {
    expect(calculateSimilarityScore("http://www.examples.com/path/one", "http://www.google.com/path/one")).toBe(0);
  });
});

