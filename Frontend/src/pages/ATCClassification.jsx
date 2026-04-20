import { useEffect, useMemo, useState } from 'react';
import AppIcon from '../components/AppIcon';
import {
  getApiMessage,
  getAtcNode,
  getAtcTree,
  listMedicines,
  searchAtc
} from '../api/pimsApi';
import useDebouncedValue from '../hooks/useDebouncedValue';

function findFirstNode(nodes) {
  if (!nodes?.length) {
    return null;
  }

  const [first] = nodes;
  if (first.children?.length) {
    return findFirstNode(first.children);
  }

  return first;
}

function findPath(nodes, targetCode, trail = []) {
  for (const node of nodes || []) {
    const nextTrail = [...trail, node];
    if (node.code === targetCode) {
      return nextTrail;
    }

    const nested = findPath(node.children || [], targetCode, nextTrail);
    if (nested.length) {
      return nested;
    }
  }

  return [];
}

function dosageClass(form) {
  if (form === 'Injection') {
    return 'status-pill status-warning';
  }

  if (form === 'Tablet' || form === 'Capsule') {
    return 'status-pill status-neutral';
  }

  return 'status-pill status-success';
}

function AtcTreeBranch({ nodes, onSelect, selectedCode, level = 0 }) {
  return (
    <div className="tree-group">
      {nodes.map((node) => {
        const isSelected = node.code === selectedCode;

        return (
          <div key={node.code}>
            <button
              className={`tree-node-leaf ${isSelected ? 'active' : ''}`.trim()}
              onClick={() => onSelect(node.code)}
              style={{ paddingLeft: `${0.75 + level * 0.7}rem` }}
              type="button"
            >
              <span>[{node.code}] {node.name}</span>
              <AppIcon name="chevronRight" size={15} />
            </button>
            {node.children?.length ? (
              <AtcTreeBranch
                level={level + 1}
                nodes={node.children}
                onSelect={onSelect}
                selectedCode={selectedCode}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default function ATCClassification() {
  const [tree, setTree] = useState([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [pageState, setPageState] = useState({
    isLoading: true,
    errorMessage: ''
  });

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    let isActive = true;

    async function loadTree() {
      setPageState({ isLoading: true, errorMessage: '' });

      try {
        const data = await getAtcTree();
        if (!isActive) {
          return;
        }

        const loadedTree = data?.tree || [];
        const defaultNode = findFirstNode(loadedTree);

        setTree(loadedTree);
        setSelectedCode(defaultNode?.code || '');
        setPageState({ isLoading: false, errorMessage: '' });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setPageState({
          isLoading: false,
          errorMessage: getApiMessage(error, 'Failed to load ATC tree')
        });
      }
    }

    loadTree();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadSelectedNode() {
      if (!selectedCode) {
        return;
      }

      try {
        const [nodeData, medicineData] = await Promise.all([
          getAtcNode(selectedCode),
          listMedicines({ atcCode: selectedCode, limit: 20 })
        ]);

        if (!isActive) {
          return;
        }

        setSelectedNode(nodeData?.node || null);
        setMedicines(medicineData?.medicines || []);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setSelectedNode(null);
        setMedicines([]);
        setPageState((current) => ({
          ...current,
          errorMessage: getApiMessage(error, 'Failed to load ATC detail')
        }));
      }
    }

    loadSelectedNode();

    return () => {
      isActive = false;
    };
  }, [selectedCode]);

  useEffect(() => {
    let isActive = true;

    async function runSearch() {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const data = await searchAtc({ q: debouncedSearchQuery });
        if (isActive) {
          setSearchResults(data?.results || []);
        }
      } catch (_error) {
        if (isActive) {
          setSearchResults([]);
        }
      }
    }

    runSearch();

    return () => {
      isActive = false;
    };
  }, [debouncedSearchQuery]);

  const path = useMemo(() => findPath(tree, selectedCode), [selectedCode, tree]);

  return (
    <section className="split-page surface-card">
      <aside className="tree-panel">
        <div className="page-title">
          <div className="section-title">
            <AppIcon name="filter" size={18} />
            <h3>Classification Tree</h3>
          </div>
          <p className="helper-text">Browse ATC families and jump into live medicine mappings.</p>
        </div>

        <label className="field-label">
          <span>Search</span>
          <div className="search-field">
            <AppIcon name="search" size={18} />
            <input
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search codes or names..."
              type="search"
              value={searchQuery}
            />
          </div>
        </label>

        {searchResults.length ? (
          <div className="mini-list">
            {searchResults.slice(0, 5).map((result) => (
              <button
                className="mini-list-item"
                key={result._id || result.code}
                onClick={() => {
                  setSelectedCode(result.code);
                  setSearchQuery(result.code);
                }}
                type="button"
              >
                <div>
                  <strong>{result.code}</strong>
                  <div className="helper-text">{result.name}</div>
                </div>
              </button>
            ))}
          </div>
        ) : null}

        {pageState.isLoading ? (
          <div className="helper-text">Loading ATC hierarchy...</div>
        ) : (
          <div className="tree-list">
            <AtcTreeBranch nodes={tree} onSelect={setSelectedCode} selectedCode={selectedCode} />
          </div>
        )}
      </aside>

      <section className="atc-detail">
        {pageState.errorMessage ? (
          <div className="notice-banner">
            <div>
              <strong>ATC data could not load</strong>
              <div className="helper-text">{pageState.errorMessage}</div>
            </div>
          </div>
        ) : null}

        <div className="breadcrumb">
          <AppIcon name="inventory" size={16} />
          <span>WHO ATC Index</span>
          {path.map((item) => (
            <span key={item.code} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <AppIcon name="chevronRight" size={14} />
              <span>{item.code}</span>
            </span>
          ))}
        </div>

        <div className="detail-highlight">
          <div className="toolbar">
            <div className="page-title">
              <div className="section-title">
                <span className="pill">{selectedNode?.code || 'ATC'}</span>
                <h2>{selectedNode?.name || 'Select a code'}</h2>
              </div>
              <p className="helper-text">
                {selectedNode?.description || 'Choose an ATC node from the tree to inspect its live medicines and child codes.'}
              </p>
            </div>
            <button className="button-secondary" type="button">
              <AppIcon name="external" size={16} />
              View Monographs
            </button>
          </div>

          <div className="detail-metrics">
            <div>
              <div className="caption">Available Medicines</div>
              <strong style={{ fontSize: '1.9rem' }}>{medicines.length}</strong>
            </div>
            <div>
              <div className="caption">Hierarchy Level</div>
              <span className="pill">Level {selectedNode?.level || '-'}</span>
            </div>
            <div>
              <div className="caption">Child Codes</div>
              <strong style={{ fontSize: '1.4rem' }}>{selectedNode?.children?.length || 0}</strong>
            </div>
          </div>
        </div>

        <div className="detail-note">
          <AppIcon name="info" size={20} />
          <div>
            <strong>Clinical Note for {selectedNode?.code || 'selected code'}</strong>
            <div className="helper-text">
              {selectedNode?.description || 'No additional ATC description was provided by the backend for this code.'}
            </div>
          </div>
        </div>

        <section className="table-panel atc-table-panel">
          <div className="table-head">
            <div className="section-title">
              <AppIcon name="note" size={20} />
              <h3>Matched Medicines in System</h3>
            </div>
            <div className="helper-text">Showing {medicines.length} live results</div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Brand / Name</th>
                  <th>Generic Active Ingredient</th>
                  <th>Strength</th>
                  <th>Dosage Form</th>
                  <th>Manufacturer</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((medicine) => (
                  <tr key={medicine._id || medicine.id}>
                    <td>{medicine.brand || medicine.name}</td>
                    <td>{medicine.genericName}</td>
                    <td>{medicine.strength || 'N/A'}</td>
                    <td><span className={dosageClass(medicine.dosageForm)}>{medicine.dosageForm}</span></td>
                    <td>{medicine.manufacturer || 'N/A'}</td>
                  </tr>
                ))}
                {!medicines.length ? (
                  <tr>
                    <td className="helper-text" colSpan="5">
                      No medicines are currently mapped to this ATC code in the backend.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <div className="empty-state">
          <AppIcon name="arrowRight" size={24} />
          <strong>Can&apos;t find the specific drug?</strong>
          <div className="helper-text">
            If a medicine is not yet mapped to this ATC code, add the medicine record first so it appears here automatically.
          </div>
          <button className="button-secondary" type="button">Request Database Addition</button>
        </div>
      </section>
    </section>
  );
}
