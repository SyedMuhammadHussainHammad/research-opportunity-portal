// Frontend JavaScript for Research Opportunity Portal

const API_BASE_URL = '/api/opportunities';

// Global state
let allOpportunities = [];
let opportunityModal = null;
let detailModal = null;
let deleteModal = null;
let pendingDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Bootstrap Modals
    opportunityModal = new bootstrap.Modal(document.getElementById('opportunityModal'));
    detailModal = new bootstrap.Modal(document.getElementById('detailModal'));
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

    // Attach Event Listeners
    document.getElementById('btnCreateNew').addEventListener('click', openCreateModal);
    document.getElementById('saveOpportunityBtn').addEventListener('click', handleSaveOpportunity);
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleConfirmDelete);
    document.getElementById('searchInput').addEventListener('input', filterOpportunities);
    document.getElementById('statusFilter').addEventListener('change', filterOpportunities);
    document.getElementById('btnResetFilter').addEventListener('click', resetFilters);

    // Initial Fetch
    fetchOpportunities();
});

// Toast Notification Helper
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : (type === 'danger' ? 'bg-danger' : 'bg-warning');
    const icon = type === 'success' ? 'bi-check-circle-fill' : (type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill');

    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body d-flex align-items-center">
                    <i class="bi ${icon} fs-5 me-2"></i>
                    <div>${escapeHtml(message)}</div>
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toastElement, { delay: 4000 });
    bsToast.show();
    toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
}

// Fetch all opportunities from Backend API
async function fetchOpportunities() {
    const spinner = document.getElementById('loadingSpinner');
    const grid = document.getElementById('opportunitiesGrid');
    const emptyState = document.getElementById('emptyState');

    spinner.classList.remove('d-none');
    grid.innerHTML = '';
    emptyState.classList.add('d-none');

    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }
        const json = await response.json();
        allOpportunities = json.data || [];
        updateStats();
        filterOpportunities();
    } catch (err) {
        showToast(`Failed to load research opportunities: ${err.message}`, 'danger');
        emptyState.classList.remove('d-none');
    } finally {
        spinner.classList.add('d-none');
    }
}

// Update Summary Statistics
function updateStats() {
    const total = allOpportunities.length;
    const openCount = allOpportunities.filter(o => o.status === 'Open').length;
    const closedCount = allOpportunities.filter(o => o.status === 'Closed').length;

    document.getElementById('statTotalCount').innerText = total;
    document.getElementById('statOpenCount').innerText = openCount;
    document.getElementById('statClosedCount').innerText = closedCount;
}

// Filter and Render Opportunities Grid
function filterOpportunities() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const statusVal = document.getElementById('statusFilter').value;

    const filtered = allOpportunities.filter(opp => {
        const matchesSearch = 
            opp.title.toLowerCase().includes(searchTerm) ||
            opp.faculty_name.toLowerCase().includes(searchTerm) ||
            opp.department.toLowerCase().includes(searchTerm) ||
            opp.research_area.toLowerCase().includes(searchTerm) ||
            opp.required_skills.toLowerCase().includes(searchTerm);

        const matchesStatus = (statusVal === 'ALL') || (opp.status === statusVal);

        return matchesSearch && matchesStatus;
    });

    renderGrid(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'ALL';
    filterOpportunities();
}

// Render Grid Cards
function renderGrid(opportunities) {
    const grid = document.getElementById('opportunitiesGrid');
    const emptyState = document.getElementById('emptyState');

    if (opportunities.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }

    emptyState.classList.add('d-none');

    grid.innerHTML = opportunities.map(opp => {
        const isOpen = opp.status === 'Open';
        const badgeClass = isOpen ? 'badge-status-open' : 'badge-status-closed';
        const skills = opp.required_skills.split(',').map(s => `<span class="skill-tag">${escapeHtml(s.trim())}</span>`).join('');

        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card opportunity-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="badge ${badgeClass}">${escapeHtml(opp.status)}</span>
                            <small class="text-muted"><i class="bi bi-person-fill"></i> ${escapeHtml(opp.faculty_name)}</small>
                        </div>
                        <h5 class="card-title text-primary fw-bold mb-2">${escapeHtml(opp.title)}</h5>
                        <p class="text-muted small mb-2"><i class="bi bi-building"></i> ${escapeHtml(opp.department)} | <i class="bi bi-journal-bookmark"></i> ${escapeHtml(opp.research_area)}</p>
                        <p class="card-text text-secondary small line-clamp-3 mb-3">${escapeHtml(truncate(opp.description, 130))}</p>
                        
                        <div class="mb-3">
                            <small class="fw-semibold d-block text-muted mb-1">Required Skills:</small>
                            <div>${skills}</div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center pt-2 border-top mt-auto mb-3">
                            <small class="text-muted"><i class="bi bi-people-fill text-info"></i> Positions: <strong>${opp.available_positions}</strong></small>
                            <small class="text-muted"><i class="bi bi-calendar-event text-warning"></i> Deadline: <strong>${opp.application_deadline}</strong></small>
                        </div>

                        <div class="d-flex justify-content-between align-items-center gap-1">
                            <button class="btn btn-sm btn-outline-primary" onclick="viewOpportunityDetails(${opp.id})">
                                <i class="bi bi-eye"></i> View
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="openEditModal(${opp.id})">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button class="btn btn-sm ${isOpen ? 'btn-outline-warning' : 'btn-outline-success'}" onclick="toggleStatus(${opp.id}, '${opp.status}')">
                                <i class="bi ${isOpen ? 'bi-x-circle' : 'bi-check-circle'}"></i> ${isOpen ? 'Close' : 'Reopen'}
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="promptDelete(${opp.id}, '${escapeHtml(opp.title)}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// View Opportunity Details
async function viewOpportunityDetails(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            const errJson = await response.json();
            throw new Error(errJson.message || 'Opportunity not found');
        }
        const json = await response.json();
        const opp = json.data;

        document.getElementById('detailTitle').innerText = opp.title;
        document.getElementById('detailFaculty').innerText = opp.faculty_name;
        document.getElementById('detailDepartment').innerText = opp.department;
        document.getElementById('detailArea').innerText = opp.research_area;
        document.getElementById('detailStatus').className = `badge ${opp.status === 'Open' ? 'badge-status-open' : 'badge-status-closed'}`;
        document.getElementById('detailStatus').innerText = opp.status;
        document.getElementById('detailPositions').innerText = opp.available_positions;
        document.getElementById('detailDeadline').innerText = opp.application_deadline;
        document.getElementById('detailDescription').innerText = opp.description;
        
        const skillsContainer = document.getElementById('detailSkills');
        skillsContainer.innerHTML = opp.required_skills.split(',').map(s => `<span class="skill-tag fs-6">${escapeHtml(s.trim())}</span>`).join('');

        detailModal.show();
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

// Open Create Modal
function openCreateModal() {
    document.getElementById('opportunityForm').reset();
    document.getElementById('opportunityId').value = '';
    document.getElementById('modalTitle').innerText = 'Post New Research Opportunity';
    clearFormValidation();
    
    // Set default deadline to 30 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    document.getElementById('formDeadline').value = defaultDate.toISOString().split('T')[0];
    
    opportunityModal.show();
}

// Open Edit Modal
async function openEditModal(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            const errJson = await response.json();
            throw new Error(errJson.message || 'Opportunity not found');
        }
        const json = await response.json();
        const opp = json.data;

        clearFormValidation();
        document.getElementById('opportunityId').value = opp.id;
        document.getElementById('formTitle').value = opp.title;
        document.getElementById('formFaculty').value = opp.faculty_name;
        document.getElementById('formDepartment').value = opp.department;
        document.getElementById('formArea').value = opp.research_area;
        document.getElementById('formSkills').value = opp.required_skills;
        document.getElementById('formPositions').value = opp.available_positions;
        document.getElementById('formDeadline').value = opp.application_deadline;
        document.getElementById('formStatus').value = opp.status;
        document.getElementById('formDescription').value = opp.description;

        document.getElementById('modalTitle').innerText = `Edit Opportunity #${opp.id}`;
        opportunityModal.show();
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

// Handle Form Submission (Create or Update)
async function handleSaveOpportunity() {
    const form = document.getElementById('opportunityForm');
    const id = document.getElementById('opportunityId').value;
    
    if (!validateForm()) {
        showToast('Please fill out all required fields correctly.', 'warning');
        return;
    }

    const payload = {
        title: document.getElementById('formTitle').value.trim(),
        faculty_name: document.getElementById('formFaculty').value.trim(),
        department: document.getElementById('formDepartment').value.trim(),
        research_area: document.getElementById('formArea').value.trim(),
        required_skills: document.getElementById('formSkills').value.trim(),
        available_positions: parseInt(document.getElementById('formPositions').value),
        application_deadline: document.getElementById('formDeadline').value,
        status: document.getElementById('formStatus').value,
        description: document.getElementById('formDescription').value.trim()
    };

    const isUpdate = Boolean(id);
    const url = isUpdate ? `${API_BASE_URL}/${id}` : API_BASE_URL;
    const method = isUpdate ? 'PUT' : 'POST';

    const saveBtn = document.getElementById('saveOpportunityBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Saving...';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const json = await response.json();

        if (!response.ok) {
            throw new Error(json.message || 'Operation failed.');
        }

        opportunityModal.hide();
        showToast(isUpdate ? `Opportunity #${id} updated successfully!` : 'New research opportunity posted successfully!', 'success');
        fetchOpportunities();
    } catch (err) {
        showToast(`Save Error: ${err.message}`, 'danger');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="bi bi-save"></i> Save Opportunity';
    }
}

// Toggle Opportunity Status (Open <-> Closed)
async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        const json = await response.json();
        if (!response.ok) {
            throw new Error(json.message || 'Failed to update status.');
        }

        showToast(`Status updated to ${newStatus} for Opportunity #${id}`, 'success');
        fetchOpportunities();
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

// Delete Confirmation Prompt
function promptDelete(id, title) {
    pendingDeleteId = id;
    document.getElementById('deleteOpportunityTitle').innerText = title;
    deleteModal.show();
}

// Confirm Delete Execution
async function handleConfirmDelete() {
    if (!pendingDeleteId) return;

    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Deleting...';

    try {
        const response = await fetch(`${API_BASE_URL}/${pendingDeleteId}`, {
            method: 'DELETE'
        });

        const json = await response.json();
        if (!response.ok) {
            throw new Error(json.message || 'Failed to delete opportunity.');
        }

        deleteModal.hide();
        showToast(`Opportunity #${pendingDeleteId} deleted successfully.`, 'success');
        pendingDeleteId = null;
        fetchOpportunities();
    } catch (err) {
        showToast(err.message, 'danger');
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Delete Opportunity';
    }
}

// Client-side Form Validation
function validateForm() {
    let isValid = true;
    const requiredFields = [
        'formTitle', 'formFaculty', 'formDepartment', 'formArea', 
        'formSkills', 'formPositions', 'formDeadline', 'formDescription'
    ];

    requiredFields.forEach(fieldId => {
        const elem = document.getElementById(fieldId);
        const val = elem.value.trim();

        if (!val) {
            elem.classList.add('is-invalid');
            isValid = false;
        } else if (fieldId === 'formPositions' && (isNaN(val) || parseInt(val) < 0)) {
            elem.classList.add('is-invalid');
            isValid = false;
        } else {
            elem.classList.remove('is-invalid');
            elem.classList.add('is-valid');
        }
    });

    return isValid;
}

function clearFormValidation() {
    const inputs = document.querySelectorAll('#opportunityForm .form-control, #opportunityForm .form-select');
    inputs.forEach(input => {
        input.classList.remove('is-invalid', 'is-valid');
    });
}

// Utility Functions
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function truncate(str, maxLen) {
    if (!str) return '';
    if (str.length <= maxLen) return str;
    return str.substring(0, maxLen) + '...';
}
