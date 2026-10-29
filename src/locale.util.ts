class LocaleValue {
  readonly language: string;
  readonly country: string;
  readonly variant: string;

  constructor(language = '', country = '', variant = '') {
    this.language = language;
    this.country = country;
    this.variant = variant;
  }

  get region(): string {
    return this.country;
  }

  toString(): string {
    if (this.language.length === 0 && this.country.length > 0) {
      return `_${this.country}${this.variant.length > 0 ? `_${this.variant}` : ''}`;
    }
    return [this.language, this.country, this.variant].filter((part) => part.length > 0).join('_');
  }

  toIntlLocale(): Intl.Locale | null {
    if (this.language.length === 0) {
      return null;
    }
    const identifier = [this.language, this.country, this.variant].filter((part) => part.length > 0).join('-');
    try {
      return new Intl.Locale(identifier);
    } catch {
      return null;
    }
  }
}

export type LocaleLike =
  LocaleValue | Intl.Locale | string | { language?: string; country?: string; region?: string; variant?: string };

function fromLocale(value: LocaleLike | null | undefined): LocaleValue | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof LocaleValue) {
    return value;
  }
  if (typeof value === 'string') {
    return LocaleUtil.toLocale(value);
  }
  if (value instanceof Intl.Locale) {
    const locale = value as Intl.Locale & { region?: string };
    return new LocaleValue(locale.language, locale.region ?? '', '');
  }
  return new LocaleValue(value.language ?? '', value.country ?? value.region ?? '', value.variant ?? '');
}

function localeKey(locale: LocaleValue): string {
  return locale.toString();
}

function parseLocaleString(locale: string): LocaleValue {
  if (locale.length === 0) {
    return new LocaleValue();
  }
  if (/^[A-Z]{2}$/.test(locale)) {
    return new LocaleValue('', locale);
  }
  const separator = locale.includes('_') ? '_' : '-';
  const parts = locale.split(separator);
  const language = parts.shift() ?? '';
  const country = parts.shift() ?? '';
  const variant = parts.join(separator);
  if (!/^[a-z]{2,3}$/.test(language)) {
    throw new Error(`Invalid locale: ${locale}`);
  }
  if (country.length > 0 && !/^(?:[A-Z]{2}|[0-9]{3})$/.test(country)) {
    throw new Error(`Invalid locale: ${locale}`);
  }
  if (variant.length > 0 && !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(variant)) {
    throw new Error(`Invalid locale: ${locale}`);
  }
  return new LocaleValue(language, country, variant);
}

function buildAvailableLocales(): LocaleValue[] {
  const values = new Map<string, LocaleValue>();
  const add = (locale: LocaleValue): void => {
    values.set(localeKey(locale), locale);
  };

  add(new LocaleValue());
  // `Intl.supportedValuesOf` does not expose language identifiers (its
  // accepted keys are calendars, currencies, time zones, and similar data),
  // so use the stable language set understood by the platform instead of
  // calling it with an invalid key.
  for (const language of [
    'aa',
    'ab',
    'af',
    'ak',
    'am',
    'ar',
    'as',
    'az',
    'be',
    'bg',
    'bn',
    'bo',
    'br',
    'bs',
    'ca',
    'cs',
    'cy',
    'da',
    'de',
    'dz',
    'el',
    'en',
    'eo',
    'es',
    'et',
    'eu',
    'fa',
    'fi',
    'fil',
    'fo',
    'fr',
    'fy',
    'ga',
    'gd',
    'gl',
    'gu',
    'ha',
    'he',
    'hi',
    'hr',
    'hu',
    'hy',
    'id',
    'ig',
    'is',
    'it',
    'ja',
    'ka',
    'kk',
    'km',
    'kn',
    'ko',
    'ks',
    'ku',
    'ky',
    'lb',
    'lo',
    'lt',
    'lv',
    'mg',
    'mk',
    'ml',
    'mn',
    'mr',
    'ms',
    'mt',
    'my',
    'nb',
    'ne',
    'nl',
    'nn',
    'no',
    'oc',
    'om',
    'or',
    'pa',
    'pl',
    'ps',
    'pt',
    'ro',
    'ru',
    'rw',
    'sa',
    'sc',
    'sd',
    'se',
    'si',
    'sk',
    'sl',
    'sm',
    'sn',
    'so',
    'sq',
    'sr',
    'sv',
    'sw',
    'ta',
    'te',
    'tg',
    'th',
    'ti',
    'tk',
    'to',
    'tr',
    'tt',
    'ug',
    'uk',
    'ur',
    'uz',
    'vi',
    'wo',
    'xh',
    'yi',
    'yo',
    'zh',
    'zu',
  ]) {
    add(new LocaleValue(language));
  }
  for (const identifier of [
    'en_US',
    'en_GB',
    'fr_FR',
    'de_DE',
    'es_ES',
    'it_IT',
    'ja_JP',
    'ko_KR',
    'pt_BR',
    'zh_CN',
    'zh_TW',
    'nl_NL',
    'ru_RU',
  ]) {
    add(parseLocaleString(identifier));
  }
  return [...values.values()];
}

const availableLocales = buildAvailableLocales();

/** Apache Commons Lang inspired locale utilities. */
class LocaleUtil {
  static availableLocaleList(): LocaleValue[] {
    return availableLocales.slice();
  }

  static availableLocaleSet(): Set<LocaleValue> {
    return new Set(availableLocales);
  }

  static countriesByLanguage(languageCode: string | null | undefined): LocaleValue[] {
    if (!languageCode) {
      return [];
    }
    return availableLocales.filter((locale) => locale.language === languageCode && locale.country.length > 0);
  }

  static isAvailableLocale(locale: LocaleLike | null | undefined): boolean {
    const value = fromLocale(locale);
    return value !== null && availableLocales.some((candidate) => candidate.toString() === value.toString());
  }

  static isLanguageUndetermined(locale: LocaleLike | null | undefined): boolean {
    const value = fromLocale(locale);
    return value === null || value.language.length === 0;
  }

  static languagesByCountry(countryCode: string | null | undefined): LocaleValue[] {
    if (!countryCode) {
      return [];
    }
    return availableLocales.filter((locale) => locale.country === countryCode && locale.language.length > 0);
  }

  static localeLookupList(locale: LocaleLike | null | undefined, defaultLocale?: LocaleLike | null): LocaleValue[] {
    const value = fromLocale(locale);
    if (value === null) {
      return defaultLocale === undefined || defaultLocale === null ? [] : [fromLocale(defaultLocale)!];
    }
    const result: LocaleValue[] = [];
    const add = (candidate: LocaleValue): void => {
      if (!result.some((existing) => existing.toString() === candidate.toString())) {
        result.push(candidate);
      }
    };

    const variants = value.variant ? value.variant.split('_') : [];
    for (let count = variants.length; count > 0; count -= 1) {
      add(new LocaleValue(value.language, value.country, variants.slice(0, count).join('_')));
    }
    if (value.country.length > 0) {
      add(new LocaleValue(value.language, value.country));
    }
    if (value.language.length > 0) {
      add(new LocaleValue(value.language));
    }
    if (defaultLocale !== undefined && defaultLocale !== null) {
      const fallback = fromLocale(defaultLocale);
      if (fallback !== null) {
        add(fallback);
      }
    }
    return result;
  }

  static toLocale(locale: LocaleLike | null | undefined): LocaleValue | null {
    if (locale === null || locale === undefined) {
      return null;
    }
    if (locale instanceof LocaleValue) {
      return locale;
    }
    if (typeof locale !== 'string') {
      return fromLocale(locale);
    }
    return parseLocaleString(locale);
  }
}

export default LocaleUtil;
