import React, { useState, useEffect, useCallback } from 'react';

// Define the interface for a Satuan item
interface Satuan {
  id: number;
  name: string;
}

// Define the shape of the API response for fetching multiple satuans
// Assuming the API wraps the data array in a 'data' property
interface SatuanApiResponse {
  data: Satuan[];
  // Add other potential pagination properties if your API uses them
  // e.g., total, per_page, current_page, etc.
}

const SatuanPage: React.FC = () => {
  const [satuans, setSatuans] = useState<Satuan[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [currentSatuan, setCurrentSatuan] = useState<Satuan | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isViewing, setIsViewing] = useState<boolean>(false);

  // API base URL - adjust if your API is hosted elsewhere or uses a prefix like /api
  // For now, assuming API routes like /master/satuan/index are directly accessible from the same origin
  const API_BASE_URL = '';

  // --- API Helper Functions ---

  const fetchSatuansAPI = async (term: string): Promise<Satuan[]> => {
    const response = await fetch(`${API_BASE_URL}/master/satuan/index`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add Authorization header if needed, e.g.,
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ search: term }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network response was not ok while fetching list.' }));
      throw new Error(errorData.message || 'Failed to fetch satuans');
    }
    // Assuming the API returns an array of Satuan directly or an object like { data: Satuan[] }
    // The problem description implies server-side datatable, so the response might be more complex.
    // For now, let's assume a simple array or {data: array}
    const result: Satuan[] | SatuanApiResponse = await response.json();
    return Array.isArray(result) ? result : (result as SatuanApiResponse).data || [];
  };

  const addSatuanAPI = async (data: { name: string }): Promise<Satuan> => {
    const response = await fetch(`${API_BASE_URL}/master/satuan/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network response was not ok while creating.' }));
      throw new Error(errorData.message || 'Failed to add satuan');
    }
    return response.json();
  };

  const updateSatuanAPI = async (id: number, data: { name: string }): Promise<Satuan> => {
    const response = await fetch(`${API_BASE_URL}/master/satuan/edit/${id}`, {
      method: 'POST', // As per requirement
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network response was not ok while updating.' }));
      throw new Error(errorData.message || `Failed to update satuan with id ${id}`);
    }
    return response.json();
  };

  const fetchSatuanByIdAPI = async (id: number): Promise<Satuan> => {
    const response = await fetch(`${API_BASE_URL}/master/satuan/show/${id}`, {
      method: 'GET',
      headers: {
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network response was not ok while fetching by ID.' }));
      throw new Error(errorData.message || `Failed to fetch satuan with id ${id}`);
    }
    return response.json();
  };

  // --- End of API Helper Functions ---

  // Main component logic using these API functions
  const fetchSatuans = useCallback(async (term: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSatuansAPI(term);
      setSatuans(data || []); // Ensure data is an array, even if API returns null/undefined
    } catch (err) {
      setError((err as Error).message);
      setSatuans([]); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  }, []); // API_BASE_URL is a const, so not needed in deps if defined outside component or at module level

  // Effect for initial data load and when searchTerm changes (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSatuans(searchTerm);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, fetchSatuans]);

  // --- Core Logic Handlers ---

  const handleAddClick = () => {
    setIsAdding(true);
    setIsEditing(false);
    setIsViewing(false);
    setCurrentSatuan(null);
    setError(null);
  };

  const handleEditClick = async (satuanToEdit: Satuan) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch fresh data for editing to ensure it's the latest
      const freshSatuan = await fetchSatuanByIdAPI(satuanToEdit.id);
      setCurrentSatuan(freshSatuan);
      setIsEditing(true);
      setIsAdding(false);
      setIsViewing(false);
    } catch (err) {
      setError((err as Error).message);
      // If fetching fails, don't open the edit form
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewClick = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const satuanDetails = await fetchSatuanByIdAPI(id);
      setCurrentSatuan(satuanDetails);
      setIsViewing(true);
      setIsAdding(false);
      setIsEditing(false);
    } catch (err) {
      setError((err as Error).message);
      // If fetching fails, don't open the view details
      setIsViewing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData: { name: string }) => {
    setIsLoading(true);
    // Keep previous error visible until success or new error for this operation
    // setError(null);
    let success = false;
    try {
      if (isAdding) {
        await addSatuanAPI(formData);
      } else if (isEditing && currentSatuan) {
        await updateSatuanAPI(currentSatuan.id, formData);
      }
      success = true;
      fetchSatuans(searchTerm); // Refresh data
      setError(null); // Clear error on success
    } catch (err) {
      setError((err as Error).message);
      // Keep form open on error
    } finally {
      setIsLoading(false);
      if (success) {
        setIsAdding(false);
        setIsEditing(false);
        setCurrentSatuan(null);
      }
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setIsViewing(false);
    setCurrentSatuan(null);
    setError(null); // Clear any form-specific errors or errors from failed save attempts
  };

  // --- UI Rendering ---

  // Simple Form Component for Add/Edit
  const SatuanForm: React.FC<{
    initialData?: { name: string };
    onSubmit: (data: { name: string }) => void;
    onCancel: () => void;
    isEditMode: boolean;
    formError: string | null;
  }> = ({ initialData, onSubmit, onCancel, isEditMode, formError }) => {
    const [name, setName] = useState(initialData?.name || '');

    useEffect(() => {
      // Update form if initialData changes (e.g., when switching to edit another item)
      setName(initialData?.name || '');
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) {
        // Basic client-side validation
        alert("Name cannot be empty.");
        return;
      }
      onSubmit({ name });
    };

    return (
      <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
        <h3>{isEditMode ? 'Edit Satuan' : 'Add New Satuan'}</h3>
        {currentSatuan && isEditMode && <p>ID: {currentSatuan.id} (Not editable)</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="satuanName">Name: </label>
            <input
              id="satuanName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{padding: '5px', margin: '5px 0'}}
            />
          </div>
          {formError && <p style={{ color: 'red' }}>Error: {formError}</p>}
          <button type="submit" style={{padding: '5px 10px', marginRight: '10px'}}>Save</button>
          <button type="button" onClick={onCancel} style={{padding: '5px 10px'}}>Cancel</button>
        </form>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Master Satuan</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px', width: '300px', marginRight: '10px' }}
        />
        <button
          onClick={handleAddClick}
          style={{ padding: '10px 15px', cursor: 'pointer' }}
          disabled={isAdding || isEditing || isViewing} // Disable if a form is already open
        >
          Add New Satuan
        </button>
      </div>

      {/* Display global loading state (for table loading mostly) */}
      {isLoading && <p>Loading data...</p>}

      {/* Display global error messages (e.g., table fetch error) */}
      {error && !isAdding && !isEditing && !isViewing && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* Conditional Rendering for Table, Forms, or View Details */}
      {!isAdding && !isEditing && !isViewing && !isLoading && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', background: '#f0f0f0' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {satuans.length > 0 ? (
              satuans.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{s.id}</td>
                  <td style={{ padding: '10px' }}>{s.name}</td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => handleViewClick(s.id)} style={{ marginRight: '5px', padding: '5px' }}>View</button>
                    <button onClick={() => handleEditClick(s)} style={{ padding: '5px' }}>Edit</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} style={{ padding: '10px', textAlign: 'center' }}>No satuan data found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {(isAdding || (isEditing && currentSatuan)) && (
        <SatuanForm
          initialData={isEditing && currentSatuan ? { name: currentSatuan.name } : { name: '' }}
          onSubmit={handleSave}
          onCancel={handleCancel}
          isEditMode={isEditing}
          formError={error} // Pass the global error state to the form
        />
      )}

      {isViewing && currentSatuan && (
        <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
          <h3>Satuan Details</h3>
          <p><strong>ID:</strong> {currentSatuan.id}</p>
          <p><strong>Name:</strong> {currentSatuan.name}</p>
          <button onClick={handleCancel} style={{ padding: '8px 12px', marginTop: '10px' }}>Close</button>
        </div>
      )}
    </div>
  );
};

export default SatuanPage;
