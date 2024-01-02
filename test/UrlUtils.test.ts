// UrlUtils.test.ts
import UrlUtils from './../src/urlUtils';

Object.defineProperty(window, "location", {
  value: new URL("http://example.com?foo=bar#test"),
  configurable: true,
});

describe('UrlUtils', () => {
  test('getProtocol should return the correct protocol', () => {
    expect(UrlUtils.getProtocol()).toBe('http:');
  });

  test('getHostName should return the correct hostname', () => {
    expect(UrlUtils.getHostName()).toBe('example.com');
  });

  test('getUrlParams should return the correct URLSearchParams object', () => {
    const params = UrlUtils.getUrlParams();
    expect(params instanceof URLSearchParams).toBe(true);
    expect(params.get('foo')).toBe('bar');
  });

  test('getAnchor should return the correct anchor (fragment identifier)', () => {
    expect(UrlUtils.getAnchor()).toBe('test');
  });
});
