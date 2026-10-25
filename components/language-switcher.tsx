'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Globe, Search, Check, X } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { SUPPORTED_LANGUAGES, LanguageConfig } from '@/src/config/languages';

interface LanguageSwitcherProps {
  variant?: 'header' | 'footer' | 'account' | 'default';
  compact?: boolean;
}

export default function LanguageSwitcher({
  variant = 'header',
  compact = false,
}: LanguageSwitcherProps) {
  const {
    language,
    config,
    setLanguage,
    t,
    suggestion,
    dismissSuggestion,
    acceptSuggestion,
  } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Suggested languages derived from browser preferences
  const suggestedLanguages = useMemo(() => {
    if (typeof navigator === 'undefined') return [];
    const browserLangs = navigator.languages || [navigator.language];
    const seen = new Set<string>();
    const list: LanguageConfig[] = [];

    for (const bl of browserLangs) {
      const norm = (bl || '').trim().toLowerCase();
      const match = SUPPORTED_LANGUAGES.find(
        (l) => l.code.toLowerCase() === norm || l.code.toLowerCase() === norm.split('-')[0]
      );
      if (match && !seen.has(match.code) && match.code !== language) {
        seen.add(match.code);
        list.push(match);
      }
    }
    return list.slice(0, 3);
  }, [language]);

  // Filter languages based on search query
  const filteredLanguages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return SUPPORTED_LANGUAGES;
    return SUPPORTED_LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Open popover
  const handleOpen = () => {
    setIsOpen(true);
    setSearchQuery('');
    setFocusedIndex(0);
  };

  // Close popover and restore focus to trigger
  const handleClose = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Select language
  const handleSelect = useCallback(
    async (code: string) => {
      await setLanguage(code);
      setIsOpen(false);
      triggerRef.current?.focus();
    },
    [setLanguage]
  );

  // Autofocus search input and trap focus when open
  useEffect(() => {
    if (isOpen) {
      const prevActive = document.activeElement;
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          handleClose();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % filteredLanguages.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + filteredLanguages.length) % filteredLanguages.length);
        } else if (e.key === 'Enter') {
          if (filteredLanguages[focusedIndex]) {
            e.preventDefault();
            handleSelect(filteredLanguages[focusedIndex].code);
          }
        } else if (e.key === 'Tab') {
          // Focus trap inside dialog
          if (!dialogRef.current) return;
          const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
        if (prevActive instanceof HTMLElement) {
          prevActive.focus();
        }
      };
    }
  }, [isOpen, filteredLanguages, focusedIndex, handleClose, handleSelect]);

  // Ensure focused item is visible in scrolling list
  useEffect(() => {
    if (isOpen && listRef.current) {
      const item = listRef.current.querySelector<HTMLElement>(`[data-index="${focusedIndex}"]`);
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={`lang-trigger-btn lang-trigger-${variant}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Language: ${config.name}. Open language selection menu.`}
        title={`Language: ${config.name}`}
      >
        <Globe size={18} aria-hidden="true" />
        <span className="lang-code-badge">{config.code.toUpperCase()}</span>
        {variant !== 'header' && !compact && (
          <span className="lang-full-label">{config.nativeName}</span>
        )}
      </button>

      {/* Suggestion Toast (First Visit Browser Language Suggestion) */}
      {suggestion && (
        <aside
          className="language-suggestion-toast"
          role="region"
          aria-label="Language suggestion"
        >
          <div className="suggestion-text">
            <span>{t('languageSuggestionBanner', { language: suggestion.nativeName })}</span>
          </div>
          <div className="suggestion-actions">
            <button
              type="button"
              className="suggestion-btn-switch"
              onClick={acceptSuggestion}
              aria-label={`Switch language to ${suggestion.name}`}
            >
              {t('languageSuggestionSwitch')}
            </button>
            <button
              type="button"
              className="suggestion-btn-dismiss"
              onClick={dismissSuggestion}
              aria-label={t('languageSuggestionDismiss')}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </aside>
      )}

      {/* Popover / Sheet Dialog */}
      {isOpen && (
        <div className="lang-dialog-backdrop" onClick={handleClose}>
          <div
            ref={dialogRef}
            className="lang-dialog-container"
            role="dialog"
            aria-modal="true"
            aria-label={t('languagePickerTitle')}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle for Mobile */}
            <div className="sheet-drag-handle" aria-hidden="true" />

            {/* Header */}
            <div className="lang-dialog-header">
              <div className="dialog-title-wrap">
                <Globe size={20} className="dialog-icon" aria-hidden="true" />
                <h2 id="language-dialog-title" className="dialog-title">
                  {t('languagePickerTitle')}
                </h2>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={handleClose}
                aria-label={t('navClose')}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Search Input */}
            <div className="lang-search-box">
              <Search size={18} className="search-icon" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="search"
                className="lang-search-input"
                placeholder={t('languagePickerSearch')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFocusedIndex(0);
                }}
                aria-label={t('languagePickerSearch')}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label={t('searchClear')}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Language Scroll Area */}
            <div ref={listRef} className="lang-scroll-list" role="listbox">
              {/* Suggested Languages */}
              {!searchQuery && suggestedLanguages.length > 0 && (
                <div className="lang-group">
                  <div className="lang-group-title">{t('languagePickerSuggested')}</div>
                  {suggestedLanguages.map((l) => (
                    <button
                      key={`suggested-${l.code}`}
                      type="button"
                      className="lang-option-btn suggested"
                      onClick={() => handleSelect(l.code)}
                      title={l.name}
                      aria-label={`Switch language to ${l.name}`}
                      aria-pressed={language === l.code}
                    >
                      <div className="lang-names">
                        <span className="lang-native">{l.nativeName}</span>
                        <span className="lang-english">{l.name}</span>
                      </div>
                      <span className="lang-code-pill">{l.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* All / Filtered Languages */}
              <div className="lang-group">
                <div className="lang-group-title">
                  {searchQuery ? `${filteredLanguages.length} Results` : t('languagePickerAll')}
                </div>
                {filteredLanguages.map((l, idx) => {
                  const isSelected = language === l.code;
                  const isKeyboardFocused = idx === focusedIndex;

                  return (
                    <button
                      key={l.code}
                      type="button"
                      data-index={idx}
                      className={`lang-option-btn ${isSelected ? 'is-selected' : ''} ${
                        isKeyboardFocused ? 'is-keyboard-focused' : ''
                      }`}
                      onClick={() => handleSelect(l.code)}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      title={l.name}
                      aria-label={`Switch language to ${l.name}`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="lang-names">
                        <span className="lang-native" style={{ fontFamily: l.fontStack }}>
                          {l.nativeName}
                        </span>
                        <span className="lang-english">{l.name}</span>
                      </div>
                      <div className="lang-status-end">
                        <span className="lang-code-pill">{l.code.toUpperCase()}</span>
                        {isSelected && (
                          <span className="lang-check" aria-hidden="true">
                            <Check size={18} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {filteredLanguages.length === 0 && (
                  <div className="lang-no-results">
                    <p>{t('searchNoResults')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
