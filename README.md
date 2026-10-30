# JS Commons

JS Commons is a library with common utilities for modern JavaScript & TypeScript.

## Installation

Use JavaScript Package Manager [npm](https://www.npmjs.com/) to install JS Commons.

```bash
npm install @jlanssie/js-commons
```

## Usage

Import the package in any JavaScript or TypeScript file.

```javascript
import { ArrayUtils, BooleanUtils, ClassUtils, CollectionUtils, EnumUtils, LocaleUtils, ObjectUtils, StringUtils, UrlUtils } from '@jlanssie/js-commons';

StringUtils.isBlank('  '); // true
ArrayUtils.add([1, 2], 3); // [1, 2, 3]
CollectionUtils.intersection([1, 2], [2, 3]); // [2]
UrlUtils.getProtocol();
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[GNU GPL 3.0](https://www.gnu.org/licenses/gpl-3.0.en.html)
