'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useStore } from '@/contexts/store-context';
import { accountService } from '@/lib/account/service';
import { ReadingList, ReadingListItem } from '@/lib/account/types';
import AccountLayout from '@/components/account/account-layout';
import { useToast } from '@/components/account/account-toast';
import {
  Bookmark,
  Plus,
  Share2,
  Trash2,
  Edit2,
  ShoppingBag,
  MoveRight,
  Package,
  X,
} from 'lucide-react';

export default function ListsPage() {
  const { user } = useAuth();
  const { formatCurrency } = useLanguage();
  const { addToCart } = useStore();
  const { showToast } = useToast();

  const [lists, setLists] = useState<ReadingList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Create List Modal
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');

  // Rename List Modal
  const [renamingList, setRenamingList] = useState<ReadingList | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Move Item Modal
  const [itemToMove, setItemToMove] = useState<{ item: ReadingListItem; fromListId: string } | null>(null);
  const [targetListId, setTargetListId] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    accountService.getLists(user.id).then((res) => {
      setLists(res);
      if (res.length > 0) {
        setSelectedListId(res[0].id);
      }
      setLoading(false);
    });
  }, [user]);

  const currentList = lists.find((l) => l.id === selectedListId) || lists[0];

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newListName.trim()) return;
    try {
      const created = await accountService.createList(user.id, newListName.trim());
      setLists((prev) => [...prev, created]);
      setSelectedListId(created.id);
      setNewListName('');
      setIsCreatingList(false);
      showToast(`Created reading list "${created.name}"`, { type: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create list';
      showToast(msg, { type: 'error' });
    }
  };

  const handleRenameList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !renamingList || !renameValue.trim()) return;
    try {
      const updated = await accountService.renameList(user.id, renamingList.id, renameValue.trim());
      setLists((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setRenamingList(null);
      showToast(`Renamed list to "${updated.name}"`, { type: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to rename list';
      showToast(msg, { type: 'error' });
    }
  };

  const handleDeleteList = async (list: ReadingList) => {
    if (!user || list.isDefault) return;
    try {
      await accountService.deleteList(user.id, list.id);
      const remaining = lists.filter((l) => l.id !== list.id);
      setLists(remaining);
      if (selectedListId === list.id && remaining.length > 0) {
        setSelectedListId(remaining[0].id);
      }
      showToast(`Deleted list "${list.name}"`, { type: 'info' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete list';
      showToast(msg, { type: 'error' });
    }
  };

  const handleRemoveItem = async (listId: string, itemId: string) => {
    if (!user) return;
    try {
      const updated = await accountService.removeFromList(user.id, listId, itemId);
      setLists((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      showToast('Item removed from list', { type: 'info' });
    } catch {
      showToast('Failed to remove item', { type: 'error' });
    }
  };

  const handleMoveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !itemToMove || !targetListId) return;
    try {
      await accountService.moveBetweenLists(user.id, itemToMove.fromListId, targetListId, itemToMove.item.id);
      const refreshed = await accountService.getLists(user.id);
      setLists(refreshed);
      setItemToMove(null);
      showToast(`Moved "${itemToMove.item.title}" to destination list`, { type: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to move item';
      showToast(msg, { type: 'error' });
    }
  };

  const handleShareList = (list: ReadingList) => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/account/lists?shared=${list.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      showToast(`Shareable link copied to clipboard: ${list.name}`, { type: 'success' });
    } else {
      showToast(`List link: ${shareUrl}`, { type: 'info' });
    }
  };

  const handleAddToCart = (item: ReadingListItem) => {
    addToCart(item.bookId, `${item.bookId}-hardcover`, true);
    showToast(`Added "${item.title}" to your bag`, { type: 'success' });
  };

  return (
    <AccountLayout
      breadcrumbs={[{ label: 'Your Reading Lists' }]}
      title="Your Reading Lists"
      description="Curate your personal bibliographies, wishlists, and titles saved for upcoming seasons."
      action={
        <button
          type="button"
          onClick={() => {
            setNewListName('');
            setIsCreatingList(true);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: 'var(--wine)',
            color: 'var(--white)',
            border: 0,
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: '42px',
          }}
        >
          <Plus size={16} aria-hidden="true" />
          <span>Create New List</span>
        </button>
      }
    >
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
          Loading reading lists...
        </div>
      ) : lists.length === 0 ? (
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <Bookmark size={40} color="var(--taupe)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '0 0 8px' }}>
            No Reading Lists Yet
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '0 0 20px' }}>
            Create custom reading lists to organise wishlist titles and literary discoveries.
          </p>
        </div>
      ) : (
        <div>
          {/* List Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              borderBottom: '1px solid var(--line)',
              paddingBottom: '12px',
              marginBottom: '24px',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {lists.map((l) => {
              const isSelected = l.id === selectedListId;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setSelectedListId(l.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? 'var(--ink)' : 'var(--white)',
                    color: isSelected ? 'var(--paper)' : 'var(--ink)',
                    border: '1px solid var(--line)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    minHeight: '40px',
                  }}
                >
                  <span>{l.name}</span>
                  <span
                    style={{
                      background: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'var(--paper)',
                      color: isSelected ? 'var(--paper)' : 'var(--muted)',
                      fontSize: '12px',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                    }}
                  >
                    {l.items.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current List Header */}
          {currentList && (
            <div
              style={{
                background: 'var(--white)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '20px 24px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: 0, color: 'var(--ink)' }}>
                    {currentList.name}
                  </h2>
                  {currentList.isDefault && (
                    <span
                      style={{
                        background: 'var(--paper)',
                        border: '1px solid var(--line)',
                        color: 'var(--muted)',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Default Wishlist
                    </span>
                  )}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                  {currentList.items.length} book{currentList.items.length === 1 ? '' : 's'} in this list
                </p>
              </div>

              {/* List Actions */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleShareList(currentList)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: 'var(--paper)',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    minHeight: '38px',
                  }}
                >
                  <Share2 size={14} aria-hidden="true" />
                  <span>Share Link</span>
                </button>

                {!currentList.isDefault && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setRenamingList(currentList);
                        setRenameValue(currentList.name);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: 'var(--paper)',
                        border: '1px solid var(--line)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--ink)',
                        cursor: 'pointer',
                        minHeight: '38px',
                      }}
                    >
                      <Edit2 size={14} aria-hidden="true" />
                      <span>Rename</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteList(currentList)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: 'transparent',
                        border: '1px solid var(--line)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--terracotta)',
                        cursor: 'pointer',
                        minHeight: '38px',
                      }}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* List Items */}
          {currentList && currentList.items.length === 0 ? (
            <div
              style={{
                background: 'var(--white)',
                border: '1px dashed var(--line)',
                borderRadius: '8px',
                padding: '48px 24px',
                textAlign: 'center',
              }}
            >
              <Package size={36} color="var(--taupe)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '0 0 8px' }}>
                This list is currently empty
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '0 0 20px' }}>
                Explore the catalog to save titles to your reading lists.
              </p>
              <Link
                href="/shop"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: 'var(--wine)',
                  color: 'var(--white)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Browse Books
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {currentList?.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--white)',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '240px' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '80px',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        background: 'var(--paper)',
                        flexShrink: 0,
                        border: '1px solid var(--line)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.cover}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Package size={22} color="var(--taupe)" />
                      )}
                    </div>

                    <div>
                      <Link
                        href={`/books/${item.bookSlug || item.bookId}`}
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '18px',
                          fontWeight: 700,
                          color: 'var(--ink)',
                          textDecoration: 'none',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        {item.title}
                      </Link>
                      <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block' }}>
                        {item.category} · {formatCurrency(item.price)}
                      </span>
                    </div>
                  </div>

                  {/* Actions for this item */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        background: 'var(--ink)',
                        color: 'var(--paper)',
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        minHeight: '40px',
                      }}
                    >
                      <ShoppingBag size={14} aria-hidden="true" />
                      <span>Add to Bag</span>
                    </button>

                    {lists.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const other = lists.find((l) => l.id !== currentList.id);
                          setTargetListId(other?.id || '');
                          setItemToMove({ item, fromListId: currentList.id });
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          background: 'var(--paper)',
                          border: '1px solid var(--line)',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--ink)',
                          cursor: 'pointer',
                          minHeight: '40px',
                        }}
                      >
                        <MoveRight size={14} aria-hidden="true" />
                        <span>Move</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(currentList.id, item.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        background: 'transparent',
                        border: 0,
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--terracotta)',
                        cursor: 'pointer',
                        minHeight: '40px',
                      }}
                      aria-label={`Remove ${item.title} from list`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create List Modal */}
      {isCreatingList && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-list-dialog-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 18, 17, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <form
            onSubmit={handleCreateList}
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-monumental)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 id="create-list-dialog-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
                Create Reading List
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingList(false)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: '4px', minHeight: '36px' }}
                aria-label="Close dialog"
              >
                <X size={20} color="var(--muted)" />
              </button>
            </div>

            <label htmlFor="create-list-name-input" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              List Name *
            </label>
            <input
              id="create-list-name-input"
              type="text"
              placeholder="e.g. Autumn Poetry & Essays"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontSize: '15px',
                marginBottom: '20px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setIsCreatingList(false)}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '42px',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newListName.trim()}
                style={{
                  padding: '10px 20px',
                  background: 'var(--wine)',
                  color: 'var(--white)',
                  border: 0,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: newListName.trim() ? 'pointer' : 'not-allowed',
                  opacity: newListName.trim() ? 1 : 0.6,
                  minHeight: '42px',
                }}
              >
                Create List
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rename List Modal */}
      {renamingList && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-list-dialog-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 18, 17, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <form
            onSubmit={handleRenameList}
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-monumental)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 id="rename-list-dialog-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
                Rename List
              </h3>
              <button
                type="button"
                onClick={() => setRenamingList(null)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: '4px', minHeight: '36px' }}
                aria-label="Close dialog"
              >
                <X size={20} color="var(--muted)" />
              </button>
            </div>

            <label htmlFor="rename-list-name-input" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              New Name *
            </label>
            <input
              id="rename-list-name-input"
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontSize: '15px',
                marginBottom: '20px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setRenamingList(null)}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '42px',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!renameValue.trim()}
                style={{
                  padding: '10px 20px',
                  background: 'var(--wine)',
                  color: 'var(--white)',
                  border: 0,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: renameValue.trim() ? 'pointer' : 'not-allowed',
                  opacity: renameValue.trim() ? 1 : 0.6,
                  minHeight: '42px',
                }}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Move Item Modal */}
      {itemToMove && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="move-item-dialog-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 18, 17, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <form
            onSubmit={handleMoveItem}
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-monumental)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 id="move-item-dialog-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: 0, color: 'var(--ink)' }}>
                Move Item
              </h3>
              <button
                type="button"
                onClick={() => setItemToMove(null)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: '4px', minHeight: '36px' }}
                aria-label="Close dialog"
              >
                <X size={20} color="var(--muted)" />
              </button>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 16px' }}>
              Move <strong style={{ color: 'var(--ink)' }}>{itemToMove.item.title}</strong> to another reading list:
            </p>

            <select
              value={targetListId}
              onChange={(e) => setTargetListId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontSize: '15px',
                marginBottom: '20px',
              }}
            >
              {lists
                .filter((l) => l.id !== itemToMove.fromListId)
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
            </select>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setItemToMove(null)}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '42px',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  background: 'var(--wine)',
                  color: 'var(--white)',
                  border: 0,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '42px',
                }}
              >
                Confirm Move
              </button>
            </div>
          </form>
        </div>
      )}
    </AccountLayout>
  );
}
