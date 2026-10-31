'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface BrandingConfig {
  siteLogoUrl: string;
  iconColor: string;
  iconBgColor: string;
}

interface BrandingContextValue extends BrandingConfig {
  updateBranding: (partial: Partial<BrandingConfig>) => void;
  refreshBranding: () => Promise<void>;
}

const DEFAULT_BRANDING: BrandingConfig = {
  siteLogoUrl: '',
  iconColor: '#dc2626',
  iconBgColor: '#ffffff',
};

const BrandingContext = createContext<BrandingContextValue>({
  ...DEFAULT_BRANDING,
  updateBranding: () => {},
  refreshBranding: async () => {},
});

export const useBranding = () => useContext(BrandingContext);

export const BrandingProvider: React.FC<{
  initialBranding?: Partial<BrandingConfig>;
  children: React.ReactNode;
}> = ({ initialBranding, children }) => {
  const [branding, setBranding] = useState<BrandingConfig>({
    siteLogoUrl: initialBranding?.siteLogoUrl ?? DEFAULT_BRANDING.siteLogoUrl,
    iconColor: initialBranding?.iconColor || DEFAULT_BRANDING.iconColor,
    iconBgColor: initialBranding?.iconBgColor || DEFAULT_BRANDING.iconBgColor,
  });

  const applyCssVariables = useCallback((cfg: BrandingConfig) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--platform-icon-color', cfg.iconColor);
      document.documentElement.style.setProperty('--platform-icon-bg', cfg.iconBgColor);
    }
  }, []);

  const refreshBranding = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.settings) {
        const next: BrandingConfig = {
          siteLogoUrl: data.settings.siteLogoUrl ?? '',
          iconColor: data.settings.iconColor || DEFAULT_BRANDING.iconColor,
          iconBgColor: data.settings.iconBgColor || DEFAULT_BRANDING.iconBgColor,
        };
        setBranding(next);
        applyCssVariables(next);
      }
    } catch {
      // Keep current branding on network error
    }
  }, [applyCssVariables]);

  const updateBranding = useCallback(
    (partial: Partial<BrandingConfig>) => {
      setBranding((prev) => {
        const next = { ...prev, ...partial };
        applyCssVariables(next);
        return next;
      });
    },
    [applyCssVariables]
  );

  useEffect(() => {
    applyCssVariables(branding);
  }, [branding, applyCssVariables]);

  useEffect(() => {
    const handler = () => {
      refreshBranding();
    };
    window.addEventListener('khashala_branding_updated', handler);
    return () => window.removeEventListener('khashala_branding_updated', handler);
  }, [refreshBranding]);

  return (
    <BrandingContext.Provider
      value={{
        ...branding,
        updateBranding,
        refreshBranding,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
};
