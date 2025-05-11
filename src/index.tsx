import Turboxml from './NativeTurboxml';

export function parseXml(xml: string): Promise<Record<string, unknown>> {
  return Turboxml.parseXml(xml);
}
