'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { accountService } from '@/lib/account/service';
import { UserAddress } from '@/lib/account/types';
import AccountLayout from '@/components/account/account-layout';
import { useToast } from '@/components/account/account-toast';
import { US_STATES, validateUSAddress } from '@/src/lib/validation/address';
import {
  MapPin,
  Plus,
  Check,
  X,
} from 'lucide-react';

export default function AddressesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    street: '',
    apartment: '',
    city: '',
    state: 'OR',
    postalCode: '',
    country: 'United States',
    phone: '',
    isDefault: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    accountService.getAddresses(user.id).then((res) => {
      setAddresses(res);
      setLoading(false);
    });
  }, [user]);

  const openCreateModal = () => {
    setFormData({
      fullName: user?.name || '',
      street: '',
      apartment: '',
      city: '',
      state: 'OR',
      postalCode: '',
      country: 'United States',
      phone: '',
      isDefault: addresses.length === 0,
    });
    setFormErrors({});
    setIsCreatingNew(true);
    setEditingAddress(null);
  };

  const openEditModal = (addr: UserAddress) => {
    setFormData({
      fullName: addr.fullName,
      street: addr.street,
      apartment: addr.apartment || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country || 'United States',
      phone: addr.phone || '',
      isDefault: addr.isDefault,
    });
    setFormErrors({});
    setEditingAddress(addr);
    setIsCreatingNew(false);
  };

  const closeModal = () => {
    setIsCreatingNew(false);
    setEditingAddress(null);
    setFormErrors({});
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate using validateUSAddress
    const validation = validateUSAddress({
      fullName: formData.fullName,
      addressLine1: formData.street,
      city: formData.city,
      state: formData.state,
      zip: formData.postalCode,
    });

    if (!validation.isValid) {
      const errMap: Record<string, string> = {};
      if (validation.errors.fullName) errMap.fullName = validation.errors.fullName;
      if (validation.errors.addressLine1) errMap.street = validation.errors.addressLine1;
      if (validation.errors.city) errMap.city = validation.errors.city;
      if (validation.errors.state) errMap.state = validation.errors.state;
      if (validation.errors.zip) errMap.postalCode = validation.errors.zip;
      setFormErrors(errMap);
      return;
    }

    setSubmitting(true);
    try {
      if (editingAddress) {
        const updated = await accountService.updateAddress(user.id, editingAddress.id, {
          fullName: formData.fullName.trim(),
          street: formData.street.trim(),
          apartment: formData.apartment.trim() || undefined,
          city: formData.city.trim(),
          state: formData.state.trim().toUpperCase(),
          postalCode: formData.postalCode.trim(),
          country: 'United States',
          phone: formData.phone.trim() || undefined,
          isDefault: formData.isDefault,
        });
        setAddresses((prev) => {
          let next = prev.map((a) => (a.id === updated.id ? updated : a));
          if (updated.isDefault) {
            next = next.map((a) => (a.id === updated.id ? a : { ...a, isDefault: false }));
          }
          return next;
        });
        showToast('Address updated successfully', { type: 'success' });
      } else {
        const added = await accountService.addAddress(user.id, {
          fullName: formData.fullName.trim(),
          street: formData.street.trim(),
          apartment: formData.apartment.trim() || undefined,
          city: formData.city.trim(),
          state: formData.state.trim().toUpperCase(),
          postalCode: formData.postalCode.trim(),
          country: 'United States',
          phone: formData.phone.trim() || undefined,
          isDefault: formData.isDefault || addresses.length === 0,
        });
        setAddresses((prev) => {
          let next = [...prev, added];
          if (added.isDefault) {
            next = next.map((a) => (a.id === added.id ? a : { ...a, isDefault: false }));
          }
          return next;
        });
        showToast('New address added', { type: 'success' });
      }
      closeModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save address';
      showToast(msg, { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (addr: UserAddress) => {
    if (!user || addr.isDefault) return;
    try {
      await accountService.setDefaultAddress(user.id, addr.id);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === addr.id })));
      showToast(`Default shipping address set to ${addr.street}`, { type: 'success' });
    } catch {
      showToast('Failed to update default address', { type: 'error' });
    }
  };

  const handleDelete = async (addr: UserAddress) => {
    if (!user) return;
    // Keep reference for Undo
    const deletedAddr = addr;
    const previousList = [...addresses];

    // Optimistic delete
    setAddresses((prev) => prev.filter((a) => a.id !== addr.id));
    await accountService.deleteAddress(user.id, addr.id);

    // Show Undo toast
    showToast(`Address deleted: ${addr.street}`, {
      type: 'info',
      duration: 6000,
      action: {
        label: 'Undo',
        onClick: async () => {
          // Restore address
          await accountService.addAddress(user.id, {
            fullName: deletedAddr.fullName,
            street: deletedAddr.street,
            apartment: deletedAddr.apartment,
            city: deletedAddr.city,
            state: deletedAddr.state,
            postalCode: deletedAddr.postalCode,
            country: deletedAddr.country,
            phone: deletedAddr.phone,
            isDefault: deletedAddr.isDefault,
          });
          setAddresses(previousList);
          showToast('Address deletion undone', { type: 'success' });
        },
      },
    });
  };

  return (
    <AccountLayout
      breadcrumbs={[{ label: 'Your Addresses' }]}
      title="Your Addresses"
      description="Manage shipping & billing addresses for your book orders and literary gifts."
      action={
        <button
          type="button"
          onClick={openCreateModal}
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
          <span>Add Address</span>
        </button>
      }
    >
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
          Loading addresses...
        </div>
      ) : addresses.length === 0 ? (
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <MapPin size={40} color="var(--taupe)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '0 0 8px' }}>
            No Saved Addresses
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '0 0 20px' }}>
            Add an address for one-click checkout and seamless book deliveries.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            style={{
              padding: '10px 20px',
              background: 'var(--wine)',
              color: 'var(--white)',
              border: 0,
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Add Address Card */}
          <button
            type="button"
            onClick={openCreateModal}
            style={{
              border: '2px dashed var(--line)',
              borderRadius: '8px',
              background: 'transparent',
              padding: '32px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              color: 'var(--muted)',
              minHeight: '220px',
              transition: 'border-color 0.2s, color 0.2s',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--paper)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--wine)',
              }}
            >
              <Plus size={22} />
            </div>
            <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>Add Address</strong>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>For shipping &amp; gifts</span>
          </button>

          {/* List of Saved Addresses */}
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="address-card"
              style={{
                background: 'var(--white)',
                border: addr.isDefault ? '2px solid var(--wine)' : '1px solid var(--line)',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: addr.isDefault ? 'var(--shadow-ambient)' : 'none',
              }}
            >
              <div>
                {/* Default Badge */}
                {addr.isDefault && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(114, 38, 56, 0.08)',
                      color: 'var(--wine)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      marginBottom: '12px',
                    }}
                  >
                    <Check size={12} />
                    <span>Default Address</span>
                  </div>
                )}

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '0 0 6px', color: 'var(--ink)' }}>
                  {addr.fullName}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--ink)' }}>
                  {addr.street}
                  {addr.apartment && <>, {addr.apartment}</>}
                  <br />
                  {addr.city}, {addr.state} {addr.postalCode}
                  <br />
                  {addr.country}
                  {addr.phone && (
                    <>
                      <br />
                      <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Phone: {addr.phone}</span>
                    </>
                  )}
                </p>
              </div>

              {/* Actions Footer */}
              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(addr)}
                    style={{
                      background: 'transparent',
                      border: 0,
                      padding: 0,
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--wine)',
                      cursor: 'pointer',
                      minHeight: '32px',
                    }}
                  >
                    Edit
                  </button>
                  <span style={{ color: 'var(--line)' }}>|</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr)}
                    style={{
                      background: 'transparent',
                      border: 0,
                      padding: 0,
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--terracotta)',
                      cursor: 'pointer',
                      minHeight: '32px',
                    }}
                  >
                    Remove
                  </button>
                </div>

                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr)}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--line)',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      cursor: 'pointer',
                      minHeight: '32px',
                    }}
                  >
                    Set as default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {(isCreatingNew || editingAddress) && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="address-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 18, 17, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            overflowY: 'auto',
          }}
        >
          <form
            onSubmit={handleSaveAddress}
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              maxWidth: '540px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-monumental)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 id="address-modal-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: 0, color: 'var(--ink)' }}>
                {editingAddress ? 'Edit Address' : 'Add a New US Address'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: '4px', minHeight: '36px' }}
                aria-label="Close dialog"
              >
                <X size={20} color="var(--muted)" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Full Name */}
              <div>
                <label htmlFor="address-fullName" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                  Full name (First and Last name) *
                </label>
                <input
                  id="address-fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: formErrors.fullName ? '1px solid var(--terracotta)' : '1px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '15px',
                  }}
                />
                {formErrors.fullName && (
                  <span style={{ fontSize: '12px', color: 'var(--terracotta)', marginTop: '4px', display: 'block' }}>
                    {formErrors.fullName}
                  </span>
                )}
              </div>

              {/* Street Address */}
              <div>
                <label htmlFor="address-street" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                  Street address *
                </label>
                <input
                  id="address-street"
                  type="text"
                  placeholder="Street address, P.O. box, company name"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: formErrors.street ? '1px solid var(--terracotta)' : '1px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '15px',
                  }}
                />
                {formErrors.street && (
                  <span style={{ fontSize: '12px', color: 'var(--terracotta)', marginTop: '4px', display: 'block' }}>
                    {formErrors.street}
                  </span>
                )}
              </div>

              {/* Apt / Suite */}
              <div>
                <label htmlFor="address-apt" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                  Apartment, suite, unit, building, floor, etc. (optional)
                </label>
                <input
                  id="address-apt"
                  type="text"
                  value={formData.apartment}
                  onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '15px',
                  }}
                />
              </div>

              {/* City, State, ZIP in row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label htmlFor="address-city" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                    City *
                  </label>
                  <input
                    id="address-city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: formErrors.city ? '1px solid var(--terracotta)' : '1px solid var(--line)',
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                      fontSize: '15px',
                    }}
                  />
                  {formErrors.city && (
                    <span style={{ fontSize: '11px', color: 'var(--terracotta)', marginTop: '2px', display: 'block' }}>
                      {formErrors.city}
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor="address-state" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                    State *
                  </label>
                  <select
                    id="address-state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 8px',
                      borderRadius: '6px',
                      border: formErrors.state ? '1px solid var(--terracotta)' : '1px solid var(--line)',
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                      fontSize: '15px',
                    }}
                  >
                    {US_STATES.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.code} - {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="address-zip" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                    ZIP Code *
                  </label>
                  <input
                    id="address-zip"
                    type="text"
                    placeholder="97201"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 8px',
                      borderRadius: '6px',
                      border: formErrors.postalCode ? '1px solid var(--terracotta)' : '1px solid var(--line)',
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                      fontSize: '15px',
                    }}
                  />
                  {formErrors.postalCode && (
                    <span style={{ fontSize: '11px', color: 'var(--terracotta)', marginTop: '2px', display: 'block' }}>
                      {formErrors.postalCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="address-phone" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                  Phone number (for delivery notifications)
                </label>
                <input
                  id="address-phone"
                  type="tel"
                  placeholder="(206) 555-0192"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '15px',
                  }}
                />
              </div>

              {/* Set default checkbox */}
              <div style={{ marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--wine)' }}
                  />
                  <span>Make this my default shipping address</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                style={{
                  padding: '10px 18px',
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
                disabled={submitting}
                style={{
                  padding: '10px 22px',
                  background: 'var(--wine)',
                  color: 'var(--white)',
                  border: 0,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  minHeight: '42px',
                }}
              >
                {submitting ? 'Saving...' : editingAddress ? 'Save Changes' : 'Add Address'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AccountLayout>
  );
}
