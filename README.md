<p align="center">
  <img src="./assets/logo.png" alt="TurboXML – React Native XML Parser Logo" width="280" />
</p>

<h1 align="center">TurboXML – Fast Native XML Parser for React Native</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/react-native-turboxml"><img src="https://img.shields.io/npm/v/react-native-turboxml.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/react-native-turboxml"><img src="https://img.shields.io/npm/dm/react-native-turboxml.svg" alt="npm downloads" /></a>
  <a href="https://github.com/MikeOuroumis/react-native-turboxml/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/react-native-turboxml.svg" alt="license" /></a>
</p>

<p align="center">
  A high-performance native XML parser for React Native using TurboModules and the New Architecture.
  <br />
  <strong>4× faster</strong> than JavaScript-based parsers like <code>react-native-xml2js</code>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Android-3DDC84?logo=android&logoColor=white" alt="Android" />
  <img src="https://img.shields.io/badge/iOS-000000?logo=apple&logoColor=white" alt="iOS" />
</p>

---

## Features

- **Native performance** – Parses XML natively on both platforms (Kotlin on Android, Objective-C on iOS)
- **TurboModules + JSI** – Built for React Native's New Architecture
- **Async & non-blocking** – Parsing runs on background threads
- **Fully typed** – TypeScript definitions included
- **Simple API** – Single function, returns a Promise

---

## Installation

```bash
npm install react-native-turboxml
# or
yarn add react-native-turboxml
```

### iOS

```bash
cd ios && pod install
```

### Requirements

- React Native 0.71+
- New Architecture enabled
- Android 5.0+ / iOS 13.0+

---

## Usage

```tsx
import { parseXml } from 'react-native-turboxml';

const xml = `
  <config>
    <title>TurboXML</title>
    <enabled>true</enabled>
    <version>1.0</version>
  </config>
`;

const result = await parseXml(xml);
console.log(result);
```

### Output

```json
{
  "config": {
    "title": "TurboXML",
    "enabled": "true",
    "version": "1.0"
  }
}
```

---

## API

```ts
function parseXml(xml: string): Promise<Record<string, unknown>>;
```

| Parameter | Type     | Description             |
| --------- | -------- | ----------------------- |
| `xml`     | `string` | The XML string to parse |

**Returns:** A Promise that resolves to a JavaScript object representing the parsed XML.

---

## Why TurboXML?

JavaScript-based XML parsers run on the JS thread and can block your UI during large file parsing. TurboXML uses native code on both platforms:

- **Android**: Jackson XmlMapper with Kotlin coroutines
- **iOS**: NSXMLParser with GCD

This means parsing happens on background threads and communicates directly via JSI – no bridge serialization overhead.

### Use cases

- Offline maps and geospatial data (KML, GPX)
- Configuration files
- API responses in XML format
- Data import/export

---

## Comparison

| Parser                    | Native | New Architecture   | Async |
| ------------------------- | ------ | ------------------ | ----- |
| **react-native-turboxml** | Yes    | Yes (TurboModules) | Yes   |
| react-native-xml2js       | No     | No                 | Yes   |
| fast-xml-parser           | No     | No                 | No    |

---

## Contributing

Contributions are welcome! Feel free to open issues or submit PRs.

## License

MIT
