import type { StoreConfig } from '../types';
import athlx from './athlx.json';
import verde from './verde.json';

export const stores: Record<string, StoreConfig> = {
  athlx: athlx as StoreConfig,
  verde: verde as StoreConfig,
};

export const DEFAULT_STORE_ID = 'athlx';
