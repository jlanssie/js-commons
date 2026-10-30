import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Utils from '../src/_index.ts';

describe('public index', () => {
  it('exports every utility module', () => {
    assert.equal(typeof Utils.ArrayUtils.add, 'function');
    assert.equal(typeof Utils.BooleanUtils.and, 'function');
    assert.equal(typeof Utils.ClassUtils.getName, 'function');
    assert.equal(typeof Utils.CollectionUtils.size, 'function');
    assert.equal(typeof Utils.EnumUtils.getEnumList, 'function');
    assert.equal(typeof Utils.LocaleUtils.toLocale, 'function');
    assert.equal(typeof Utils.ObjectUtils.isEmpty, 'function');
    assert.equal(typeof Utils.StringUtils.isBlank, 'function');
    assert.equal(typeof Utils.UrlUtils.getProtocol, 'function');
  });
});
