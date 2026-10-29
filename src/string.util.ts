type NullableString = string | null;

function stringValue(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

function isWhitespace(value: string): boolean {
  return /^\s$/u.test(value);
}

function isBlankValue(value: string | null | undefined): boolean {
  return value === null || value === undefined || Array.from(value).every(isWhitespace);
}

function stripStartValue(value: string, stripChars: string | null | undefined): string {
  let index = 0;
  while (
    index < value.length &&
    (stripChars === null || stripChars === undefined ? isWhitespace(value[index]) : stripChars.includes(value[index]))
  ) {
    index += 1;
  }
  return value.slice(index);
}

function stripEndValue(value: string, stripChars: string | null | undefined): string {
  let index = value.length;
  while (
    index > 0 &&
    (stripChars === null || stripChars === undefined
      ? isWhitespace(value[index - 1])
      : stripChars.includes(value[index - 1]))
  ) {
    index -= 1;
  }
  return value.slice(0, index);
}

function padValue(value: string, size: number, pad: string, left: boolean): string {
  const needed = size - value.length;
  if (needed <= 0 || pad.length === 0) {
    return value;
  }
  const repeated = pad.repeat(Math.ceil(needed / pad.length)).slice(0, needed);
  return left ? repeated + value : value + repeated;
}

function ordinalIndex(value: string, search: string, ordinal: number, fromEnd = false): number {
  if (ordinal <= 0 || search.length === 0) {
    return -1;
  }
  if (fromEnd) {
    let index = value.length;
    for (let count = 0; count < ordinal; count += 1) {
      index = value.lastIndexOf(search, index - 1);
      if (index < 0) {
        return -1;
      }
    }
    return index;
  }
  let index = -1;
  let start = 0;
  for (let count = 0; count < ordinal; count += 1) {
    index = value.indexOf(search, start);
    if (index < 0) {
      return -1;
    }
    start = index + search.length;
  }
  return index;
}

function replaceLiteral(text: string, search: string, replacement: string, max = -1, ignoreCase = false): string {
  if (search.length === 0 || max === 0) {
    return text;
  }
  let result = '';
  let start = 0;
  let count = 0;
  const source = ignoreCase ? text.toLocaleLowerCase() : text;
  const needle = ignoreCase ? search.toLocaleLowerCase() : search;
  while (start < text.length) {
    const index = source.indexOf(needle, start);
    if (index < 0 || (max >= 0 && count >= max)) {
      break;
    }
    result += text.slice(start, index) + replacement;
    start = index + search.length;
    count += 1;
  }
  return count === 0 ? text : result + text.slice(start);
}

function splitByCharacters(value: string, separatorChars: string | null, preserveAll = false, max = 0): string[] {
  if (value.length === 0) {
    return [];
  }
  const result: string[] = [];
  let start = 0;
  let index = 0;
  let matched = false;
  let lastMatch = false;
  const isSeparator = (character: string): boolean =>
    separatorChars === null ? isWhitespace(character) : separatorChars.includes(character);

  while (index < value.length) {
    if (isSeparator(value[index])) {
      if (matched || preserveAll) {
        if (max > 0 && result.length === max - 1) {
          result.push(value.slice(start));
          return result;
        }
        result.push(value.slice(start, index));
        matched = false;
        lastMatch = true;
      }
      start = index + 1;
      index += 1;
      continue;
    }
    matched = true;
    lastMatch = false;
    index += 1;
  }

  if (matched || (preserveAll && lastMatch)) {
    result.push(value.slice(start));
  }
  return result;
}

function splitByWhitespace(value: string, preserveAll = false, max = 0): string[] {
  return splitByCharacters(value, null, preserveAll, max);
}

function splitByWholeSeparator(value: string, separator: string, preserveAll = false, max = 0): string[] {
  if (value.length === 0) {
    return [];
  }
  const result: string[] = [];
  let start = 0;
  let lastMatch = false;
  while (true) {
    const index = value.indexOf(separator, start);
    if (index < 0) {
      break;
    }
    if (index > start || preserveAll) {
      if (max > 0 && result.length === max - 1) {
        result.push(value.slice(start));
        return result;
      }
      result.push(value.slice(start, index));
      lastMatch = true;
    }
    start = index + separator.length;
  }
  if (start < value.length || (preserveAll && lastMatch)) {
    result.push(value.slice(start));
  }
  return result;
}

/** Apache Commons Lang inspired string utilities. */
class StringUtil {
  static readonly SPACE = ' ';
  static readonly EMPTY = '';
  static readonly LF = '\n';
  static readonly CR = '\r';
  static readonly INDEX_NOT_FOUND = -1;

  static abbreviate(value: NullableString, maxWidth: number): string | null;
  static abbreviate(value: NullableString, offset: number, maxWidth: number): string | null;
  static abbreviate(value: NullableString, marker: string, maxWidth: number): string | null;
  static abbreviate(value: NullableString, marker: string, offset: number, maxWidth: number): string | null;
  static abbreviate(
    value: NullableString,
    offsetOrMarker: number | string,
    maxWidthOrOffset?: number,
    maxWidth?: number,
  ): string | null {
    const str = stringValue(value);
    if (str === null) {
      return null;
    }
    if (str.length === 0) {
      return str;
    }
    const marker = typeof offsetOrMarker === 'string' ? offsetOrMarker : '...';
    const offset =
      typeof offsetOrMarker === 'string'
        ? maxWidth === undefined
          ? 0
          : (maxWidthOrOffset ?? 0)
        : maxWidthOrOffset === undefined
          ? 0
          : offsetOrMarker;
    const width =
      typeof offsetOrMarker === 'string'
        ? maxWidth === undefined
          ? (maxWidthOrOffset ?? 0)
          : maxWidth
        : maxWidthOrOffset === undefined
          ? offsetOrMarker
          : maxWidthOrOffset;
    if (width < marker.length + 1) {
      throw new Error('Minimum abbreviation width is 4');
    }
    if (str.length <= width) {
      return str;
    }
    if (str.length - offset <= width - marker.length) {
      return marker + str.slice(str.length - (width - marker.length));
    }
    if (offset <= marker.length + 1) {
      return str.slice(0, width - marker.length) + marker;
    }
    if (width < marker.length * 2 + 1) {
      throw new Error(`Minimum abbreviation width with offset is ${marker.length * 2 + 1}`);
    }
    return marker + StringUtil.abbreviate(str.slice(Math.max(0, offset)), marker, width - marker.length);
  }

  static abbreviateWithMarker(value: NullableString, marker: string, maxWidth: number): string | null {
    const str = stringValue(value);
    if (str === null || str.length <= maxWidth) {
      return str;
    }
    if (maxWidth < marker.length + 1) {
      throw new Error('Minimum abbreviation width is marker length plus one');
    }
    return str.slice(0, maxWidth - marker.length) + marker;
  }

  static abbreviateMiddle(value: NullableString, middle: string, length: number): string | null {
    const str = stringValue(value);
    if (str === null || middle.length === 0 || str.length <= length || length < middle.length + 2) {
      return str;
    }
    const charsToPreserve = length - middle.length;
    const front = Math.ceil(charsToPreserve / 2);
    return str.slice(0, front) + middle + str.slice(str.length - Math.floor(charsToPreserve / 2));
  }

  static appendIfMissing(value: NullableString, suffix: NullableString, ...suffixes: NullableString[]): string | null {
    const str = stringValue(value);
    const required = stringValue(suffix);
    if (str === null || required === null || required.length === 0) {
      return str;
    }
    if (
      [required, ...suffixes].some((candidate) => candidate !== null && candidate !== undefined && str.endsWith(candidate))
    ) {
      return str;
    }
    return str + required;
  }

  static appendIfMissingIgnoreCase(
    value: NullableString,
    suffix: NullableString,
    ...suffixes: NullableString[]
  ): string | null {
    const str = stringValue(value);
    const required = stringValue(suffix);
    if (str === null || required === null || required.length === 0) {
      return str;
    }
    const lower = str.toLocaleLowerCase();
    if (
      [required, ...suffixes].some(
        (candidate) => candidate !== null && candidate !== undefined && lower.endsWith(candidate.toLocaleLowerCase()),
      )
    ) {
      return str;
    }
    return str + required;
  }

  static capitalize(value: NullableString): string | null {
    const str = stringValue(value);
    return str === null || str.length === 0 ? str : str[0].toLocaleUpperCase() + str.slice(1);
  }

  static center(value: NullableString, size: number, pad?: string | number): string | null {
    const str = stringValue(value);
    if (str === null || size <= str.length) {
      return str;
    }
    const padString = typeof pad === 'number' ? String.fromCharCode(pad) : (pad ?? ' ');
    const total = size - str.length;
    const left = Math.floor(total / 2);
    const right = total - left;
    return padValue(padValue(str, str.length + right, padString, false), size, padString, true);
  }

  static chomp(value: NullableString, separator?: NullableString): string | null {
    const str = stringValue(value);
    if (str === null || str.length === 0) {
      return str;
    }
    if (separator !== undefined) {
      const suffix = stringValue(separator);
      return suffix && str.endsWith(suffix) ? str.slice(0, -suffix.length) : str;
    }
    if (str.endsWith('\r\n')) {
      return str.slice(0, -2);
    }
    return str.endsWith('\r') || str.endsWith('\n') ? str.slice(0, -1) : str;
  }

  static chop(value: NullableString): string | null {
    const str = stringValue(value);
    if (str === null || str.length === 0) {
      return str;
    }
    if (str.endsWith('\r\n')) {
      return str.slice(0, -2);
    }
    return str.slice(0, -1);
  }

  static compare(left: NullableString, right: NullableString, nullIsLess = true): number {
    if (left === right) {
      return 0;
    }
    if (left === null || left === undefined) {
      return nullIsLess ? -1 : 1;
    }
    if (right === null || right === undefined) {
      return nullIsLess ? 1 : -1;
    }
    return left < right ? -1 : 1;
  }

  static compareIgnoreCase(left: NullableString, right: NullableString, nullIsLess = true): number {
    return StringUtil.compare(
      left === null || left === undefined ? left : left.toLocaleLowerCase(),
      right === null || right === undefined ? right : right.toLocaleLowerCase(),
      nullIsLess,
    );
  }

  static contains(value: NullableString, search: string | number | null | undefined): boolean {
    const str = stringValue(value);
    if (str === null || search === null || search === undefined) {
      return false;
    }
    return str.includes(typeof search === 'number' ? String.fromCharCode(search) : search);
  }

  static containsAny(
    value: NullableString,
    search: string | readonly string[] | null | undefined,
    ...more: string[]
  ): boolean {
    const str = stringValue(value);
    if (str === null || search === null || search === undefined) {
      return false;
    }
    const candidates =
      typeof search === 'string' ? (more.length > 0 ? [search, ...more] : Array.from(search)) : [...search, ...more];
    return candidates.some((candidate) => str.includes(candidate));
  }

  static containsAnyIgnoreCase(value: NullableString, ...search: Array<string | null | undefined>): boolean {
    const str = stringValue(value);
    return (
      str !== null &&
      search.some(
        (candidate) =>
          candidate !== null && candidate !== undefined && str.toLocaleLowerCase().includes(candidate.toLocaleLowerCase()),
      )
    );
  }

  static containsIgnoreCase(value: NullableString, search: NullableString): boolean {
    return (
      value !== null &&
      value !== undefined &&
      search !== null &&
      search !== undefined &&
      value.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    );
  }

  static containsNone(value: NullableString, invalid: string | readonly string[] | null | undefined): boolean {
    const str = stringValue(value);
    if (str === null) {
      return true;
    }
    if (invalid === null || invalid === undefined) {
      return true;
    }
    const invalidChars = typeof invalid === 'string' ? invalid : invalid.join('');
    return !Array.from(str).some((character) => invalidChars.includes(character));
  }

  static containsOnly(value: NullableString, valid: string | readonly string[] | null | undefined): boolean {
    const str = stringValue(value);
    if (str === null || valid === null || valid === undefined) {
      return false;
    }
    if (str.length === 0) return true;
    if (typeof valid === 'string' && valid.length === 0) return false;
    const validChars = typeof valid === 'string' ? valid : valid.join('');
    return Array.from(str).every((character) => validChars.includes(character));
  }

  static containsWhitespace(value: NullableString): boolean {
    return value !== null && value !== undefined && Array.from(value).some(isWhitespace);
  }

  static countMatches(value: NullableString, search: string | number): number {
    const str = stringValue(value);
    if (str === null) {
      return 0;
    }
    const needle = typeof search === 'number' ? String.fromCharCode(search) : search;
    if (needle.length === 0) {
      return 0;
    }
    let count = 0;
    let start = 0;
    while (true) {
      const index = str.indexOf(needle, start);
      if (index < 0) {
        return count;
      }
      count += 1;
      start = index + needle.length;
    }
  }

  static defaultIfBlank<T extends string>(value: T | null | undefined, defaultValue: T): T {
    return isBlankValue(value) ? defaultValue : (value as T);
  }

  static defaultIfEmpty<T extends string>(value: T | null | undefined, defaultValue: T): T {
    return value === null || value === undefined || value.length === 0 ? defaultValue : value;
  }

  static defaultString(value: NullableString, nullDefault = ''): string {
    return value === null || value === undefined ? nullDefault : value;
  }

  static deleteWhitespace(value: NullableString): string | null {
    return value === null || value === undefined
      ? value
      : Array.from(value)
          .filter((character) => !isWhitespace(character))
          .join('');
  }

  static difference(left: NullableString, right: NullableString): string | null {
    if (left === null || left === undefined) {
      return right === null || right === undefined ? null : right;
    }
    if (right === null || right === undefined) {
      return left;
    }
    const index = StringUtil.indexOfDifference(left, right);
    return index === -1 ? '' : right.slice(index);
  }

  static endsWith(value: NullableString, suffix: NullableString): boolean {
    return value === null || value === undefined
      ? suffix === null || suffix === undefined
      : suffix !== null && suffix !== undefined && value.endsWith(suffix);
  }

  static endsWithAny(value: NullableString, ...suffixes: Array<NullableString>): boolean {
    return value !== null && value !== undefined && suffixes.some((suffix) => StringUtil.endsWith(value, suffix));
  }

  static endsWithIgnoreCase(value: NullableString, suffix: NullableString): boolean {
    return (
      value !== null &&
      value !== undefined &&
      suffix !== null &&
      suffix !== undefined &&
      value.toLocaleLowerCase().endsWith(suffix.toLocaleLowerCase())
    );
  }

  static equals(left: NullableString, right: NullableString): boolean {
    return (
      left === right || (left !== null && left !== undefined && right !== null && right !== undefined && left === right)
    );
  }

  static equalsAny(value: NullableString, ...search: Array<NullableString>): boolean {
    return search.some((candidate) => StringUtil.equals(value, candidate));
  }

  static equalsAnyIgnoreCase(value: NullableString, ...search: Array<NullableString>): boolean {
    return search.some((candidate) => StringUtil.equalsIgnoreCase(value, candidate));
  }

  static equalsIgnoreCase(left: NullableString, right: NullableString): boolean {
    return (
      left === right ||
      (left !== null &&
        left !== undefined &&
        right !== null &&
        right !== undefined &&
        left.toLocaleLowerCase() === right.toLocaleLowerCase())
    );
  }

  static firstNonBlank<T extends string>(...values: Array<T | null | undefined>): T | null {
    return values.find((value) => !isBlankValue(value)) ?? null;
  }

  static firstNonEmpty<T extends string>(...values: Array<T | null | undefined>): T | null {
    return values.find((value) => value !== null && value !== undefined && value.length > 0) ?? null;
  }

  static getBytes(value: NullableString, _charset = 'utf-8'): Uint8Array {
    if (value === null || value === undefined) {
      return new Uint8Array();
    }
    try {
      return new TextEncoder().encode(value);
    } catch {
      return new Uint8Array(value.split('').map((character) => character.charCodeAt(0)));
    }
  }

  static getCommonPrefix(...values: Array<NullableString>): string {
    const strings = values.map((value) => value ?? '');
    if (strings.length === 0) {
      return '';
    }
    let end = strings[0].length;
    for (const value of strings.slice(1)) {
      end = Math.min(end, value.length);
      while (end > 0 && strings[0].slice(0, end) !== value.slice(0, end)) {
        end -= 1;
      }
    }
    return strings[0].slice(0, end);
  }

  static getDigits(value: NullableString): string {
    return value === null || value === undefined
      ? ''
      : Array.from(value)
          .filter((character) => /^\p{Nd}$/u.test(character))
          .join('');
  }

  static getFuzzyDistance(term: string, query: string, _locale?: string): number {
    const lowerTerm = term.toLocaleLowerCase();
    const lowerQuery = query.toLocaleLowerCase();
    let score = 0;
    let index = 0;
    for (const character of lowerQuery) {
      const found = lowerTerm.indexOf(character, index);
      if (found < 0) {
        continue;
      }
      score += found === index ? 2 : 1;
      index = found + 1;
    }
    return score;
  }

  static getIfBlank<T extends string>(value: T | null | undefined, supplier: () => T): T {
    return isBlankValue(value) ? supplier() : (value as T);
  }

  static getIfEmpty<T extends string>(value: T | null | undefined, supplier: () => T): T {
    return value === null || value === undefined || value.length === 0 ? supplier() : value;
  }

  static getJaroWinklerDistance(first: NullableString, second: NullableString): number {
    if (
      first === null ||
      first === undefined ||
      second === null ||
      second === undefined ||
      first.length === 0 ||
      second.length === 0
    ) {
      return 0;
    }
    if (first === second) return 1;

    const max = first.length > second.length ? first : second;
    const min = first.length > second.length ? second : first;
    const range = Math.max(Math.floor(max.length / 2) - 1, 0);
    const matchIndexes = new Array<number>(min.length).fill(-1);
    const matchFlags = new Array<boolean>(max.length).fill(false);
    let matches = 0;
    for (let minIndex = 0; minIndex < min.length; minIndex += 1) {
      for (
        let maxIndex = Math.max(minIndex - range, 0);
        maxIndex < Math.min(minIndex + range + 1, max.length);
        maxIndex += 1
      ) {
        if (!matchFlags[maxIndex] && min[minIndex] === max[maxIndex]) {
          matchIndexes[minIndex] = maxIndex;
          matchFlags[maxIndex] = true;
          matches += 1;
          break;
        }
      }
    }
    if (matches === 0) {
      return 0;
    }
    const matchedMin = min.split('').filter((_, index) => matchIndexes[index] !== -1);
    const matchedMax = max.split('').filter((_, index) => matchFlags[index]);
    let transpositions = 0;
    matchedMin.forEach((character, index) => {
      if (character !== matchedMax[index]) transpositions += 1;
    });
    const jaro =
      (matches / first.length + matches / second.length + (matches - Math.floor(transpositions / 2)) / matches) / 3;
    let prefix = 0;
    while (prefix < Math.min(4, first.length, second.length) && first[prefix] === second[prefix]) {
      prefix += 1;
    }
    const winkler = jaro < 0.7 ? jaro : jaro + Math.min(0.1, 1 / max.length) * prefix * (1 - jaro);
    return Math.round(winkler * 100) / 100;
  }

  static getLevenshteinDistance(left: NullableString, right: NullableString, threshold?: number): number {
    if (left === null || left === undefined || right === null || right === undefined) {
      if (left === right) return 0;
      throw new TypeError('strings must not be null');
    }
    if (threshold !== undefined && threshold < 0) {
      throw new Error('threshold must not be negative');
    }
    if (threshold !== undefined && Math.abs(left.length - right.length) > threshold) {
      return -1;
    }
    let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let row = 1; row <= left.length; row += 1) {
      const current = [row];
      let min = current[0];
      for (let column = 1; column <= right.length; column += 1) {
        const value =
          left[row - 1] === right[column - 1]
            ? previous[column - 1]
            : Math.min(previous[column - 1], previous[column], current[column - 1]) + 1;
        current[column] = value;
        min = Math.min(min, value);
      }
      if (threshold !== undefined && min > threshold) {
        return -1;
      }
      previous = current;
    }
    return previous[right.length];
  }

  static indexOf(value: NullableString, search: string | number | null | undefined, start = 0): number {
    const str = stringValue(value);
    if (str === null || search === null || search === undefined) {
      return -1;
    }
    return str.indexOf(typeof search === 'number' ? String.fromCharCode(search) : search, Math.max(0, start));
  }

  static indexOfAny(
    value: NullableString,
    search: string | readonly string[] | null | undefined,
    ...more: string[]
  ): number {
    const str = stringValue(value);
    if (str === null || search === null || search === undefined) {
      return -1;
    }
    const searches =
      typeof search === 'string' ? (more.length > 0 ? [search, ...more] : Array.from(search)) : [...search, ...more];
    let result = -1;
    for (const candidate of searches) {
      const index = str.indexOf(candidate);
      if (index >= 0 && (result < 0 || index < result)) result = index;
    }
    return result;
  }

  static indexOfAnyBut(value: NullableString, search: string | readonly string[] | null | undefined): number {
    const str = stringValue(value);
    if (str === null || str.length === 0) return -1;
    const searched = search === null || search === undefined ? '' : typeof search === 'string' ? search : search.join('');
    for (let index = 0; index < str.length; index += 1) if (!searched.includes(str[index])) return index;
    return -1;
  }

  static indexOfDifference(...values: Array<NullableString>): number {
    if (values.length < 2) return -1;
    const strings = values.map((value) => value ?? '');
    const shortest = Math.min(...strings.map((value) => value.length));
    for (let index = 0; index < shortest; index += 1) {
      if (strings.some((value) => value[index] !== strings[0][index])) return index;
    }
    return strings.some((value) => value.length !== shortest) ? shortest : -1;
  }

  static indexOfIgnoreCase(value: NullableString, search: NullableString, start = 0): number {
    if (value === null || value === undefined || search === null || search === undefined) return -1;
    return value.toLocaleLowerCase().indexOf(search.toLocaleLowerCase(), Math.max(0, start));
  }

  static isAllBlank(...values: Array<NullableString>): boolean {
    return values.every(isBlankValue);
  }
  static isAllEmpty(...values: Array<NullableString>): boolean {
    return values.every((value) => value === null || value === undefined || value.length === 0);
  }
  static isAllLowerCase(value: NullableString): boolean {
    return (
      value !== null &&
      value !== undefined &&
      value.length > 0 &&
      Array.from(value).every(
        (character) => character.toLocaleLowerCase() === character && character.toLocaleUpperCase() !== character,
      )
    );
  }
  static isAllUpperCase(value: NullableString): boolean {
    return (
      value !== null &&
      value !== undefined &&
      value.length > 0 &&
      Array.from(value).every(
        (character) => character.toLocaleUpperCase() === character && character.toLocaleLowerCase() !== character,
      )
    );
  }
  static isAlpha(value: NullableString): boolean {
    return value !== null && value !== undefined && value.length > 0 && /^[A-Za-z]+$/u.test(value);
  }
  static isAlphanumeric(value: NullableString): boolean {
    return value !== null && value !== undefined && value.length > 0 && /^[A-Za-z0-9]+$/u.test(value);
  }
  static isAlphanumericSpace(value: NullableString): boolean {
    return value !== null && value !== undefined && value.length > 0 && /^[A-Za-z0-9\s]+$/u.test(value);
  }
  static isAlphaSpace(value: NullableString): boolean {
    return value !== null && value !== undefined && value.length > 0 && /^[A-Za-z\s]+$/u.test(value);
  }
  static isAnyBlank(...values: Array<NullableString>): boolean {
    return values.some(isBlankValue);
  }
  static isAnyEmpty(...values: Array<NullableString>): boolean {
    return values.some((value) => value === null || value === undefined || value.length === 0);
  }
  static isAsciiPrintable(value: NullableString): boolean {
    return (
      value !== null &&
      value !== undefined &&
      Array.from(value).every((character) => character.codePointAt(0)! >= 32 && character.codePointAt(0)! <= 126)
    );
  }
  static isBlank(value: NullableString): boolean {
    return isBlankValue(value);
  }
  static isEmpty(value: NullableString): boolean {
    return value === null || value === undefined || value.length === 0;
  }
  static isMixedCase(value: NullableString): boolean {
    return value !== null && value !== undefined && /[a-z]/u.test(value) && /[A-Z]/u.test(value);
  }
  static isNoneBlank(...values: Array<NullableString>): boolean {
    return values.every((value) => !isBlankValue(value));
  }
  static isNoneEmpty(...values: Array<NullableString>): boolean {
    return values.every((value) => !StringUtil.isEmpty(value));
  }
  static isNotBlank(value: NullableString): boolean {
    return !isBlankValue(value);
  }
  static isNotEmpty(value: NullableString): boolean {
    return !StringUtil.isEmpty(value);
  }
  static isNumeric(value: NullableString): boolean {
    return value !== null && value !== undefined && value.length > 0 && /^\p{Nd}+$/u.test(value);
  }
  static isNumericSpace(value: NullableString): boolean {
    return value !== null && value !== undefined && value.length > 0 && /^[\p{Nd}\s]+$/u.test(value);
  }
  static isWhitespace(value: NullableString): boolean {
    return value !== null && value !== undefined && Array.from(value).every(isWhitespace);
  }

  static join(value: unknown, separator: string | number = ',', startIndex?: number, endIndex?: number): string | null {
    if (value === null || value === undefined) return null;
    let values: unknown[];
    if (typeof value === 'string' && typeof separator === 'string' && startIndex === undefined) {
      values = [value];
    } else if (Array.isArray(value) || ArrayBuffer.isView(value)) {
      values = Array.from(value as ArrayLike<unknown>);
    } else if (typeof (value as Iterable<unknown>)[Symbol.iterator] === 'function' && typeof value !== 'string') {
      values = Array.from(value as Iterable<unknown>);
    } else {
      values = [value];
    }
    const from = startIndex ?? 0;
    const to = endIndex ?? values.length;
    const delimiter = typeof separator === 'number' ? String.fromCharCode(separator) : separator;
    return values
      .slice(from, to)
      .map((entry) => (entry === null || entry === undefined ? '' : String(entry)))
      .join(delimiter);
  }

  static joinWith(separator: NullableString, ...values: unknown[]): string {
    if (separator === null || separator === undefined) throw new TypeError('delimiter must not be null');
    return values.map((value) => (value === null || value === undefined ? '' : String(value))).join(separator);
  }

  static lastIndexOf(value: NullableString, search: string | number | null | undefined, start?: number): number {
    const str = stringValue(value);
    if (str === null || search === null || search === undefined) return -1;
    const needle = typeof search === 'number' ? String.fromCharCode(search) : search;
    return str.lastIndexOf(needle, start === undefined ? str.length : start);
  }

  static lastIndexOfAny(value: NullableString, ...search: Array<NullableString>): number {
    const str = stringValue(value);
    if (str === null) return -1;
    return search.reduce((result, candidate) => {
      if (candidate === null || candidate === undefined) return result;
      return Math.max(result, str.lastIndexOf(candidate));
    }, -1);
  }

  static lastIndexOfIgnoreCase(value: NullableString, search: NullableString, start?: number): number {
    if (value === null || value === undefined || search === null || search === undefined) return -1;
    return value.toLocaleLowerCase().lastIndexOf(search.toLocaleLowerCase(), start === undefined ? value.length : start);
  }

  static lastOrdinalIndexOf(value: NullableString, search: NullableString, ordinal: number): number {
    return value === null || value === undefined || search === null || search === undefined
      ? -1
      : ordinalIndex(value, search, ordinal, true);
  }

  static left(value: NullableString, length: number): string | null {
    return value === null || value === undefined ? value : length <= 0 ? '' : value.slice(0, length);
  }
  static leftPad(value: NullableString, size: number, pad: string | number = ' '): string | null {
    const str = stringValue(value);
    return str === null ? null : padValue(str, size, typeof pad === 'number' ? String.fromCharCode(pad) : pad, true);
  }
  static length(value: NullableString): number {
    return value === null || value === undefined ? 0 : value.length;
  }
  static lowerCase(value: NullableString, locale?: string): string | null {
    return value === null || value === undefined
      ? value
      : locale
        ? value.toLocaleLowerCase(locale)
        : value.toLocaleLowerCase();
  }
  static mid(value: NullableString, position: number, length: number): string | null {
    if (value === null || value === undefined || length <= 0) return value === null || value === undefined ? value : '';
    return value.slice(Math.max(0, position), Math.max(0, position) + length);
  }
  static normalizeSpace(value: NullableString): string | null {
    return value === null || value === undefined ? value : value.replace(/\s+/gu, ' ').trim();
  }
  static ordinalIndexOf(value: NullableString, search: NullableString, ordinal: number): number {
    return value === null || value === undefined || search === null || search === undefined
      ? -1
      : ordinalIndex(value, search, ordinal);
  }

  static overlay(value: NullableString, overlayValue: NullableString, start: number, end: number): string | null {
    if (value === null || value === undefined) return null;
    const overlay = overlayValue ?? '';
    let from = Math.max(0, Math.min(start, value.length));
    let to = Math.max(0, Math.min(end, value.length));
    if (from > to) [from, to] = [to, from];
    return value.slice(0, from) + overlay + value.slice(to);
  }

  static prependIfMissing(value: NullableString, prefix: NullableString, ...prefixes: NullableString[]): string | null {
    const str = stringValue(value);
    const required = stringValue(prefix);
    if (
      str === null ||
      required === null ||
      required.length === 0 ||
      [required, ...prefixes].some((candidate) => candidate !== null && candidate !== undefined && str.startsWith(candidate))
    )
      return str;
    return required + str;
  }
  static prependIfMissingIgnoreCase(
    value: NullableString,
    prefix: NullableString,
    ...prefixes: NullableString[]
  ): string | null {
    const str = stringValue(value);
    const required = stringValue(prefix);
    if (
      str === null ||
      required === null ||
      required.length === 0 ||
      [required, ...prefixes].some(
        (candidate) =>
          candidate !== null && candidate !== undefined && str.toLocaleLowerCase().startsWith(candidate.toLocaleLowerCase()),
      )
    )
      return str;
    return required + str;
  }
  static remove(value: NullableString, remove: string | number | null | undefined): string | null {
    const str = stringValue(value);
    if (str === null || remove === null || remove === undefined) return str;
    const needle = typeof remove === 'number' ? String.fromCharCode(remove) : remove;
    return replaceLiteral(str, needle, '');
  }
  static removeAll(value: NullableString, regex: string): string | null {
    return value === null || value === undefined ? value : value.replace(new RegExp(regex, 'gu'), '');
  }
  static removeEnd(value: NullableString, remove: NullableString): string | null {
    const str = stringValue(value);
    return str === null || remove === null || remove === undefined || !str.endsWith(remove)
      ? str
      : str.slice(0, -remove.length);
  }
  static removeEndIgnoreCase(value: NullableString, remove: NullableString): string | null {
    const str = stringValue(value);
    return str === null ||
      remove === null ||
      remove === undefined ||
      !str.toLocaleLowerCase().endsWith(remove.toLocaleLowerCase())
      ? str
      : str.slice(0, -remove.length);
  }
  static removeFirst(value: NullableString, regex: string): string | null {
    return value === null || value === undefined ? value : value.replace(new RegExp(regex, 'u'), '');
  }
  static removeIgnoreCase(value: NullableString, remove: NullableString): string | null {
    const str = stringValue(value);
    return str === null || remove === null || remove === undefined ? str : replaceLiteral(str, remove, '', -1, true);
  }
  static removePattern(value: NullableString, regex: string): string | null {
    return StringUtil.removeAll(value, regex);
  }
  static removeStart(value: NullableString, remove: string | number | null | undefined): string | null {
    const str = stringValue(value);
    if (str === null || remove === null || remove === undefined) return str;
    const prefix = typeof remove === 'number' ? String.fromCharCode(remove) : remove;
    return !str.startsWith(prefix) ? str : str.slice(prefix.length);
  }
  static removeStartIgnoreCase(value: NullableString, remove: NullableString): string | null {
    const str = stringValue(value);
    return str === null ||
      remove === null ||
      remove === undefined ||
      !str.toLocaleLowerCase().startsWith(remove.toLocaleLowerCase())
      ? str
      : str.slice(remove.length);
  }
  static repeat(value: string, count: number, separator?: string): string {
    if (count <= 0) return '';
    return Array(count)
      .fill(value)
      .join(separator ?? '');
  }
  static replace(value: NullableString, search: NullableString, replacement: NullableString, max = -1): string | null {
    return value === null || value === undefined || search === null || search === undefined || search.length === 0
      ? value
      : replaceLiteral(value, search, replacement ?? '', max);
  }
  static replaceAll(value: NullableString, regex: string, replacement: NullableString): string | null {
    return value === null || value === undefined ? value : value.replace(new RegExp(regex, 'gu'), replacement ?? '');
  }
  static replaceChars(value: NullableString, search: string, replacement: string): string | null {
    if (value === null || value === undefined) return value;
    return Array.from(value)
      .map((character) => {
        const index = search.indexOf(character);
        return index < 0 ? character : (replacement[index] ?? '');
      })
      .join('');
  }
  static replaceEach(
    value: NullableString,
    searchList: readonly string[],
    replacementList: readonly NullableString[],
  ): string | null {
    if (value === null || value === undefined) return value;
    return searchList.reduce((result, search, index) => replaceLiteral(result, search, replacementList[index] ?? ''), value);
  }
  static replaceEachRepeatedly(
    value: NullableString,
    searchList: readonly string[],
    replacementList: readonly NullableString[],
  ): string | null {
    let result = value;
    for (let count = 0; count < searchList.length * 2 + 1 && result !== null; count += 1) {
      const next = StringUtil.replaceEach(result, searchList, replacementList);
      if (next === result) return result;
      result = next;
    }
    return result;
  }
  static replaceFirst(value: NullableString, regex: string, replacement: NullableString): string | null {
    return value === null || value === undefined ? value : value.replace(new RegExp(regex, 'u'), replacement ?? '');
  }
  static replaceIgnoreCase(
    value: NullableString,
    search: NullableString,
    replacement: NullableString,
    max = -1,
  ): string | null {
    return value === null || value === undefined || search === null || search === undefined
      ? value
      : replaceLiteral(value, search, replacement ?? '', max, true);
  }
  static replaceOnce(value: NullableString, search: NullableString, replacement: NullableString): string | null {
    return StringUtil.replace(value, search, replacement, 1);
  }
  static replaceOnceIgnoreCase(value: NullableString, search: NullableString, replacement: NullableString): string | null {
    return StringUtil.replaceIgnoreCase(value, search, replacement, 1);
  }
  static replacePattern(value: NullableString, regex: string, replacement: NullableString): string | null {
    return StringUtil.replaceAll(value, regex, replacement);
  }
  static reverse(value: NullableString): string | null {
    return value === null || value === undefined ? value : Array.from(value).reverse().join('');
  }
  static reverseDelimited(value: NullableString, separator: string): string | null {
    return value === null || value === undefined ? value : value.split(separator).reverse().join(separator);
  }
  static right(value: NullableString, length: number): string | null {
    return value === null || value === undefined ? value : length <= 0 ? '' : value.slice(-length);
  }
  static rightPad(value: NullableString, size: number, pad: string | number = ' '): string | null {
    const str = stringValue(value);
    return str === null ? null : padValue(str, size, typeof pad === 'number' ? String.fromCharCode(pad) : pad, false);
  }
  static rotate(value: NullableString, shift: number): string | null {
    if (value === null || value === undefined || value.length === 0) return value;
    const distance = ((shift % value.length) + value.length) % value.length;
    return value.slice(value.length - distance) + value.slice(0, value.length - distance);
  }

  static split(value: NullableString, separator?: string | number, max = 0): string[] | null {
    if (value === null || value === undefined) return null;
    if (separator === undefined || separator === null) return splitByWhitespace(value, false, max);
    if (typeof separator === 'number') return splitByCharacters(value, String.fromCharCode(separator), false, max);
    if (separator.length === 0) return splitByWhitespace(value, false, max);
    return splitByCharacters(value, separator, false, max);
  }
  static splitPreserveAllTokens(value: NullableString, separator?: string | number, max = 0): string[] | null {
    if (value === null || value === undefined) return null;
    if (separator === undefined || separator === null) return splitByWhitespace(value, true, max);
    const separatorString = typeof separator === 'number' ? String.fromCharCode(separator) : separator;
    if (separatorString.length === 0) return splitByWhitespace(value, true, max);
    return splitByCharacters(value, separatorString, true, max);
  }
  static splitByWholeSeparator(value: NullableString, separator: NullableString, max = 0): string[] | null {
    if (value === null || value === undefined) return null;
    if (separator === null || separator === undefined || separator.length === 0) return splitByWhitespace(value, false, max);
    return splitByWholeSeparator(value, separator, false, max);
  }
  static splitByWholeSeparatorPreserveAllTokens(value: NullableString, separator: NullableString, max = 0): string[] | null {
    if (value === null || value === undefined) return null;
    if (separator === null || separator === undefined || separator.length === 0) return splitByWhitespace(value, true, max);
    return splitByWholeSeparator(value, separator, true, max);
  }
  static splitByCharacterType(value: NullableString, camelCase = false): string[] | null {
    if (value === null || value === undefined || value.length === 0)
      return value === null || value === undefined ? value : [];
    const result: string[] = [];
    let current = value[0];
    const type = (character: string): string =>
      /[A-Z]/u.test(character) ? 'upper' : /[a-z]/u.test(character) ? 'lower' : /\d/u.test(character) ? 'digit' : 'other';
    for (let index = 1; index < value.length; index += 1) {
      const previousType = type(value[index - 1]);
      const currentType = type(value[index]);
      if (camelCase && previousType === 'upper' && currentType === 'lower') {
        if (current.length > 1) {
          result.push(current.slice(0, -1));
          current = current.slice(-1) + value[index];
        } else {
          current += value[index];
        }
      } else if (previousType !== currentType) {
        result.push(current);
        current = value[index];
      } else current += value[index];
    }
    result.push(current);
    return result;
  }
  static splitByCharacterTypeCamelCase(value: NullableString): string[] | null {
    return StringUtil.splitByCharacterType(value, true);
  }

  static startsWith(value: NullableString, prefix: NullableString): boolean {
    return value === null || value === undefined
      ? prefix === null || prefix === undefined
      : prefix !== null && prefix !== undefined && value.startsWith(prefix);
  }
  static startsWithAny(value: NullableString, ...prefixes: Array<NullableString>): boolean {
    return value !== null && value !== undefined && prefixes.some((prefix) => StringUtil.startsWith(value, prefix));
  }
  static startsWithIgnoreCase(value: NullableString, prefix: NullableString): boolean {
    return (
      value !== null &&
      value !== undefined &&
      prefix !== null &&
      prefix !== undefined &&
      value.toLocaleLowerCase().startsWith(prefix.toLocaleLowerCase())
    );
  }
  static strip(value: NullableString, stripChars?: NullableString): string | null {
    return value === null || value === undefined ? value : stripEndValue(stripStartValue(value, stripChars), stripChars);
  }
  static stripAccents(value: NullableString): string | null {
    return value === null || value === undefined ? value : value.normalize('NFD').replace(/\p{M}/gu, '');
  }
  static stripAll(...values: Array<NullableString>): Array<string | null>;
  static stripAll(
    values: readonly NullableString[] | null | undefined,
    stripChars?: NullableString,
  ): Array<string | null> | null;
  static stripAll(
    valuesOrFirst: NullableString | readonly NullableString[] | null | undefined,
    stripChars?: NullableString,
    ...remaining: NullableString[]
  ): Array<string | null> | null {
    if (arguments.length === 0) {
      return [];
    }
    if (Array.isArray(valuesOrFirst)) {
      return valuesOrFirst.map((value) => StringUtil.strip(value, stripChars));
    }
    if (valuesOrFirst === null && remaining.length === 0 && stripChars === undefined) {
      return null;
    }
    return [valuesOrFirst as NullableString, ...(stripChars === undefined ? [] : [stripChars]), ...remaining].map((value) =>
      StringUtil.strip(value),
    );
  }
  static stripEnd(value: NullableString, stripChars?: NullableString): string | null {
    return value === null || value === undefined ? value : stripEndValue(value, stripChars);
  }
  static stripStart(value: NullableString, stripChars?: NullableString): string | null {
    return value === null || value === undefined ? value : stripStartValue(value, stripChars);
  }
  static stripToEmpty(value: NullableString): string {
    return StringUtil.strip(value) ?? '';
  }
  static stripToNull(value: NullableString): string | null {
    const result = StringUtil.strip(value);
    return result === null || result.length === 0 ? null : result;
  }
  static substring(value: NullableString, start: number, end?: number): string | null {
    if (value === null || value === undefined) return value;
    const length = value.length;
    const from = start < 0 ? Math.max(0, length + start) : Math.min(start, length);
    const to = end === undefined ? length : end < 0 ? Math.max(0, length + end) : Math.min(end, length);
    return from > to ? '' : value.slice(from, to);
  }
  static substringAfter(value: NullableString, find: string | number | null | undefined): string | null {
    if (value === null || value === undefined) return value;
    if (find === null || find === undefined) return '';
    const needle = typeof find === 'number' ? String.fromCharCode(find) : find;
    if (needle.length === 0) return '';
    const index = value.indexOf(needle);
    return index < 0 ? '' : value.slice(index + needle.length);
  }
  static substringAfterLast(value: NullableString, find: string | number | null | undefined): string | null {
    if (value === null || value === undefined) return value;
    if (find === null || find === undefined) return '';
    const needle = typeof find === 'number' ? String.fromCharCode(find) : find;
    if (needle.length === 0) return '';
    const index = value.lastIndexOf(needle);
    return index < 0 ? '' : value.slice(index + needle.length);
  }
  static substringBefore(value: NullableString, find: string | number | null | undefined): string | null {
    if (value === null || value === undefined) return value;
    if (find === null || find === undefined) return value;
    const needle = typeof find === 'number' ? String.fromCharCode(find) : find;
    if (needle.length === 0) return '';
    const index = value.indexOf(needle);
    return index < 0 ? value : value.slice(0, index);
  }
  static substringBeforeLast(value: NullableString, find: NullableString): string | null {
    if (value === null || value === undefined) return value;
    if (find === null || find === undefined || find.length === 0) return '';
    const index = value.lastIndexOf(find);
    return index < 0 ? value : value.slice(0, index);
  }
  static substringBetween(value: NullableString, open: NullableString, close?: NullableString): string | null {
    if (value === null || value === undefined || open === null || open === undefined) return null;
    const ending = close === undefined ? open : close;
    if (ending === null || ending === undefined) return null;
    const start = value.indexOf(open);
    if (start < 0) return null;
    const end = value.indexOf(ending, start + open.length);
    return end < 0 ? null : value.slice(start + open.length, end);
  }
  static substringsBetween(value: NullableString, open: NullableString, close: NullableString): string[] | null {
    if (
      value === null ||
      value === undefined ||
      open === null ||
      open === undefined ||
      close === null ||
      close === undefined ||
      open.length === 0 ||
      close.length === 0
    )
      return null;
    const result: string[] = [];
    let position = 0;
    while (true) {
      const start = value.indexOf(open, position);
      if (start < 0) break;
      const contentStart = start + open.length;
      const end = value.indexOf(close, contentStart);
      if (end < 0) break;
      result.push(value.slice(contentStart, end));
      position = end + close.length;
    }
    return result.length === 0 ? null : result;
  }
  static swapCase(value: NullableString): string | null {
    if (value === null || value === undefined) return value;
    return Array.from(value)
      .map((character) =>
        character === character.toLocaleUpperCase() ? character.toLocaleLowerCase() : character.toLocaleUpperCase(),
      )
      .join('');
  }
  static toCodePoints(value: NullableString): number[] {
    return value === null || value === undefined ? [] : Array.from(value, (character) => character.codePointAt(0)!);
  }
  static toEncodedString(bytes: Uint8Array | number[], charset = 'utf-8'): string {
    try {
      return new TextDecoder(charset).decode(Uint8Array.from(bytes));
    } catch {
      return String.fromCharCode(...bytes);
    }
  }
  static toString(bytes: Uint8Array | number[] | null | undefined, charset = 'utf-8'): string | null {
    return bytes === null || bytes === undefined ? null : StringUtil.toEncodedString(bytes, charset);
  }
  static toRootLowerCase(value: NullableString): string | null {
    return value === null || value === undefined ? value : value.toLocaleLowerCase('en-US');
  }
  static toRootUpperCase(value: NullableString): string | null {
    return value === null || value === undefined ? value : value.toLocaleUpperCase('en-US');
  }
  static trim(value: NullableString): string | null {
    return value === null || value === undefined ? value : value.trim();
  }
  static trimAsciiControl(value: NullableString): string | null {
    return value === null || value === undefined ? value : value.replace(/^[\x00-\x20]+|[\x00-\x20]+$/gu, '');
  }
  static trimToEmpty(value: NullableString): string {
    return value === null || value === undefined ? '' : value.trim();
  }
  static trimToNull(value: NullableString): string | null {
    const result = StringUtil.trimToEmpty(value);
    return result.length === 0 ? null : result;
  }
  static truncate(value: NullableString, offsetOrMaxWidth: number, maxWidth?: number): string | null {
    if (value === null || value === undefined) return value;
    const offset = maxWidth === undefined ? 0 : offsetOrMaxWidth;
    const width = maxWidth === undefined ? offsetOrMaxWidth : maxWidth;
    return value.slice(offset, offset + width);
  }
  static uncapitalize(value: NullableString): string | null {
    const str = stringValue(value);
    return str === null || str.length === 0 ? str : str[0].toLocaleLowerCase() + str.slice(1);
  }
  static unwrap(value: NullableString, wrap: string | number): string | null {
    if (value === null || value === undefined) return value;
    const token = typeof wrap === 'number' ? String.fromCharCode(wrap) : wrap;
    return value.startsWith(token) && value.endsWith(token) && value.length >= token.length * 2
      ? value.slice(token.length, -token.length)
      : value;
  }
  static upperCase(value: NullableString, locale?: string): string | null {
    return value === null || value === undefined
      ? value
      : locale
        ? value.toLocaleUpperCase(locale)
        : value.toLocaleUpperCase();
  }
  static valueOf(value: readonly unknown[] | null | undefined): string {
    return value === null || value === undefined ? '' : String.fromCharCode(...value.map((entry) => Number(entry)));
  }
  static wrap(value: NullableString, wrapWith: string | number): string | null {
    if (value === null || value === undefined) return value;
    const token = typeof wrapWith === 'number' ? String.fromCharCode(wrapWith) : wrapWith;
    return token + value + token;
  }
  static wrapIfMissing(value: NullableString, wrapWith: string | number): string | null {
    if (value === null || value === undefined) return value;
    const token = typeof wrapWith === 'number' ? String.fromCharCode(wrapWith) : wrapWith;
    return value.startsWith(token) && value.endsWith(token) ? value : StringUtil.wrap(value, token);
  }
}

export default StringUtil;
