// UrlUtils.test.ts
import UrlUtil from "../src/url.util";

Object.defineProperty(window, "location", {
  value: new URL("http://example.com?foo=bar#test"),
  configurable: true,
});

describe("Url utilities", () => {
  describe("getProtocol()", () => {
    test("getProtocol() should return the correct protocol", () => {
      expect(UrlUtil.getProtocol()).toBe("http:");
    });
  });

  describe("getHostName()", () => {
    test("getHostName() should return the correct hostname", () => {
      expect(UrlUtil.getHostName()).toBe("example.com");
    });
  });

  describe("getUrlParams()", () => {
    test("getUrlParams() should return the correct URLSearchParams object", () => {
      const params = UrlUtil.getUrlParams();
      expect(params instanceof URLSearchParams).toBe(true);
      expect(params.get("foo")).toBe("bar");
    });
  });

  describe("getAnchor()", () => {
    test("getAnchor should return the correct anchor (fragment identifier)", () => {
      expect(UrlUtil.getAnchor()).toBe("test");
    });
  });
});
