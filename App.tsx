import { lazy } from 'react';

const AdminTrending = lazy(() => import('./pages/AdminTrending'));
// Add the AdminDeveloper lazy import below
const AdminDeveloper = lazy(() => import('./pages/AdminDeveloper'));

// Other imports...

// Other code...

<Route path="/admin/developer" element={<AdminDeveloper />} />
<Route path="/privacy-policy" element={<PrivacyPolicy />} />