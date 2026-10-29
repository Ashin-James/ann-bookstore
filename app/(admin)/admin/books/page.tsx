'use client';

import React, { useState, useEffect } from 'react';
import { getAdminService } from '@/lib/admin/demo-admin-service';
import { BookRecord, VariantRecord } from '@/lib/admin/types';
import { money } from '@/src/config/site.config';
import {
  Edit3,
  Percent,
  X,
  Plus,
  Archive,
  Trash2,
  Undo2,
  Upload,
  BookOpen,
  Search,
} from 'lucide-react';

interface BookFormData {
  title: string;
  subtitle: string;
  slug: string;
  author: string;
  category: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  shortDescription: string;
  description: string;
  cover: string;
  coverAlt: string;
  paperbackPrice: string;
  paperbackStock: string;
  hardcoverPrice: string;
  hardcoverStock: string;
  ebookPrice: string;
}

const DEFAULT_FORM: BookFormData = {
  title: '',
  subtitle: '',
  slug: '',
  author: 'Ann',
  category: 'Novel',
  status: 'published',
  shortDescription: '',
  description: '',
  cover: 'quiet',
  coverAlt: '',
  paperbackPrice: '18.00',
  paperbackStock: '50',
  hardcoverPrice: '28.00',
  hardcoverStock: '30',
  ebookPrice: '9.99',
};

export default function AdminBooksPage() {
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookFormData>(DEFAULT_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  // Cost edit modal
  const [editingVariant, setEditingVariant] = useState<VariantRecord | null>(null);
  const [editCostDollars, setEditCostDollars] = useState('');
  const [bulkPercent, setBulkPercent] = useState('30');
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Delete modal
  const [deletingBook, setDeletingBook] = useState<BookRecord | null>(null);
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState('');

  // Toast / Undo
  const [toast, setToast] = useState<{
    message: string;
    onUndo?: () => Promise<void>;
  } | null>(null);

  const loadBooks = async () => {
    const service = getAdminService();
    const res = await service.listBooks();
    if (res.success) {
      setBooks(res.data);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const openAddModal = () => {
    setEditingBookId(null);
    setFormData(DEFAULT_FORM);
    setFormError(null);
    setIsBookModalOpen(true);
  };

  const openEditModal = (book: BookRecord) => {
    setEditingBookId(book.id);
    const pb = book.variants.find((v) => v.format.toLowerCase().includes('paperback'));
    const hc = book.variants.find((v) => v.format.toLowerCase().includes('hardcover'));
    const eb = book.variants.find((v) => v.format.toLowerCase().includes('ebook') || v.format.toLowerCase().includes('e-book'));

    setFormData({
      title: book.title,
      subtitle: book.subtitle || '',
      slug: book.slug,
      author: book.author || 'Ann',
      category: book.category,
      status: book.status,
      shortDescription: book.shortDescription,
      description: book.description,
      cover: book.cover,
      coverAlt: book.coverAlt || `Cover of ${book.title}`,
      paperbackPrice: pb ? (pb.price / 100).toFixed(2) : '18.00',
      paperbackStock: pb ? String(pb.stock) : '50',
      hardcoverPrice: hc ? (hc.price / 100).toFixed(2) : '28.00',
      hardcoverStock: hc ? String(hc.stock) : '30',
      ebookPrice: eb ? (eb.price / 100).toFixed(2) : '9.99',
    });
    setFormError(null);
    setIsBookModalOpen(true);
  };

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({
            ...prev,
            cover: reader.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Title is required.');
      return;
    }

    // Cover upload / specified requires alt text
    if (formData.cover && !formData.coverAlt.trim()) {
      setFormError('Cover upload requires alt text for accessibility.');
      return;
    }

    const service = getAdminService();
    const pbCents = Math.round(parseFloat(formData.paperbackPrice || '0') * 100);
    const hcCents = Math.round(parseFloat(formData.hardcoverPrice || '0') * 100);
    const ebCents = Math.round(parseFloat(formData.ebookPrice || '0') * 100);

    const variants: VariantRecord[] = [
      {
        id: `var_${Date.now()}_pb`,
        bookId: editingBookId || '',
        format: 'Paperback',
        price: pbCents > 0 ? pbCents : 1800,
        compareAtPrice: Math.round(pbCents * 1.15),
        cost: Math.round(pbCents * 0.3),
        isDemoCost: true,
        sku: `ANN-${formData.title.slice(0, 4).toUpperCase()}-PB`,
        stock: parseInt(formData.paperbackStock, 10) || 50,
        lowStockThreshold: 10,
        weightGrams: 380,
        signedEdition: false,
        personalization: false,
      },
    ];

    if (hcCents > 0) {
      variants.push({
        id: `var_${Date.now()}_hc`,
        bookId: editingBookId || '',
        format: 'Hardcover',
        price: hcCents,
        compareAtPrice: Math.round(hcCents * 1.15),
        cost: Math.round(hcCents * 0.4),
        isDemoCost: true,
        sku: `ANN-${formData.title.slice(0, 4).toUpperCase()}-HC`,
        stock: parseInt(formData.hardcoverStock, 10) || 30,
        lowStockThreshold: 10,
        weightGrams: 680,
        signedEdition: false,
        personalization: false,
      });
    }

    if (ebCents > 0) {
      variants.push({
        id: `var_${Date.now()}_eb`,
        bookId: editingBookId || '',
        format: 'E-book',
        price: ebCents,
        compareAtPrice: Math.round(ebCents * 1.15),
        cost: Math.round(ebCents * 0.05),
        isDemoCost: true,
        sku: `ANN-${formData.title.slice(0, 4).toUpperCase()}-EB`,
        stock: 9999,
        lowStockThreshold: 0,
        weightGrams: 0,
        signedEdition: false,
        personalization: false,
      });
    }

    if (editingBookId) {
      // Edit existing
      const res = await service.updateBook({
        id: editingBookId,
        book: {
          title: formData.title.trim(),
          subtitle: formData.subtitle.trim(),
          slug: formData.slug.trim(),
          author: formData.author.trim() || 'Ann',
          category: formData.category,
          status: formData.status,
          shortDescription: formData.shortDescription.trim(),
          description: formData.description.trim(),
          cover: formData.cover,
          coverAlt: formData.coverAlt.trim(),
          variants,
        },
        actorEmail: 'demo@annsbookstore.com',
        ipHash: 'demo_localhost',
      });

      if (res.success) {
        setIsBookModalOpen(false);
        loadBooks();
        setToast({
          message: `Updated book "${formData.title}".`,
        });
      } else {
        setFormError(res.error.message);
      }
    } else {
      // Create new
      const res = await service.createBook({
        book: {
          title: formData.title.trim(),
          subtitle: formData.subtitle.trim(),
          slug: formData.slug.trim(),
          author: formData.author.trim() || 'Ann',
          category: formData.category,
          status: formData.status,
          shortDescription: formData.shortDescription.trim(),
          description: formData.description.trim(),
          cover: formData.cover,
          coverAlt: formData.coverAlt.trim(),
          variants,
          tags: ['fiction', 'literary'],
          moods: ['reflective'],
        },
        actorEmail: 'demo@annsbookstore.com',
        ipHash: 'demo_localhost',
      });

      if (res.success) {
        setIsBookModalOpen(false);
        loadBooks();
        setToast({
          message: `Created book "${formData.title}".`,
        });
      } else {
        setFormError(res.error.message);
      }
    }
  };

  const handleToggleArchive = async (book: BookRecord) => {
    const service = getAdminService();
    const prevStatus = book.status;
    const res = await service.archiveBook({
      id: book.id,
      actorEmail: 'demo@annsbookstore.com',
      ipHash: 'demo_localhost',
    });

    if (res.success) {
      loadBooks();
      const newStatus = res.data.status;
      setToast({
        message: `Book "${book.title}" ${newStatus === 'archived' ? 'archived' : 'restored to published'}.`,
        onUndo: async () => {
          await service.updateBook({
            id: book.id,
            book: { status: prevStatus },
            actorEmail: 'demo@annsbookstore.com',
            ipHash: 'demo_localhost',
          });
          loadBooks();
          setToast(null);
        },
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBook) return;
    const bookToDelete = deletingBook;
    const service = getAdminService();
    const res = await service.deleteBook({
      id: bookToDelete.id,
      actorEmail: 'demo@annsbookstore.com',
      ipHash: 'demo_localhost',
    });

    if (res.success) {
      setDeletingBook(null);
      setDeleteConfirmTitle('');
      loadBooks();
      setToast({
        message: `Book "${bookToDelete.title}" deleted.`,
        onUndo: async () => {
          await service.restoreBook({
            book: bookToDelete,
            actorEmail: 'demo@annsbookstore.com',
            ipHash: 'demo_localhost',
          });
          loadBooks();
          setToast(null);
        },
      });
    }
  };

  const handleSaveCost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant) return;

    const parsedCents = Math.round(parseFloat(editCostDollars) * 100);
    if (isNaN(parsedCents) || parsedCents < 0) return;

    const service = getAdminService();
    const res = await service.updateVariantCost({
      variantId: editingVariant.id,
      costCents: parsedCents,
      actorEmail: 'demo@annsbookstore.com',
      ipHash: 'demo_localhost',
    });

    if (res.success) {
      setToast({ message: `Updated cost for ${editingVariant.sku} to ${money(parsedCents)}.` });
      setEditingVariant(null);
      loadBooks();
    }
  };

  const handleBulkSetCost = async (e: React.FormEvent) => {
    e.preventDefault();
    const pct = parseFloat(bulkPercent);
    if (isNaN(pct) || pct <= 0) return;

    const service = getAdminService();
    const res = await service.bulkSetVariantCosts({
      percentageOfPrice: pct,
      actorEmail: 'demo@annsbookstore.com',
      ipHash: 'demo_localhost',
    });

    if (res.success) {
      setToast({ message: `Successfully updated ${res.data.updatedCount} variant costs to ${pct}% of retail price.` });
      setShowBulkModal(false);
      loadBooks();
    }
  };

  const filteredBooks = books.filter((b) => {
    if (activeTab !== 'all' && b.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.category.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', margin: '0 0 6px', color: '#111827' }}>
            Book Catalogue & Production Costs
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
            Manage editions, inventory levels, SKUs, and unit production cost economics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowBulkModal(true)}
            style={{
              minHeight: '44px',
              padding: '10px 18px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#374151',
            }}
          >
            <Percent size={18} aria-hidden="true" />
            Bulk Set Cost as % of Price
          </button>

          <button
            onClick={openAddModal}
            data-testid="add-book-button"
            style={{
              minHeight: '44px',
              padding: '10px 18px',
              backgroundColor: '#722638',
              color: '#FFFFFF',
              border: 0,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Plus size={18} aria-hidden="true" />
            Add New Book
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E5E7EB', paddingBottom: '4px' }}>
          {(['all', 'published', 'draft', 'archived'] as const).map((tab) => {
            const count = tab === 'all' ? books.length : books.filter((b) => b.status === tab).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                data-testid={`tab-${tab}`}
                style={{
                  minHeight: '40px',
                  padding: '8px 16px',
                  border: 0,
                  backgroundColor: 'transparent',
                  borderBottom: isActive ? '2px solid #722638' : '2px solid transparent',
                  color: isActive ? '#722638' : '#6B7280',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{tab}</span>
                <span
                  style={{
                    fontSize: '12px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: isActive ? '#FDF2F4' : '#F3F4F6',
                    color: isActive ? '#722638' : '#4B5563',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search books"
            style={{
              width: '100%',
              minHeight: '40px',
              padding: '8px 12px 8px 36px',
              fontSize: '14px',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
            }}
          />
        </div>
      </div>

      {/* Books List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {filteredBooks.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px dashed #D1D5DB',
              borderRadius: '8px',
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <BookOpen size={36} aria-hidden="true" style={{ color: '#9CA3AF', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>
              No books found
            </h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 16px' }}>
              No books match your current filter or search criteria.
            </p>
            <button
              onClick={openAddModal}
              style={{
                minHeight: '44px',
                padding: '8px 18px',
                backgroundColor: '#722638',
                color: '#FFFFFF',
                border: 0,
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Add First Book
            </button>
          </div>
        ) : (
          filteredBooks.map((book) => {
            const isArchived = book.status === 'archived';
            const isDraft = book.status === 'draft';

            return (
              <div
                key={book.id}
                data-testid={`book-row-${book.slug}`}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  opacity: isArchived ? 0.75 : 1,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '64px',
                        borderRadius: '4px',
                        backgroundColor: '#1C3633',
                        backgroundImage: book.cover?.startsWith('data:') || book.cover?.startsWith('http') || book.cover?.startsWith('/') ? `url(${book.cover})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FAF2E6',
                        fontSize: '10px',
                        fontWeight: 700,
                        textAlign: 'center',
                        padding: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                      aria-label={book.coverAlt || `Cover of ${book.title}`}
                      role="img"
                    >
                      {!book.cover?.startsWith('data:') && !book.cover?.startsWith('http') && book.title.slice(0, 8)}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', fontWeight: 700, margin: 0, color: '#111827' }}>
                          {book.title}
                        </h2>
                        <span
                          data-testid={`book-status-${book.slug}`}
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            backgroundColor: isArchived ? '#F1F5F9' : isDraft ? '#FEF3C7' : '#ECFDF5',
                            color: isArchived ? '#475569' : isDraft ? '#92400E' : '#065F46',
                          }}
                        >
                          {book.status}
                        </span>
                      </div>
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>
                        {book.category} · by {book.author || 'Ann'} · slug: <code>{book.slug}</code>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => openEditModal(book)}
                      data-testid={`edit-book-${book.slug}`}
                      style={{
                        minHeight: '44px',
                        padding: '8px 14px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#374151',
                      }}
                    >
                      <Edit3 size={15} aria-hidden="true" />
                      Edit Book
                    </button>

                    <button
                      onClick={() => handleToggleArchive(book)}
                      data-testid={`archive-book-${book.slug}`}
                      style={{
                        minHeight: '44px',
                        padding: '8px 14px',
                        backgroundColor: isArchived ? '#F0FDF4' : '#F9FAFB',
                        border: isArchived ? '1px solid #BBF7D0' : '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: isArchived ? '#166534' : '#374151',
                      }}
                    >
                      <Archive size={15} aria-hidden="true" />
                      {isArchived ? 'Unarchive' : 'Archive'}
                    </button>

                    <button
                      onClick={() => {
                        setDeletingBook(book);
                        setDeleteConfirmTitle('');
                      }}
                      data-testid={`delete-book-${book.slug}`}
                      style={{
                        minHeight: '44px',
                        padding: '8px 14px',
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FECACA',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#B91C1C',
                      }}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>

                {/* Variants Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                        <th style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Format</th>
                        <th style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>SKU</th>
                        <th style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Price</th>
                        <th style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Unit Cost</th>
                        <th style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Margin</th>
                        <th style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Stock</th>
                        <th style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 600, color: '#4B5563', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {book.variants.map((v) => {
                        const margin = v.price > 0 ? Math.round(((v.price - v.cost) / v.price) * 100) : 0;
                        return (
                          <tr key={v.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 600 }}>{v.format}</td>
                            <td style={{ padding: '12px 14px', fontSize: '13px', color: '#6B7280', fontFamily: 'monospace' }}>{v.sku}</td>
                            <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 600 }}>{money(v.price)}</td>
                            <td style={{ padding: '12px 14px', fontSize: '14px' }}>
                              <span style={{ fontWeight: 600, color: '#111827' }}>{money(v.cost)}</span>
                              {v.isDemoCost && (
                                <span
                                  title="Demo estimate: replace with real costs"
                                  style={{
                                    marginLeft: '6px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#86198f',
                                    backgroundColor: '#fdf4ff',
                                    border: '1px solid #f5d0fe',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  Demo estimate
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 600, color: margin >= 50 ? '#065F46' : '#92400E' }}>
                              {margin}%
                            </td>
                            <td style={{ padding: '12px 14px', fontSize: '14px' }}>
                              {v.format.toLowerCase().includes('ebook') ? 'Digital' : `${v.stock} units`}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                              <button
                                onClick={() => {
                                  setEditingVariant(v);
                                  setEditCostDollars((v.cost / 100).toFixed(2));
                                }}
                                style={{
                                  border: 0,
                                  background: 'transparent',
                                  color: '#722638',
                                  fontWeight: 600,
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  minHeight: '44px',
                                }}
                              >
                                <Edit3 size={14} aria-hidden="true" />
                                Edit Cost
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Book Modal */}
      {isBookModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '28px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', fontWeight: 700, margin: 0 }}>
                {editingBookId ? 'Edit Book' : 'Add New Book to Catalogue'}
              </h3>
              <button
                onClick={() => setIsBookModalOpen(false)}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  minHeight: '44px',
                  minWidth: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Close modal"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#B91C1C',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  marginBottom: '16px',
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label htmlFor="book-title-input" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Title *
                  </label>
                  <input
                    id="book-title-input"
                    data-testid="book-title-input"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    style={{ width: '100%', minHeight: '44px', padding: '8px 12px', fontSize: '15px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label htmlFor="book-slug-input" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Slug (URL identifier)
                  </label>
                  <input
                    id="book-slug-input"
                    data-testid="book-slug-input"
                    type="text"
                    placeholder="Leave empty to auto-generate"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    style={{ width: '100%', minHeight: '44px', padding: '8px 12px', fontSize: '15px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <label htmlFor="book-category-input" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    id="book-category-input"
                    data-testid="book-category-input"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    style={{ width: '100%', minHeight: '44px', padding: '8px 12px', fontSize: '15px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                  >
                    <option value="Novel">Novel</option>
                    <option value="Essays">Essays</option>
                    <option value="E-book">E-book</option>
                    <option value="Poetry">Poetry</option>
                    <option value="Memoir">Memoir</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="book-status-input" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    id="book-status-input"
                    data-testid="book-status-input"
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as BookFormData['status'] }))}
                    style={{ width: '100%', minHeight: '44px', padding: '8px 12px', fontSize: '15px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="book-author-input" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Author
                  </label>
                  <input
                    id="book-author-input"
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                    style={{ width: '100%', minHeight: '44px', padding: '8px 12px', fontSize: '15px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="book-short-desc-input" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Spoiler-Free Short Summary *
                </label>
                <input
                  id="book-short-desc-input"
                  data-testid="book-short-desc-input"
                  type="text"
                  required
                  placeholder="One evocative sentence for bookshelf cards"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
                  style={{ width: '100%', minHeight: '44px', padding: '8px 12px', fontSize: '15px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label htmlFor="book-desc-input" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Full Synopsis / Description *
                </label>
                <textarea
                  id="book-desc-input"
                  data-testid="book-desc-input"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '15px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                />
              </div>

              {/* Cover Artwork & Required Alt Text */}
              <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                  Cover Artwork & Accessibility (Alt Text Required)
                </span>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label
                    htmlFor="cover-file-upload"
                    style={{
                      minHeight: '44px',
                      padding: '8px 16px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#374151',
                    }}
                  >
                    <Upload size={16} aria-hidden="true" />
                    Upload Cover File
                    <input
                      id="cover-file-upload"
                      data-testid="cover-file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <span style={{ fontSize: '13px', color: '#6B7280' }}>
                    or select preset style:
                  </span>

                  <select
                    value={formData.cover.startsWith('data:') ? 'custom' : formData.cover}
                    onChange={(e) => {
                      if (e.target.value !== 'custom') {
                        setFormData((prev) => ({ ...prev, cover: e.target.value }));
                      }
                    }}
                    style={{ minHeight: '44px', padding: '8px 12px', fontSize: '14px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                  >
                    <option value="quiet">Quiet (Forest Green Cloth)</option>
                    <option value="letters">Letters (Burgundy Cloth)</option>
                    <option value="map">Map (Indigo Navy Cloth)</option>
                    <option value="rain">Rain (Deep Slate Cloth)</option>
                    {formData.cover.startsWith('data:') && <option value="custom">Uploaded Image File</option>}
                  </select>
                </div>

                <div>
                  <label htmlFor="cover-alt-input" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Cover Alt Text <span style={{ color: '#DC2626' }}>* (Required)</span>
                  </label>
                  <input
                    id="cover-alt-input"
                    data-testid="cover-alt-input"
                    type="text"
                    required
                    placeholder="Describe cover visuals and typography for screen readers"
                    value={formData.coverAlt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, coverAlt: e.target.value }))}
                    style={{ width: '100%', minHeight: '44px', padding: '8px 12px', fontSize: '14px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                    Accessibility mandate: Cover upload strictly requires non-empty alt text.
                  </span>
                </div>
              </div>

              {/* Formats & Pricing */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <label htmlFor="pb-price-input" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Paperback Price ($ USD) *
                  </label>
                  <input
                    id="pb-price-input"
                    data-testid="pb-price-input"
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={formData.paperbackPrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paperbackPrice: e.target.value }))}
                    style={{ width: '100%', minHeight: '44px', padding: '8px 12px', fontSize: '15px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label htmlFor="hc-price-input" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Hardcover Price ($ USD)
                  </label>
                  <input
                    id="hc-price-input"
                    data-testid="hc-price-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.hardcoverPrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hardcoverPrice: e.target.value }))}
                    style={{ width: '100%', minHeight: '44px', padding: '8px 12px', fontSize: '15px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label htmlFor="eb-price-input" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    E-book Price ($ USD)
                  </label>
                  <input
                    id="eb-price-input"
                    data-testid="eb-price-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.ebookPrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ebookPrice: e.target.value }))}
                    style={{ width: '100%', minHeight: '44px', padding: '8px 12px', fontSize: '15px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  style={{ minHeight: '44px', padding: '8px 16px', border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="save-book-button"
                  style={{ minHeight: '44px', padding: '8px 22px', backgroundColor: '#722638', color: '#FFFFFF', border: 0, borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {editingBookId ? 'Save Changes' : 'Create Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Requires typing title) */}
      {deletingBook && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '28px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 10px', color: '#111827' }}>
              Remove Book: {deletingBook.title}
            </h3>
            <p style={{ fontSize: '14px', color: '#4B5563', margin: '0 0 14px' }}>
              This will remove the book from the catalogue. To confirm, please type the exact title:
            </p>
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#F3F4F6',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '14px',
                userSelect: 'none',
              }}
            >
              {deletingBook.title}
            </div>

            <input
              type="text"
              data-testid="delete-title-input"
              placeholder="Type exact title here"
              value={deleteConfirmTitle}
              onChange={(e) => setDeleteConfirmTitle(e.target.value)}
              aria-label="Confirm title to delete book"
              style={{ width: '100%', minHeight: '44px', padding: '8px 12px', fontSize: '15px', border: '1px solid #D1D5DB', borderRadius: '6px', marginBottom: '18px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setDeletingBook(null);
                  setDeleteConfirmTitle('');
                }}
                style={{ minHeight: '44px', padding: '8px 16px', border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-delete-button"
                disabled={deleteConfirmTitle.trim() !== deletingBook.title.trim()}
                onClick={handleConfirmDelete}
                style={{
                  minHeight: '44px',
                  padding: '8px 18px',
                  backgroundColor: deleteConfirmTitle.trim() === deletingBook.title.trim() ? '#DC2626' : '#9CA3AF',
                  color: '#FFFFFF',
                  border: 0,
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: deleteConfirmTitle.trim() === deletingBook.title.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Remove Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Cost Modal */}
      {editingVariant && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '28px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Set Cost: {editingVariant.sku}
              </h3>
              <button
                onClick={() => setEditingVariant(null)}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  minHeight: '44px',
                  minWidth: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Close cost modal"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSaveCost} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="variant-cost" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Unit Production Cost ($ USD)
                </label>
                <input
                  id="variant-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editCostDollars}
                  onChange={(e) => setEditCostDollars(e.target.value)}
                  style={{ width: '100%', minHeight: '44px', padding: '8px 12px', fontSize: '16px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                />
                <span style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                  Retail Price: {money(editingVariant.price)}.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingVariant(null)}
                  style={{ minHeight: '44px', padding: '8px 16px', border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ minHeight: '44px', padding: '8px 18px', backgroundColor: '#722638', color: '#FFFFFF', border: 0, borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Cost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Percentage Cost Modal */}
      {showBulkModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '28px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Bulk Set Cost as % of Price
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  minHeight: '44px',
                  minWidth: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Close bulk modal"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleBulkSetCost} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="bulk-percent-input" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Target Cost Percentage (% of Retail)
                </label>
                <input
                  id="bulk-percent-input"
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={bulkPercent}
                  onChange={(e) => setBulkPercent(e.target.value)}
                  style={{ width: '100%', minHeight: '44px', padding: '8px 12px', fontSize: '16px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  style={{ minHeight: '44px', padding: '8px 16px', border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ minHeight: '44px', padding: '8px 18px', backgroundColor: '#722638', color: '#FFFFFF', border: 0, borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Apply to All Variants
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast with Undo Action */}
      {toast && (
        <div
          role="status"
          data-testid="admin-toast"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#1F2937',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            zIndex: 10001,
          }}
        >
          <span style={{ fontSize: '14px' }}>{toast.message}</span>
          {toast.onUndo && (
            <button
              onClick={toast.onUndo}
              data-testid="toast-undo-button"
              style={{
                background: '#722638',
                border: '1px solid #991b1b',
                color: '#FFFFFF',
                padding: '6px 12px',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Undo2 size={14} aria-hidden="true" />
              Undo
            </button>
          )}
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'transparent',
              border: 0,
              color: '#9CA3AF',
              cursor: 'pointer',
              minHeight: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close notification"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
