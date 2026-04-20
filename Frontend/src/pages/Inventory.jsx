import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppIcon from '../components/AppIcon';
import useDebouncedValue from '../hooks/useDebouncedValue';
import useToast from '../hooks/useToast';
import {
  clearInventoryError,
  createInventoryBatch,
  fetchInventory,
  fetchInventoryMedicines,
  restockInventoryItem,
  updateInventoryBatch
} from '../store/slices/inventorySlice';

function statusClass(status) {
  if (status === 'STABLE') {
    return 'status-pill status-success';
  }
  if (status === 'NEAR EXPIRY') {
    return 'status-pill status-warning';
  }
  if (status === 'LOW STOCK' || status === 'EXPIRED') {
    return 'status-pill status-critical';
  }
  return 'status-pill status-neutral';
}

const emptyForm = {
  medicineId: '',
  batchId: '',
  currentStock: 0,
  threshold: 0,
  expiryDate: '',
  storage: ''
};

export default function Inventory() {
  const dispatch = useDispatch();
  const records = useSelector((state) => state.inventory.items);
  const medicines = useSelector((state) => state.inventory.medicines);
  const isLoading = useSelector((state) => state.inventory.isLoading);
  const isSubmitting = useSelector((state) => state.inventory.isSubmitting);
  const errorMessage = useSelector((state) => state.inventory.errorMessage);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState({
    batchId: '',
    currentStock: 0,
    threshold: 0,
    expiryDate: '',
    storage: ''
  });
  const { notifyError, notifySuccess } = useToast();

  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    dispatch(fetchInventory({
      limit: 100,
      q: debouncedQuery || undefined,
      status: filter !== 'All' ? filter : undefined
    }));
  }, [debouncedQuery, filter]);

  useEffect(() => {
    if (isModalOpen) {
      dispatch(fetchInventoryMedicines({ limit: 100 }));
    }
  }, [isModalOpen]);

  const metrics = useMemo(() => ({
    sku: records.length,
    lowStock: records.filter((item) => item.status === 'LOW STOCK').length,
    nearExpiry: records.filter((item) => item.status === 'NEAR EXPIRY').length,
    totalUnits: records.reduce((sum, item) => sum + Number(item.currentStock || 0), 0)
  }), [records]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateEditForm = (field, value) => {
    setEditForm((current) => ({ ...current, [field]: value }));
  };

  const openEditModal = (record) => {
    setEditingRecordId(record._id);
    setEditForm({
      batchId: record.batchId || '',
      currentStock: Number(record.currentStock || 0),
      threshold: Number(record.threshold || 0),
      expiryDate: record.expiryDate ? new Date(record.expiryDate).toISOString().slice(0, 10) : '',
      storage: record.storage || ''
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingRecordId('');
  };

  const restock = async (record) => {
    try {
      dispatch(clearInventoryError());
      const updated = await dispatch(restockInventoryItem({
        id: record._id,
        currentStock: record.currentStock
      })).unwrap();
      notifySuccess('Inventory restocked', `Restocked ${updated?.medicineId?.name || updated?.atcCode}.`);
    } catch (error) {
      notifyError('Restock failed', String(error || 'Failed to restock inventory item'));
    }
  };

  const handleCreateInventory = async (event) => {
    event.preventDefault();

    try {
      dispatch(clearInventoryError());
      await dispatch(createInventoryBatch({
        ...form,
        currentStock: Number(form.currentStock),
        threshold: Number(form.threshold)
      })).unwrap();
      setForm(emptyForm);
      setIsModalOpen(false);
      notifySuccess('Inventory created', 'Inventory batch created successfully.');
    } catch (error) {
      notifyError('Create inventory failed', String(error || 'Failed to create inventory item'));
    }
  };

  const handleEditInventory = async (event) => {
    event.preventDefault();

    try {
      dispatch(clearInventoryError());
      await dispatch(updateInventoryBatch({
        id: editingRecordId,
        payload: {
          batchId: editForm.batchId,
          currentStock: Number(editForm.currentStock),
          threshold: Number(editForm.threshold),
          expiryDate: editForm.expiryDate,
          storage: editForm.storage
        }
      })).unwrap();

      closeEditModal();
      notifySuccess('Inventory updated', 'Inventory batch updated successfully.');
    } catch (error) {
      notifyError('Update inventory failed', String(error || 'Failed to update inventory item'));
    }
  };

  return (
    <section className="page">
      {errorMessage ? (
        <div className="notice-banner">
          <div>
            <strong>Inventory issue</strong>
            <div className="helper-text">{errorMessage}</div>
          </div>
          <button className="button-ghost" onClick={() => dispatch(clearInventoryError())} type="button">Dismiss</button>
        </div>
      ) : null}

      <div className="stats-grid">
        <StatBlock label="Total SKUs" value={metrics.sku} />
        <StatBlock label="Low Stock Alert" value={metrics.lowStock} />
        <StatBlock label="Near Expiry" value={metrics.nearExpiry} />
        <StatBlock label="Items in Stock" value={metrics.totalUnits} />
      </div>

      <section className="table-panel">
        <div className="toolbar">
          <div className="toolbar-group">
            <label className="search-field" style={{ minWidth: '280px' }}>
              <AppIcon name="search" size={18} />
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search medicine or ATC code..."
                type="search"
                value={query}
              />
            </label>
            <select onChange={(event) => setFilter(event.target.value)} value={filter}>
              <option>All</option>
              <option>STABLE</option>
              <option>LOW STOCK</option>
              <option>NEAR EXPIRY</option>
              <option>EXPIRED</option>
            </select>
          </div>
          <button className="button-primary" onClick={() => setIsModalOpen(true)} type="button">
            <AppIcon name="plusCircle" size={16} />
            Add Medicine
          </button>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine & Manufacturer</th>
                <th>ATC Code</th>
                <th>Current Stock</th>
                <th>Batch ID</th>
                <th>Storage</th>
                <th>Expiry Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id}>
                  <td>
                    <strong>{record.medicineId?.name || record.atcCode}</strong>
                    <div className="helper-text">{record.medicineId?.manufacturer || 'Unknown manufacturer'}</div>
                  </td>
                  <td>{record.atcCode}</td>
                  <td>{record.currentStock}</td>
                  <td>{record.batchId}</td>
                  <td>{record.storage || 'No storage note'}</td>
                  <td>
                    <span className={statusClass(record.status)}>{record.status}</span>
                    <div className="helper-text" style={{ marginTop: '0.35rem' }}>
                      {new Date(record.expiryDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="toolbar-group">
                      <button className="button-secondary" onClick={() => restock(record)} type="button">
                        Restock
                      </button>
                      <button className="button-ghost" onClick={() => openEditModal(record)} type="button">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !records.length ? (
                <tr>
                  <td className="helper-text" colSpan="7">No inventory records found for the current filters.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen ? (
        <div className="user-modal-backdrop">
          <form className="user-modal" onSubmit={handleCreateInventory}>
            <div className="toolbar">
              <div className="page-title">
                <div className="section-title">
                  <AppIcon name="plusCircle" size={20} />
                  <h3>Create Inventory Batch</h3>
                </div>
                <p className="helper-text">Add a new backend inventory item for an existing medicine.</p>
              </div>
              <button className="button-ghost" onClick={() => setIsModalOpen(false)} type="button">
                Close
              </button>
            </div>

            <div className="field-grid">
              <label className="field-label">
                <span>Medicine</span>
                <select onChange={(event) => updateForm('medicineId', event.target.value)} required value={form.medicineId}>
                  <option value="">Select a medicine</option>
                  {medicines.map((medicine) => (
                    <option key={medicine._id} value={medicine._id}>
                      {medicine.name} ({medicine.atcCode})
                    </option>
                  ))}
                </select>
              </label>
              <div className="field-grid two">
                <label className="field-label">
                  <span>Batch ID</span>
                  <input onChange={(event) => updateForm('batchId', event.target.value)} required value={form.batchId} />
                </label>
                <label className="field-label">
                  <span>Storage</span>
                  <input onChange={(event) => updateForm('storage', event.target.value)} value={form.storage} />
                </label>
              </div>
              <div className="field-grid two">
                <label className="field-label">
                  <span>Current Stock</span>
                  <input onChange={(event) => updateForm('currentStock', event.target.value)} required type="number" value={form.currentStock} />
                </label>
                <label className="field-label">
                  <span>Threshold</span>
                  <input onChange={(event) => updateForm('threshold', event.target.value)} required type="number" value={form.threshold} />
                </label>
              </div>
              <label className="field-label">
                <span>Expiry Date</span>
                <input onChange={(event) => updateForm('expiryDate', event.target.value)} required type="date" value={form.expiryDate} />
              </label>
            </div>

            <div className="toolbar">
              <button className="button-ghost" onClick={() => setIsModalOpen(false)} type="button">
                Cancel
              </button>
              <button className="button-primary" type="submit">
                {isSubmitting ? 'Creating...' : 'Create Batch'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {isEditModalOpen ? (
        <div className="user-modal-backdrop">
          <form className="user-modal" onSubmit={handleEditInventory}>
            <div className="toolbar">
              <div className="page-title">
                <div className="section-title">
                  <AppIcon name="inventory" size={20} />
                  <h3>Edit Inventory Batch</h3>
                </div>
                <p className="helper-text">Update batch details and thresholds for this inventory item.</p>
              </div>
              <button className="button-ghost" onClick={closeEditModal} type="button">
                Close
              </button>
            </div>

            <div className="field-grid">
              <div className="field-grid two">
                <label className="field-label">
                  <span>Batch ID</span>
                  <input onChange={(event) => updateEditForm('batchId', event.target.value)} required value={editForm.batchId} />
                </label>
                <label className="field-label">
                  <span>Storage</span>
                  <input onChange={(event) => updateEditForm('storage', event.target.value)} value={editForm.storage} />
                </label>
              </div>
              <div className="field-grid two">
                <label className="field-label">
                  <span>Current Stock</span>
                  <input onChange={(event) => updateEditForm('currentStock', event.target.value)} required type="number" value={editForm.currentStock} />
                </label>
                <label className="field-label">
                  <span>Threshold</span>
                  <input onChange={(event) => updateEditForm('threshold', event.target.value)} required type="number" value={editForm.threshold} />
                </label>
              </div>
              <label className="field-label">
                <span>Expiry Date</span>
                <input onChange={(event) => updateEditForm('expiryDate', event.target.value)} required type="date" value={editForm.expiryDate} />
              </label>
            </div>

            <div className="toolbar">
              <button className="button-ghost" onClick={closeEditModal} type="button">
                Cancel
              </button>
              <button className="button-primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

function StatBlock({ label, value }) {
  return (
    <section className="panel">
      <strong>{label}</strong>
      <h2>{value}</h2>
    </section>
  );
}
