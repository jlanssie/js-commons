import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import UrlUtil from '../src/url.util.ts';

Object.defineProperty(globalThis, 'location', {
  configurable: true,
  value: new URL('http://example.com/?foo=bar#test'),
});

describe('Url utilities', () => {
  describe('getProtocol()', () => {
    it('should return the correct protocol', () => {
      assert.equal(UrlUtil.getProtocol(), 'http:');
    });
  });

  describe('getHostName()', () => {
    it('should return the correct hostname', () => {
      assert.equal(UrlUtil.getHostName(), 'example.com');
    });
  });

  describe('getUrlParams()', () => {
    it('should return the correct URLSearchParams object', () => {
      const params = UrlUtil.getUrlParams();
      assert.ok(params instanceof URLSearchParams);
      assert.equal(params.get('foo'), 'bar');
    });
  });

  describe('getAnchor()', () => {
    it('should return the correct anchor (fragment identifier)', () => {
      assert.equal(UrlUtil.getAnchor(), 'test');
    });
  });
});
