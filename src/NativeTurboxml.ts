import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  parseXml(xml: string): Promise<Record<string, unknown>>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Turboxml');
