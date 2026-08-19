export const API_BASE_URL = 'http://localhost:5000';

export const OBJECT_TYPES = ['Account', 'Opportunity', 'Lead', 'Contact', 'Case'];

// Columns to display in the record table per object
export const OBJECT_COLUMNS = {
  Account: ['Name', 'Phone', 'Website', 'Industry', 'BillingCity'],
  Opportunity: ['Name', 'Amount', 'CloseDate', 'StageName'],
  Lead: ['Name', 'Company', 'Email', 'Phone', 'Status'],
  Contact: ['Name', 'Email', 'Phone', 'Title'],
  Case: ['Subject', 'Status', 'Priority', 'Description'],
};

// Fields used to build the create/edit form per object
export const OBJECT_FORM_FIELDS = {
  Account: [
    { name: 'Name', label: 'Name', type: 'text', required: true },
    { name: 'Phone', label: 'Phone', type: 'text' },
    { name: 'Website', label: 'Website', type: 'text' },
    { name: 'Industry', label: 'Industry', type: 'text' },
    { name: 'BillingCity', label: 'Billing City', type: 'text' },
  ],
  Opportunity: [
    { name: 'Name', label: 'Name', type: 'text', required: true },
    { name: 'Amount', label: 'Amount', type: 'number' },
    { name: 'CloseDate', label: 'Close Date', type: 'date', required: true },
    { name: 'StageName', label: 'Stage', type: 'text', required: true },
  ],
  Lead: [
    { name: 'FirstName', label: 'First Name', type: 'text' },
    { name: 'LastName', label: 'Last Name', type: 'text', required: true },
    { name: 'Company', label: 'Company', type: 'text', required: true },
    { name: 'Email', label: 'Email', type: 'text' },
    { name: 'Phone', label: 'Phone', type: 'text' },
    { name: 'Status', label: 'Status', type: 'text' },
  ],
  Contact: [
    { name: 'FirstName', label: 'First Name', type: 'text' },
    { name: 'LastName', label: 'Last Name', type: 'text', required: true },
    { name: 'Email', label: 'Email', type: 'text' },
    { name: 'Phone', label: 'Phone', type: 'text' },
    { name: 'Title', label: 'Title', type: 'text' },
  ],
  Case: [
    { name: 'Subject', label: 'Subject', type: 'text', required: true },
    { name: 'Status', label: 'Status', type: 'text' },
    { name: 'Priority', label: 'Priority', type: 'text' },
    { name: 'Description', label: 'Description', type: 'textarea' },
  ],
};
