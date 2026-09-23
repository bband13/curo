const CURO_API = 'api';

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${CURO_API}/${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json().catch(() => ({ success: false, message: 'Invalid server response.' }));
  if (!response.ok || payload.success === false) throw new Error(payload.message || 'Curo server request failed.');
  return payload;
}

async function apiHospitals(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== false) query.set(key, value);
  });
  return apiRequest(`hospitals.php?${query.toString()}`);
}

async function apiHospital(id) {
  return apiRequest(`hospital.php?id=${encodeURIComponent(id)}`);
}

async function apiAppointment(payload) {
  return apiRequest('appointment.php', { method: 'POST', body: JSON.stringify(payload) });
}

async function apiContact(payload) {
  return apiRequest('contact.php', { method: 'POST', body: JSON.stringify(payload) });
}
