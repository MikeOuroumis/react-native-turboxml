import { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { parseXml } from 'react-native-turboxml';
import { XMLParser } from 'fast-xml-parser';

// Generate a large XML string for benchmarking
function generateLargeXml(itemCount: number): string {
  let items = '';
  for (let i = 0; i < itemCount; i++) {
    items += `
    <item id="${i}">
      <name>Product ${i}</name>
      <description>This is a detailed description for product number ${i}. It contains multiple sentences to increase the size of the XML payload and make the benchmark more realistic.</description>
      <price>${(Math.random() * 1000).toFixed(2)}</price>
      <category>Category ${i % 10}</category>
      <inStock>${i % 2 === 0}</inStock>
      <metadata>
        <createdAt>2024-01-${String((i % 28) + 1).padStart(2, '0')}</createdAt>
        <updatedAt>2024-12-${String((i % 28) + 1).padStart(2, '0')}</updatedAt>
        <tags>
          <tag>tag${i}</tag>
          <tag>popular</tag>
          <tag>featured</tag>
        </tags>
      </metadata>
    </item>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <info>
    <name>Product Catalog</name>
    <version>1.0</version>
    <totalItems>${itemCount}</totalItems>
  </info>
  <items>${items}
  </items>
</catalog>`;
}

// fast-xml-parser instance
const fastXmlParser = new XMLParser();

function parseWithFastXml(xml: string): any {
  return fastXmlParser.parse(xml);
}

type ParserMode = 'js' | 'native';
type BenchmarkStatus = 'idle' | 'parsing' | 'done';

export default function App() {
  const [mode, setMode] = useState<ParserMode>('js');
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<BenchmarkStatus>('idle');
  const [parseTime, setParseTime] = useState<number | null>(null);
  const [xmlSize, setXmlSize] = useState<string>('');
  const [itemCount, setItemCount] = useState(5000);

  // JS-driven animations (will freeze when JS thread is blocked)
  const [rotation, setRotation] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 6) % 360);
      setFrameCount((prev) => prev + 1);
      // Update dots every 20 frames (~300ms)
      setDots((prev) => {
        const frame = frameCount % 20;
        if (frame === 0) return (prev % 3) + 1;
        return prev;
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [frameCount]);

  // Store pre-generated XML to avoid freeze during generation
  const [preGeneratedXml, setPreGeneratedXml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Pre-generate XML when item count changes
  useEffect(() => {
    setPreGeneratedXml(null);
    setIsGenerating(true);

    // Use setTimeout to not block UI during generation
    setTimeout(() => {
      const xml = generateLargeXml(itemCount);
      setPreGeneratedXml(xml);
      const sizeInKB = (new Blob([xml]).size / 1024).toFixed(1);
      const sizeInMB = (new Blob([xml]).size / (1024 * 1024)).toFixed(2);
      setXmlSize(`${sizeInKB} KB (${sizeInMB} MB)`);
      setIsGenerating(false);
    }, 100);
  }, [itemCount]);

  const runBenchmark = useCallback(async () => {
    if (!preGeneratedXml) return;

    setIsRunning(true);
    setStatus('idle');
    setParseTime(null);

    // Small delay before starting
    await new Promise((r) => setTimeout(r, 500));

    setStatus('parsing');

    // Allow UI to update before parsing
    await new Promise((r) => setTimeout(r, 100));

    const startTime = performance.now();

    try {
      if (mode === 'js') {
        // JS parsing - BLOCKS the JS thread, spinner freezes
        parseWithFastXml(preGeneratedXml);
      } else {
        // Native parsing - runs on native thread, spinner stays smooth
        await parseXml(preGeneratedXml);
      }

      const endTime = performance.now();
      setParseTime(endTime - startTime);
      setStatus('done');
    } catch (e) {
      setStatus('done');
    }

    setIsRunning(false);
  }, [mode, preGeneratedXml]);

  const formatTime = (ms: number | null) => {
    if (ms === null) return '--';
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const isJs = mode === 'js';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, isJs && styles.modeButtonActiveJs]}
            onPress={() => {
              setMode('js');
              setStatus('idle');
              setParseTime(null);
            }}
            disabled={isRunning}
          >
            <Text
              style={[
                styles.modeButtonText,
                isJs && styles.modeButtonTextActive,
              ]}
            >
              JS Parser
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, !isJs && styles.modeButtonActiveNative]}
            onPress={() => {
              setMode('native');
              setStatus('idle');
              setParseTime(null);
            }}
            disabled={isRunning}
          >
            <Text
              style={[
                styles.modeButtonText,
                !isJs && styles.modeButtonTextActive,
              ]}
            >
              TurboXML
            </Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: isJs ? '#ef4444' : '#22c55e' }]}>
          {isJs ? 'fast-xml-parser' : 'react-native-turboxml'}
        </Text>
        <Text style={styles.subtitle}>
          {isJs
            ? 'JavaScript (blocks UI thread)'
            : 'Native (background thread)'}
        </Text>

        {/* Spinner */}
        <View style={styles.spinnerContainer}>
          <View
            style={[
              styles.spinner,
              isJs ? styles.spinnerJs : styles.spinnerNative,
              { transform: [{ rotate: `${rotation}deg` }] },
            ]}
          >
            <View
              style={[
                styles.spinnerDot,
                isJs ? styles.spinnerDotJs : styles.spinnerDotNative,
              ]}
            />
          </View>

          {/* Status Label */}
          {status === 'parsing' && (
            <View
              style={[
                styles.statusOverlay,
                { backgroundColor: isJs ? '#ef4444' : '#22c55e' },
              ]}
            >
              <Text style={styles.statusOverlayText}>
                {isJs ? 'UI FROZEN!' : 'UI SMOOTH!'}
              </Text>
            </View>
          )}
        </View>

        {/* Frame Counter - freezes when JS thread is blocked */}
        <View style={styles.frameCounterContainer}>
          <Text style={styles.frameCounterLabel}>UI Frame Counter</Text>
          <Text
            style={[
              styles.frameCounterValue,
              { color: isJs ? '#ef4444' : '#22c55e' },
            ]}
          >
            {frameCount}
          </Text>
        </View>

        {/* Time Display */}
        <Text style={styles.timeLabel}>Parse Time</Text>
        {status === 'parsing' ? (
          <Text
            style={[styles.timeValue, { color: isJs ? '#ef4444' : '#22c55e' }]}
          >
            Parsing{'.'.repeat(dots)}
          </Text>
        ) : (
          <Text
            style={[styles.timeValue, { color: isJs ? '#ef4444' : '#22c55e' }]}
          >
            {formatTime(parseTime)}
          </Text>
        )}

        {/* Item Count Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>XML Items: {itemCount}</Text>
          <View style={styles.buttonRow}>
            {[5000, 10000, 20000, 30000].map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.sizeButton,
                  itemCount === count && styles.sizeButtonActive,
                ]}
                onPress={() => setItemCount(count)}
                disabled={isRunning}
              >
                <Text
                  style={[
                    styles.sizeButtonText,
                    itemCount === count && styles.sizeButtonTextActive,
                  ]}
                >
                  {count >= 1000 ? `${count / 1000}k` : count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Run Button */}
        <TouchableOpacity
          style={[
            styles.runButton,
            (isRunning || isGenerating) && styles.runButtonDisabled,
            { backgroundColor: isJs ? '#ef4444' : '#22c55e' },
          ]}
          onPress={runBenchmark}
          disabled={isRunning || isGenerating}
        >
          <Text style={styles.runButtonText}>
            {isGenerating
              ? 'Generating XML...'
              : isRunning
                ? 'Parsing...'
                : 'Parse XML'}
          </Text>
        </TouchableOpacity>

        {/* XML Size */}
        {xmlSize && <Text style={styles.xmlSize}>XML Size: {xmlSize}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 48,
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1e293b',
  },
  modeButtonActiveJs: {
    backgroundColor: '#ef4444',
  },
  modeButtonActiveNative: {
    backgroundColor: '#22c55e',
  },
  modeButtonText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 32,
  },
  spinnerContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  spinner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 6,
  },
  spinnerJs: {
    borderColor: '#ef4444',
    borderTopColor: 'transparent',
  },
  spinnerNative: {
    borderColor: '#22c55e',
    borderTopColor: 'transparent',
  },
  spinnerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  spinnerDotJs: {
    backgroundColor: '#ef4444',
  },
  spinnerDotNative: {
    backgroundColor: '#22c55e',
  },
  statusOverlay: {
    position: 'absolute',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusOverlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  frameCounterContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  frameCounterLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  frameCounterValue: {
    fontSize: 32,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  timeLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  selectorContainer: {
    width: '100%',
    marginBottom: 20,
  },
  selectorLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  sizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  sizeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  sizeButtonText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  sizeButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  runButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  runButtonDisabled: {
    opacity: 0.6,
  },
  runButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  xmlSize: {
    color: '#94a3b8',
    fontSize: 13,
  },
});
