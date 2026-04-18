import { useState, useEffect } from 'react';
import { ValidationUtils } from '../utilities/ValidationUtils';

const EMPTY = {
  name: '', sku: '', description: '', category: '', supplier: '',
  quantity: '', unitPrice: '', reorderLevel: 10,
};
const CATEGORY_OPTIONS = ['Audio', 'Electronics', 'Accessories', 'Storage', 'Components', 'Networking'];
const SUPPLIER_OPTIONS = ['Sony India', 'Samsung Electronics', 'LG Supplies', 'Dell Distributors', 'HP Suppliers'];

function buildInitialForm(initial) {
  if (!initial) return { ...EMPTY };
  return {
    ...EMPTY, ...initial,
    category: initial?.category || '',
    supplier: initial?.supplier || '',
    unitPrice:  initial?.unitPrice ?? initial?.price ?? '',
  };
}

// ✅ Hoisted — stable reference, React never remounts this
function Field({ label, field, form, errors, setField, type = 'text', ...rest }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        value={form[field] ?? ''}
        onChange={setField(field)}
        {...rest}
      />
      {errors[field] && <div className="error-msg">{errors[field]}</div>}
    </div>
  );
}

export default function ProductForm({ initial = null, onSubmit, onCancel, loading = false }) {
  const [form,   setForm]   = useState(() => buildInitialForm(initial));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(buildInitialForm(initial));
    setErrors({});
  }, [initial]);

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = ValidationUtils.validateProduct(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    await onSubmit({
      ...form,
      category:     form.category,
      supplier:     form.supplier,
      quantity:     Number(form.quantity),
      unitPrice:    Number(form.unitPrice),
      reorderLevel: Number(form.reorderLevel),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <div className="form-grid-2">
        <Field label="Product Name *" field="name"     form={form} errors={errors} setField={setField} placeholder="e.g. Wireless Mouse" />
        <Field label="SKU"            field="sku"      form={form} errors={errors} setField={setField} placeholder="e.g. WM-001" />

        <div className="form-group">
          <label>Category *</label>
          <select value={form.category ?? ''} onChange={setField('category')}>
            <option value="">Select Category</option>
            {CATEGORY_OPTIONS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          {errors.category && <div className="error-msg">{errors.category}</div>}
        </div>

        <div className="form-group">
          <label>Supplier *</label>
          <select value={form.supplier ?? ''} onChange={setField('supplier')}>
            <option value="">Select Supplier</option>
            {SUPPLIER_OPTIONS.map((sup) => <option key={sup} value={sup}>{sup}</option>)}
          </select>
          {errors.supplier && <div className="error-msg">{errors.supplier}</div>}
        </div>

        <Field label="Quantity *"       field="quantity"     type="number" min="0" placeholder="0"    form={form} errors={errors} setField={setField} />
        <Field label="Unit Price (₹) *" field="unitPrice"    type="number" min="0" step="0.01" placeholder="0.00" form={form} errors={errors} setField={setField} />
        <Field label="Reorder Level"    field="reorderLevel" type="number" min="0" placeholder="10"   form={form} errors={errors} setField={setField} />

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Description</label>
          <input
            type="text"
            value={form.description ?? ''}
            onChange={setField('description')}
            placeholder="Short description"
          />
          {errors.description && <div className="error-msg">{errors.description}</div>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : (initial ? 'Update Product' : 'Add Product')}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}