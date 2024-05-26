
/**
 * Scores the affinity of `url1` to `url2`. Higher score means the urls are more similar.
 *
 * @param url1
 * @param url2
 * @returns
 */
export function calculateSimilarityScore(url1: string, url2: string): number {
  const parsedUrl1 = new URL(url1);
  const parsedUrl2 = new URL(url2);

  // Calculate score for same host and path
  if (
    parsedUrl1.host === parsedUrl2.host &&
    parsedUrl1.pathname === parsedUrl2.pathname
  ) {
    return 3;
  }

  // Calculate score for same host and partial path match
  if (
    parsedUrl1.host === parsedUrl2.host &&
    parsedUrl1.pathname.includes(parsedUrl2.pathname)
  ) {
    return 2;
  }

  // Calculate score for same host
  if (parsedUrl1.host === parsedUrl2.host) {
    return 1;
  }

  // Calculate score for everything else
  return 0;
}
