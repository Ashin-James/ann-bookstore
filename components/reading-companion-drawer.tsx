'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  X,
  Send,
  ArrowRight,
} from 'lucide-react';
import { companionAI, AIProgress } from '@/lib/companion-ai';
import { CompanionResponse } from '@/lib/companion-rules';
import { Cover } from '@/components/book-card';
import { useStore } from '@/contexts/store-context';
import { useLanguage } from '@/contexts/language-context';
import { money } from '@/src/config/site.config';

interface Message {
  id: string;
  sender: 'user' | 'companion';
  text: string;
  response?: CompanionResponse;
  timestamp: string;
}

export default function ReadingCompanionDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'companion',
      text: "Hello, reader. I am Ann's reading companion—here to help you find a story that matches your day, weather, or mood. How are you feeling, or what kind of journey are you looking for?",
      response: {
        text: '',
        suggestedQueries: [
          "I've been feeling lonely lately.",
          'Recommend a book for a rainy afternoon.',
          'Tell me about The Quiet Hours without spoilers.',
          'Where should I begin with Ann’s work?',
        ],
      },
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [useNeural, _setUseNeural] = useState(false);
  const [, setAiProgress] = useState<AIProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const { addToCart } = useStore();
  const { t, language } = useLanguage();

  useEffect(() => {
    const unsub = companionAI.onProgress(setAiProgress);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      triggerRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }

      // Trap focus
      if (e.key === 'Tab' && isOpen && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputValue('');
    setIsTyping(true);

    const delay = companionAI.getNaturalDelay();
    setTimeout(async () => {
      const response = await companionAI.generateReply(textToSend, useNeural, language);

      // Auto add to cart if requested by user
      if (response.bookToAddToCart) {
        addToCart(response.bookToAddToCart.bookId, response.bookToAddToCart.formatId, false);
      }

      const companionMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'companion',
        text: response.text,
        response,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, companionMsg]);
      setIsTyping(false);
    }, delay);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 'max(20px, env(safe-area-inset-bottom))',
          right: '20px',
          zIndex: 'var(--z-sticky)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 20px',
          minHeight: '48px',
          minWidth: '44px',
          backgroundColor: 'var(--wine)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '30px',
          boxShadow: '0 8px 24px rgba(126, 51, 70, 0.35)',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          fontWeight: 500,
          letterSpacing: '0.02em',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        aria-label="Open AI Reading Companion"
      >
        <Sparkles size={18} aria-hidden="true" />
        <span>{t('companionButton')}</span>
      </button>

      {/* Slide-over Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Reading Companion"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(20, 18, 15, 0.6)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {/* Drawer Container */}
          <div
            ref={panelRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              height: '100%',
              backgroundColor: 'var(--paper)',
              borderLeft: '1px solid var(--line)',
              boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--line)',
                backgroundColor: 'rgba(246, 240, 231, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--wine)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '20px',
                    fontWeight: 600,
                  }}
                  aria-hidden="true"
                >
                  A
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: 0, color: 'var(--ink)' }}>
                    {t('companionTitle')}
                  </h3>
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                    Literary guide
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  border: 0,
                  background: 'transparent',
                  minWidth: '44px',
                  minHeight: '44px',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Close reading companion"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '100%',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '14px 16px',
                      borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      backgroundColor: m.sender === 'user' ? 'var(--wine)' : 'var(--white)',
                      color: m.sender === 'user' ? '#fff' : 'var(--ink)',
                      border: m.sender === 'user' ? 'none' : '1px solid var(--line)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      fontSize: '15px',
                      lineHeight: 1.6,
                      fontFamily: m.sender === 'user' ? 'var(--font-sans)' : 'var(--font-serif)',
                    }}
                  >
                    {m.text}

                    {/* Book Recommendations */}
                    {m.response?.suggestedBooks && m.response.suggestedBooks.length > 0 && (
                      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {m.response.suggestedBooks.map((book) => {
                          const primaryFormat = book.formats[0];
                          return (
                            <div
                              key={book.id}
                              style={{
                                display: 'flex',
                                gap: '12px',
                                padding: '10px',
                                background: 'rgba(0,0,0,0.03)',
                                borderRadius: '8px',
                                border: '1px solid var(--line)',
                                alignItems: 'center',
                              }}
                            >
                              <div
                                style={{
                                  width: '44px',
                                  height: '60px',
                                  flexShrink: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                aria-hidden="true"
                              >
                                <Cover book={book} size="xs" />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <strong style={{ fontSize: '15px', display: 'block', color: 'var(--ink)' }}>
                                  {book.title}
                                </strong>
                                <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                                  {money(primaryFormat.price)} · {primaryFormat.name}
                                </span>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                                  <Link
                                    href={`/books/${book.slug}`}
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                      fontSize: '14px',
                                      fontWeight: 600,
                                      color: 'var(--wine)',
                                      textDecoration: 'underline',
                                      minHeight: '44px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                    }}
                                  >
                                    View book
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => addToCart(book.id, primaryFormat.id, true)}
                                    style={{
                                      border: 0,
                                      background: 'transparent',
                                      fontSize: '14px',
                                      fontWeight: 600,
                                      color: 'var(--ink)',
                                      cursor: 'pointer',
                                      minHeight: '44px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                    }}
                                  >
                                    + Add to bag
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Action Links */}
                    {m.response?.actionLinks && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                        {m.response.actionLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            style={{
                              fontSize: '14px',
                              padding: '8px 14px',
                              minHeight: '44px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(126, 51, 70, 0.08)',
                              color: 'var(--wine)',
                              fontWeight: 600,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span>{link.label}</span>
                            <ArrowRight size={14} aria-hidden="true" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Suggested Quick Questions */}
                  {m.response?.suggestedQueries && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginTop: '10px',
                        paddingLeft: '4px',
                      }}
                    >
                      {m.response.suggestedQueries.map((query) => (
                        <button
                          key={query}
                          type="button"
                          onClick={() => handleSend(query)}
                          style={{
                            border: '1px solid var(--line)',
                            background: 'var(--white)',
                            color: 'var(--ink)',
                            fontSize: '14px',
                            padding: '8px 14px',
                            minHeight: '44px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '14px' }}>
                  <Sparkles size={16} className="animate-spin" aria-hidden="true" />
                  <span>Ann’s companion is reflecting...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div
              style={{
                padding: '16px 20px',
                paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                borderTop: '1px solid var(--line)',
                backgroundColor: 'var(--white)',
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--paper)',
                  borderRadius: '24px',
                  padding: '4px 12px',
                  border: '1px solid var(--line)',
                  minHeight: '48px',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t('companionInputPlaceholder')}
                  style={{
                    flex: 1,
                    border: 0,
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '16px !important',
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--ink)',
                    minHeight: '44px',
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  style={{
                    border: 0,
                    background: inputValue.trim() ? 'var(--wine)' : 'transparent',
                    color: inputValue.trim() ? '#fff' : 'var(--muted)',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: inputValue.trim() ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                  }}
                  aria-label="Send query to companion"
                >
                  <Send size={18} />
                </button>
              </form>

              <span
                style={{
                  display: 'block',
                  textAlign: 'center',
                  fontSize: '14px',
                  color: 'var(--muted)',
                  marginTop: '10px',
                }}
              >
                {t('companionDisclaimer')}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
