"use strict";

/**
 * Utility class for handling time-related operations.
 */

class TimeUtils {
  /**
   * Map of weekdays abbreviations to their corresponding numeric values.
   * Example: { 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6, 'SUN': 7 }
   */
  static weekdaysMap = {
    MON: 1,
    TUE: 2,
    WED: 3,
    THU: 4,
    FRI: 5,
    SAT: 6,
    SUN: 7,
  };

  /**
   * The current timestamp in milliseconds since the Unix epoch.
   */
  static now = Date.now();

  /**
   * The current date object representing the current timestamp.
   */
  static currentDate = new Date(TimeUtils.now);

  /**
   * The numeric value (1-7) representing the current day of the week.
   * (1 for Monday, 2 for Tuesday, ..., 7 for Sunday)
   */
  static today = new Date(TimeUtils.now).getDay();
}

export default TimeUtils;
