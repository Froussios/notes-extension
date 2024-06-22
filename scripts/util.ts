export enum Relevance {
  NONE = 0,
  SAME_HOST = 1,
  SAME_PATH_PART = 2,
  SAME_PATH = 3
}

/**
 * Scores the affinity of `url1` to `url2`. Higher score means the urls are more similar.
 *
 * @param url1
 * @param url2
 * @returns
 */
export function calculateSimilarityScore(url1: string, url2: string): Relevance {
  const parsedUrl1 = new URL(url1);
  const parsedUrl2 = new URL(url2);

  // Calculate score for same host and path
  if (
    parsedUrl1.host === parsedUrl2.host &&
    parsedUrl1.pathname === parsedUrl2.pathname
  ) {
    return Relevance.SAME_PATH;
  }

  // Calculate score for same host and partial path match
  if (
    parsedUrl1.host === parsedUrl2.host &&
    parsedUrl1.pathname.includes(parsedUrl2.pathname)
  ) {
    return Relevance.SAME_PATH_PART;
  }

  // Calculate score for same host
  if (parsedUrl1.host === parsedUrl2.host) {
    return Relevance.SAME_HOST;
  }

  // Calculate score for everything else
  return Relevance.NONE;
}
