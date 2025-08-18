"use strict";

/**
 * Utility class for handling string-related operations.
 */

class StringUtils {
  /**
   * Check if a string is empty or null
   * @param {string} string A string to check.
   * @return {boolean} Returns true if parameter string is empty or null.
   */
  static isEmptyString(string: string | null | undefined): boolean {
    return StringUtils.isNullishString(string) || string === "";
  }

  /**
   * Check if a string is null
   * @param {string} string A string to check.
   * @return {boolean} Returns true if parameter string is null.
   */
  static isNullishString(string: string | null | undefined): boolean {
    return string === null || string === undefined;
  }
}

export default StringUtils;
