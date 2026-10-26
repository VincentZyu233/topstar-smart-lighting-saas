import { useEffect, useState } from 'react';

export interface BrandConfig {
  platformName: string;
  subName: string;
  companyName: string;
  address: string;
  hotline: string;
  email: string;
  logoText: string;
}

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  platformName: '通士达智慧照明SaaS平台',
  subName: 'Smart Lighting SaaS',
  companyName: '通士达科技股份有限公司',
  address: '福建省厦门市同安区通士达科技园',
  hotline: '400-888-6688',
  email: 'smart-lighting@topstar.com',
  logoText: 'TOPSTAR 通士达',
};

const STORAGE_KEY = 'topstar_brand_config';
const EVENT_NAME = 'topstar-brand-updated';

export function getBrandConfig(): BrandConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_BRAND_CONFIG };
    return { ...DEFAULT_BRAND_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_BRAND_CONFIG };
  }
}

export function saveBrandConfig(config: BrandConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: config }));
  } catch (err) {
    console.error('Failed to save brand config:', err);
  }
}

export function resetBrandConfig(): BrandConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
    const defaults = { ...DEFAULT_BRAND_CONFIG };
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: defaults }));
    return defaults;
  } catch {
    return { ...DEFAULT_BRAND_CONFIG };
  }
}

export function useBrandConfig(): [BrandConfig, (next: BrandConfig) => void, () => void] {
  const [config, setConfig] = useState<BrandConfig>(getBrandConfig);

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getBrandConfig());
    };
    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return [config, saveBrandConfig, resetBrandConfig];
}
