/**
 * Utility class for working with the current URL.
 */

'use strict';

class UrlUtil {
  /**
   * Returns the protocol of the current URL, such as `http:` or `https:`.
   */
  static getProtocol(): string {
    return globalThis.location.protocol;
  }

  /**
   * Returns the hostname of the current URL, such as `www.example.com`.
   */
  static getHostName(): string {
    return globalThis.location.hostname;
  }

  /**
   * Returns the query parameters from the current URL as a `URLSearchParams`
   * object. For example, `https://www.example.com/?q=searchString` returns
   * `?q=searchString`.
   */
  static getUrlParams(): URLSearchParams {
    return new URLSearchParams(globalThis.location.search);
  }

  /**
   * Returns the fragment identifier from the current URL without the leading
   * `#`. For example, `https://www.example.com/#anchor` returns `anchor`.
   */
  static getAnchor(): string {
    return globalThis.location.hash.substring(1);
  }
}

export default UrlUtil;
