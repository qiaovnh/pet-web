import type { Dict, DictKey } from './dictionaries/en';

export type TVars = Record<string, string | number>;

export function translate(dict: Dict, key: DictKey, vars?: TVars): string {
  let out = dict[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      out = out.split(`{${name}}`).join(String(value));
    }
  }
  return out;
}

export type T = (key: DictKey, vars?: TVars) => string;

export function makeT(dict: Dict): T {
  return (key, vars) => translate(dict, key, vars);
}
