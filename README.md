<p align="center">
  <img src="./assets/logo.png" alt="TurboXML Logo" width="160" />
</p>

# 🚀 react-native-turboxml

A blazing-fast, native XML parser for React Native — **4× faster** than `react-native-xml2js`.

Built with native Kotlin (Android) and Objective-C (iOS), TurboXML gives you fast and reliable XML parsing using the New Architecture (TurboModules + JSI).

---

## ⚡️ Features

- ✅ 4× faster than `react-native-xml2js`
- ✅ Native performance with multithreaded parsing
- ✅ TurboModule + JSI support (New Architecture ready)
- ✅ Easy to install and use
- ✅ Fully typed API (TypeScript support)

---

## 📦 Installation

```bash
npm install react-native-turboxml
# or
yarn add react-native-turboxml
```

Make sure New Architecture is enabled in your React Native project. Then:

```bash
cd ios && RCT_NEW_ARCH_ENABLED=1 pod install && cd ..
```

---

## Usage

```tsx
import { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { parseXml } from 'react-native-turboxml';

export default function App() {
  const [parsedResult, setParsedResult] = useState<string | null>(null);

  useEffect(() => {
    const xml = `
      <config>
        <title>TurboXML</title>
        <enabled>true</enabled>
        <version>1.0</version>
      </config>
    `;

    parseXml(xml)
      .then((result) => {
        setParsedResult(JSON.stringify(result, null, 2));
      })
      .catch((error) => {
        setParsedResult(`Error: ${error.message}`);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parsed XML:</Text>
      <Text style={styles.output}>{parsedResult}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  output: {
    fontFamily: 'monospace',
  },
});
```

---

## Example Output

```json
{
  "config": {
    "title": ["TurboXML"],
    "enabled": ["true"],
    "version": ["1.0"]
  }
}
```

---

## Why TurboXML?

If you're working with large XML files or parsing frequently (e.g., for maps, configs, or offline content), TurboXML cuts parsing time down from **35s to \~5s** compared to JS-based solutions.

---

## 🛠️ Requirements

- React Native 0.71+ (New Architecture enabled)
- iOS 11+ / Android 5+
- TurboModule support enabled (default in recent RN versions)

---

## 📚 API

```ts
function parseXml(xml: string): Promise<Record<string, any>>;
```
