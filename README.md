<p align="center">
  <img src="./assets/logo.png" alt="TurboXML – React Native XML Parser Logo" width="280" />
</p>

<h1 align="center">🚀 TurboXML – Fast XML Parser for React Native (TurboModules)</h1>

<p align="center">
  A blazing-fast, Android-native XML parser built for React Native’s New Architecture using Kotlin, JSI, and TurboModules.  
  <br />
  <strong>4× faster</strong> than <code>react-native-xml2js</code> in parsing large XML files.
</p>

---

## ⚡ Features

- ✅ 4× faster than `react-native-xml2js`
- ✅ Native multithreaded XML parsing on Android
- ✅ Powered by TurboModules + JSI (New Architecture support)
- ✅ Lightweight and fully typed (TypeScript ready)
- ✅ Designed for offline, map-heavy, or config-driven React Native apps

---

## 📦 Installation

```bash
npm install react-native-turboxml
# or
yarn add react-native-turboxml
```

Make sure **New Architecture** is enabled:

```bash
cd ios && RCT_NEW_ARCH_ENABLED=1 pod install && cd ..
```

> ⚠️ Currently supports **Android only**. iOS support planned for future releases.

---

## 🧪 Usage Example

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
        setParsedResult(\`Error: \${error.message}\`);
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

## ✅ Example Output

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

## 🚀 Why TurboXML?

If your app needs to parse large XML files — such as **offline maps**, **configuration files**, or **external data feeds** — `react-native-turboxml` offers a significant speed improvement over JavaScript-based parsers by leveraging native code, multithreading, and the React Native New Architecture (TurboModules + JSI).

---

## 🛠 Requirements

- React Native 0.71+ with **New Architecture enabled**
- Android 5+ (iOS support coming)
- TurboModule + JSI support (enabled by default in modern RN projects)

---

## 📚 API Reference

```ts
function parseXml(xml: string): Promise<Record<string, any>>;
```

---

### 🙌 Contribute or Sponsor

Got feature ideas or want to help bring iOS support? PRs welcome!
If this module helps your app or workflow, consider starring the repo or [reaching out](https://github.com/MikeOuroumis).
