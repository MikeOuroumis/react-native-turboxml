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
