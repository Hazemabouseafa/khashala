'use client';

import React, { useEffect, useState } from 'react';
import { Globe, Megaphone } from 'lucide-react';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

interface TopTranslateBarProps {
  announcementText?: string;
  showAnnouncement?: boolean;
}

function getCurrentLangFromCookie(): 'ar' | 'en' {
  if (typeof document === 'undefined') return 'ar';
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (match && decodeURIComponent(match[1]).endsWith('/en')) {
    return 'en';
  }
  return 'ar';
}

function setGoogTransCookie(lang: 'ar' | 'en') {
  if (typeof document === 'undefined') return;
  const host = window.location.hostname;
  if (lang === 'ar') {
    document.cookie =
      'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host};`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${host};`;
  } else {
    const val = `/ar/${lang}`;
    document.cookie = `googtrans=${val}; path=/;`;
    if (host && host !== 'localhost') {
      document.cookie = `googtrans=${val}; path=/; domain=${host};`;
      document.cookie = `googtrans=${val}; path=/; domain=.${host};`;
    }
  }
}

export const TopTranslateBar: React.FC<TopTranslateBarProps> = ({
  announcementText,
  showAnnouncement,
}) => {
  const [activeLang, setActiveLang] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    const initialLang = getCurrentLangFromCookie();
    setActiveLang(initialLang);
    document.documentElement.dir = initialLang === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = initialLang;

    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'ar',
            includedLanguages: 'en,ar',
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    const existingScript = document.getElementById('google-translate-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }
  }, []);

  const switchLanguage = (targetLang: 'ar' | 'en') => {
    if (targetLang === activeLang && targetLang === getCurrentLangFromCookie()) {
      return;
    }

    setGoogTransCookie(targetLang);
    setActiveLang(targetLang);

    document.documentElement.dir = targetLang === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = targetLang;

    if (targetLang === 'ar') {
      // Reloading after clearing googtrans restores 100% clean original Arabic DOM
      window.location.reload();
      return;
    }

    const combo = document.querySelector(
      '.goog-te-combo'
    ) as HTMLSelectElement | null;

    if (combo) {
      combo.value = 'en';
      combo.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="bg-[#111827] text-white border-b border-slate-800 text-[11px] sm:text-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-9 sm:h-10 flex items-center justify-between gap-2">
        {/* Right Side: Announcement or Welcome Tagline */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showAnnouncement && announcementText ? (
            <>
              <Megaphone className="w-3.5 h-3.5 text-[#ef4444] shrink-0" />
              <span className="font-bold text-slate-100 truncate">
                {announcementText}
              </span>
            </>
          ) : (
            <span className="font-bold text-slate-300 truncate">
              مرحباً بكم في منصة خشاله للإعلانات المبوبة
            </span>
          )}
        </div>

        {/* Left Side: Google Translate Bar (Arabic <-> English) */}
        <div
          className="flex items-center gap-2 shrink-0 notranslate"
          translate="no"
        >
          <div className="hidden sm:flex items-center gap-1 text-slate-300 text-[11px] font-semibold">
            <Globe className="w-3.5 h-3.5 text-[#ef4444]" />
            <span>Google Translate:</span>
          </div>

          <div className="inline-flex items-center rounded-lg bg-slate-800/90 p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => switchLanguage('ar')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-colors cursor-pointer ${
                activeLang === 'ar'
                  ? 'bg-[#e00000] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => switchLanguage('en')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-colors cursor-pointer flex items-center gap-1 ${
                activeLang === 'en'
                  ? 'bg-[#e00000] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3 sm:hidden" />
              <span>English</span>
            </button>
          </div>

          {/* Hidden Mount Point for Official Google Translate Engine */}
          <div
            id="google_translate_element"
            className="google-translate-container"
          />
        </div>
      </div>
    </div>
  );
};
