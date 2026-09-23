import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileBadge,
  FilePlus2,
  Files,
  Gauge,
  Link2,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  Search,
  Settings,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

type Certificate = {
  id: string;
  certificate_number: string;
  insured_name: string;
  holder_name: string;
  policy_number: string;
  description: string;
  issued_date: string;
  status: string;
};

const coverageTypes = ['General Liability', 'Automobile Liability', 'Garage Liability', 'Garage Keepers Liability', 'Umbrella/Excess Liability', 'Other'] as const;

type CertificateHolder = {
  id: string;
  name: string;
  contact: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  jobType: string;
  jobNumber: string;
  projectEndDate: string;
  additionalInsured: Record<string, boolean>;
  waiverOfSubrogation: Record<string, boolean>;
};

function emptyHolderForm(): CertificateHolder {
  return { id: '', name: '', contact: '', address: '', city: '', state: '', zip: '', email: '', jobType: '', jobNumber: '', projectEndDate: '', additionalInsured: {}, waiverOfSubrogation: {} };
}

type Endorsement = {
  id: string;
  description: string;
  effectiveDate: string;
  transactionType: string;
};

type Customer = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  customerType: 'Customer' | 'Prospect' | 'Suspect';
  primaryExecutive: string;
  primaryRepresentative: string;
};

type CustomerRow = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  customer_type: string;
  primary_executive: string;
  primary_representative: string;
};

function mapDbCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    phone: row.phone,
    email: row.email,
    customerType: (row.customer_type as Customer['customerType']) || 'Customer',
    primaryExecutive: row.primary_executive,
    primaryRepresentative: row.primary_representative,
  };
}

const seedCustomers: Customer[] = [
  { id: 'seed-1', name: 'NORTHGATE FREIGHT SOLUTIONS INC', address: '4521 HARBORVIEW DR', city: 'LAKESIDE', state: 'IL', zip: '60001', phone: '(312) 555-0148', email: 'dispatch@northgatefreight.example.com', customerType: 'Customer', primaryExecutive: 'Alex Ramirez', primaryRepresentative: 'House Account' },
  { id: 'seed-2', name: 'PINEHOLLOW RETAIL GROUP LLC', address: '88 COMMERCE WAY', city: 'RIVERGATE', state: 'FL', zip: '32301', phone: '(850) 555-0172', email: '', customerType: 'Customer', primaryExecutive: 'Alex Ramirez', primaryRepresentative: 'House Account' },
];

type CustomerFormState = {
  id?: string;
  customerType: Customer['customerType'];
  nameType: 'Business' | 'Individual';
  firmName: string;
  dba: string;
  fein: string;
  firstName: string;
  lastName: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  primaryExecutive: string;
  primaryRepresentative: string;
};

function customerToFormState(customer: Customer): CustomerFormState {
  return {
    id: customer.id,
    customerType: customer.customerType,
    nameType: 'Business',
    firmName: customer.name,
    dba: '',
    fein: '',
    firstName: '',
    lastName: '',
    dob: '',
    address: customer.address,
    city: customer.city,
    state: customer.state,
    zip: customer.zip,
    phone: customer.phone,
    email: customer.email,
    primaryExecutive: customer.primaryExecutive,
    primaryRepresentative: customer.primaryRepresentative,
  };
}

function buildCertificateNumber(issuedDate: string): string {
  const [year, month, day] = issuedDate.split('-');
  const stamp = `${(year || '26').slice(-2)}${month || '01'}${day || '01'}`;
  const sequence = Math.floor(10000 + Math.random() * 90000);
  return `CL${stamp}${sequence}`;
}

const sampleCertificates: Certificate[] = [
  { id: 'sample-1', certificate_number: 'CL26072341001', insured_name: 'NORTHGATE FREIGHT SOLUTIONS INC', holder_name: 'Master', policy_number: '07CPK455190-01', description: '2022 Freightliner Cascadia, VIN #1FDXE4FS0KDC00123', issued_date: '2026-07-23', status: 'Issued' },
  { id: 'sample-2', certificate_number: 'CL26072341002', insured_name: 'NORTHGATE FREIGHT SOLUTIONS INC', holder_name: 'Master', policy_number: '07CPK455190-01', description: '2022 Freightliner Cascadia, VIN #1FDXE4FS0KDC00123', issued_date: '2026-07-23', status: 'Issued' },
  { id: 'sample-3', certificate_number: 'CL26072341003', insured_name: 'NORTHGATE FREIGHT SOLUTIONS INC', holder_name: 'Master', policy_number: '07CPK455190-01', description: '2022 Freightliner Cascadia, VIN #1FDXE4FS0KDC00123', issued_date: '2026-07-23', status: 'Issued' },
];

const navItems = ['Customer Overview', 'Policies', 'Activity', 'Claims', 'Aged AR', 'Register', 'Submissions', 'Certificates', 'Statements', 'Change Requests', 'Receipts', 'Notes'];

const sectionTooltips: Record<string, string> = {
  'Customer Overview': 'Back to customer search and overview',
  'Policies': "View this customer's policies and submit endorsements",
  'Activity': 'View recent activity logged for this customer',
  'Claims': 'View and file claims for this customer',
  'Aged AR': 'View aged accounts receivable for this customer',
  'Register': "View this customer's transaction register",
  'Submissions': 'View new business submissions in progress',
  'Certificates': 'Create and manage certificates of insurance (COI)',
  'Statements': 'View billing statements',
  'Change Requests': 'View and submit policy change requests',
  'Receipts': 'View payment receipts',
  'Notes': 'View and add notes for this customer',
};

function App() {
  const [activeSection, setActiveSection] = useState('Customer Overview');
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>(sampleCertificates);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEformsOpen, setIsEformsOpen] = useState(false);
  const [eformsTab, setEformsTab] = useState('All Forms');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [certificateHolders, setCertificateHolders] = useState<Record<string, CertificateHolder[]>>({});
  const [holderManagerCertId, setHolderManagerCertId] = useState<string | null>(null);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [isEndorsementModalOpen, setIsEndorsementModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function loadData(): Promise<void> {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const [certResult, customerResult] = await Promise.all([
        supabase.from('coi_certificates').select('*').order('issued_date', { ascending: false }),
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
      ]);
      if (certResult.data && certResult.data.length > 0) setCertificates(certResult.data as Certificate[]);
      if (customerResult.data && customerResult.data.length > 0) setCustomers((customerResult.data as CustomerRow[]).map(mapDbCustomer));
      setLoading(false);
    }
    void loadData();
  }, []);

  const matches = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return [];
    return customers.filter((customer) => customer.name.toLowerCase().includes(normalized));
  }, [search, customers]);

  function notify(message: string): void {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  }

  function handleCustomerSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (matches[0]) {
      setSelectedCustomer(matches[0]);
      setActiveSection('Policies');
      notify('Customer record loaded');
    }
  }

  function handleCertificateSaved(certificate: Certificate): void {
    setCertificates((current) => [certificate, ...current]);
    setIsModalOpen(false);
    notify('Certificate issued and added to the register');
  }

  function openNewCustomer(): void {
    setEditingCustomer(null);
    setIsCustomerModalOpen(true);
  }

  function openEditCustomer(customer: Customer): void {
    setEditingCustomer(customer);
    setIsCustomerModalOpen(true);
  }

  async function handleCustomerSaved(form: CustomerFormState): Promise<void> {
    const name = form.nameType === 'Business' ? form.firmName.trim() : `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
    const record = {
      name,
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
      zip: form.zip.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      customer_type: form.customerType,
      primary_executive: form.primaryExecutive.trim(),
      primary_representative: form.primaryRepresentative.trim(),
    };

    if (form.id) {
      const updated: Customer = { id: form.id, name, address: record.address, city: record.city, state: record.state, zip: record.zip, phone: record.phone, email: record.email, customerType: form.customerType, primaryExecutive: record.primary_executive, primaryRepresentative: record.primary_representative };
      setCustomers((current) => current.map((customer) => (customer.id === form.id ? updated : customer)));
      if (selectedCustomer?.id === form.id) setSelectedCustomer(updated);
      if (supabase) await supabase.from('customers').update(record).eq('id', form.id);
      setIsCustomerModalOpen(false);
      setEditingCustomer(null);
      notify('Customer updated');
      return;
    }

    if (supabase) {
      const { data, error } = await supabase.from('customers').insert(record).select().maybeSingle();
      if (!error && data) {
        const created = mapDbCustomer(data as CustomerRow);
        setCustomers((current) => [created, ...current]);
        setSelectedCustomer(created);
        setActiveSection('Customer Overview');
        setIsCustomerModalOpen(false);
        notify('Customer created');
        return;
      }
    }
    const created: Customer = { id: `local-${Date.now()}`, name, address: record.address, city: record.city, state: record.state, zip: record.zip, phone: record.phone, email: record.email, customerType: form.customerType, primaryExecutive: record.primary_executive, primaryRepresentative: record.primary_representative };
    setCustomers((current) => [created, ...current]);
    setSelectedCustomer(created);
    setActiveSection('Customer Overview');
    setIsCustomerModalOpen(false);
    notify('Customer created');
  }

  async function handleCustomerDeleted(customer: Customer): Promise<void> {
    if (!window.confirm(`Delete customer "${customer.name}"? This cannot be undone.`)) return;
    setCustomers((current) => current.filter((item) => item.id !== customer.id));
    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer(null);
      setActiveSection('Customer Overview');
    }
    if (supabase) await supabase.from('customers').delete().eq('id', customer.id);
    notify('Customer deleted');
  }

  function holdersFor(certificateId: string): CertificateHolder[] {
    return certificateHolders[certificateId] || [];
  }

  function handleHoldersSaved(certificateId: string, holders: CertificateHolder[]): void {
    setCertificateHolders((current) => ({ ...current, [certificateId]: holders }));
    const holderLabel = holders.length === 0 ? 'Master' : holders.length === 1 ? holders[0].name : `${holders.length} Holders`;
    setCertificates((current) => current.map((certificate) => (certificate.id === certificateId ? { ...certificate, holder_name: holderLabel } : certificate)));
    setHolderManagerCertId(null);
    notify('Certificate holders updated');
  }

  async function handleCertificateCopy(certificate: Certificate): Promise<void> {
    const payload = { certificate_number: buildCertificateNumber(certificate.issued_date), insured_name: certificate.insured_name, holder_name: 'Master', policy_number: certificate.policy_number, description: certificate.description, issued_date: certificate.issued_date, status: 'Issued' };
    if (supabase) {
      const { data, error } = await supabase.from('coi_certificates').insert(payload).select().maybeSingle();
      if (!error && data) {
        setCertificates((current) => [data as Certificate, ...current]);
        notify('Certificate copied');
        return;
      }
    }
    setCertificates((current) => [{ ...payload, id: `local-${Date.now()}` }, ...current]);
    notify('Certificate copied');
  }

  async function handleCertificateRenew(certificate: Certificate): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const payload = { certificate_number: buildCertificateNumber(today), insured_name: certificate.insured_name, holder_name: certificate.holder_name, policy_number: certificate.policy_number, description: certificate.description, issued_date: today, status: 'Issued' };
    if (supabase) {
      const { data, error } = await supabase.from('coi_certificates').insert(payload).select().maybeSingle();
      if (!error && data) {
        setCertificates((current) => [data as Certificate, ...current]);
        notify('Certificate renewed');
        return;
      }
    }
    setCertificates((current) => [{ ...payload, id: `local-${Date.now()}` }, ...current]);
    notify('Certificate renewed');
  }

  async function handleCertificateDelete(certificate: Certificate): Promise<void> {
    if (!window.confirm(`Delete certificate ${certificate.certificate_number}? This cannot be undone.`)) return;
    setCertificates((current) => current.filter((item) => item.id !== certificate.id));
    if (supabase) await supabase.from('coi_certificates').delete().eq('id', certificate.id);
    notify('Certificate deleted');
  }

  function handleEndorsementSaved(endorsement: Endorsement): void {
    setEndorsements((current) => [endorsement, ...current]);
    setIsEndorsementModalOpen(false);
    notify('Endorsement submitted for processing');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" title="AMS360 — Agency Management System"><span className="brand-mark"><span /></span><strong>AMS360</strong></div>
        <button className="quick-button" aria-label="Quick actions" title="Quick actions — jump to a common task"><Zap size={17} /></button>
        <nav className="primary-nav">
          {['Customer', 'Broker', 'Company'].map((item) => <button className={item === 'Customer' ? 'active' : ''} key={item} title={`Switch to the ${item} module`}>{item}</button>)}
        </nav>
        <div className="top-actions"><button aria-label="Links" title="Linked applications"><Link2 size={19} /></button><button aria-label="Notifications" title="Notifications"><Bell size={19} /><i /></button><button aria-label="Help" title="Help"><CircleHelp size={19} /></button><button className="user-menu" title="Signed in as DEMOU1 — account options"><span className="avatar">D</span><span>DEMOU1</span><ChevronDown size={15} /></button></div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-heading"><span>Views</span><button aria-label="Collapse sidebar" title="Collapse this sidebar"><ChevronLeft size={14} /></button></div>
          <div className="side-group">
            <div className="side-label" title="Shortcuts to common tasks"><Gauge size={13} /> Actions</div>
            <button className="side-item" title="Create a new customer, prospect, or suspect record" onClick={openNewCustomer}>New Customer</button>
            <button className="side-item" title="View and add notes for the current customer">Notes</button>
            <button className="side-item" title="Manage marketing target lists">Target List</button>
            <button className="side-item quick" title="Run a saved quick report"><Files size={13} /> Quick Reports</button>
          </div>
          <div className="side-group customer-nav">
            <div className="side-label" title="Sections of the current customer record"><BriefcaseBusiness size={13} /> Customer</div>
            {navItems.map((item) => <button key={item} onClick={() => setActiveSection(item)} className={`side-item ${activeSection === item ? 'selected' : ''}`} title={sectionTooltips[item] || `Open ${item}`}>{item}</button>)}
          </div>
          <div className="side-group bottom-actions"><div className="side-label" title="Form and document tools"><Settings size={13} /> Actions</div><button className={`side-item ${isEformsOpen ? 'selected' : ''}`} onClick={() => setIsEformsOpen((current) => !current)} title="Open the eForms quick menu"><Files size={13} /> eForms</button>{isEformsOpen && <div className="eforms-menu"><button onClick={() => { setIsEformsOpen(true); setEformsTab('All Forms'); }} title="Open the full eForms Manager window">Launch eForms Manager</button><strong>New</strong>{['Applications', 'Auto ID Card', 'Binder', 'Cancellation', 'Certificate of Liability', 'Certificate of Property', 'Change Request', 'EPI', 'Loss Notice', 'Additional Forms'].map((item) => <button key={item} onClick={() => { setEformsTab(item === 'Certificate of Liability' ? 'Certificates' : 'All Forms'); setIsEformsOpen(true); }} title={`Start a new ${item} form`}>{item}</button>)}</div>}<button className="side-item quick" title="Run a saved quick report"><Files size={13} /> Quick Reports</button></div>
        </aside>

        <main className="main-area">
          <div className="breadcrumb"><span>Customer</span><ChevronRight size={12} /><strong>{selectedCustomer?.name || 'Customer Search'}</strong><ChevronRight size={12} /><em>{activeSection}</em></div>
          {activeSection === 'Customer Overview' || !selectedCustomer ? <CustomerSearch search={search} setSearch={setSearch} matches={matches} selectedCustomer={selectedCustomer} onSubmit={handleCustomerSearch} onSelect={(customer) => { setSelectedCustomer(customer); setActiveSection('Certificates'); notify('Customer record loaded'); }} onNewCustomer={openNewCustomer} onEditCustomer={openEditCustomer} onDeleteCustomer={handleCustomerDeleted} /> : (
            <>
              <div className="page-heading"><div><h1>{selectedCustomer.name} <span>— {activeSection}</span></h1><div className="summary" title="Account balance | Customer type | Primary executive | Primary representative"><span className="green-dot" title="Account in good standing" /> <b>$0.00</b><span>|</span><span>{selectedCustomer.customerType}</span><span>|</span><span>{selectedCustomer.primaryExecutive || 'Unassigned'}</span><span>|</span><span>{selectedCustomer.primaryRepresentative || 'Unassigned'}</span></div></div><div className="heading-actions"><button title="View additional details for this customer"><ShieldCheck size={15} /> Additional Customer Info</button><button onClick={() => openEditCustomer(selectedCustomer)} title="Edit this customer's Customer Setup record"><Pencil size={14} /> Edit Customer</button><span title="Help for this screen"><CircleHelp size={16} /></span></div></div>
              <div className="content-card">
                <div className="viewbar"><button className="collapse" title="Show or hide view filtering options"><ChevronDown size={14} /> View Options</button><div className="view-select"><span>Select View:</span><select defaultValue="System Default" title="Choose a saved grid layout"><option>System Default</option><option>My Certificate View</option></select><button title="Apply the selected view">Apply View</button></div></div>
                {activeSection === 'Policies' ? <Policies endorsements={endorsements} onEndorse={() => setIsEndorsementModalOpen(true)} /> : activeSection === 'Certificates' ? <CertificateRegister certificates={certificates} loading={loading} onNew={() => { setEformsTab('Certificates'); setIsEformsOpen(true); }} onSelect={setSelectedCertificate} onManageHolders={(certificate) => setHolderManagerCertId(certificate.id)} onCopy={handleCertificateCopy} onRenew={handleCertificateRenew} onDelete={handleCertificateDelete} /> : <PlaceholderSection section={activeSection} onCertificates={() => setActiveSection('Certificates')} />}
              </div>
            </>
          )}
        </main>
      </div>
      <footer className="statusbar"><span title="Open the 360 Toolbox utility launcher"><span className="status-logo">360</span> Toolbox</span><span title="Open Contacts">Contacts</span><strong title="WorkSmart knowledge base">WorkSmart</strong><span className="footer-right" title="Powered by Vertafore">Veritafore</span></footer>

      {isEformsOpen && <EformsManager customer={selectedCustomer} tab={eformsTab} onTabChange={setEformsTab} onClose={() => setIsEformsOpen(false)} onNewCertificate={() => setIsModalOpen(true)} />}
      {isModalOpen && <CertificateModal customer={selectedCustomer} onClose={() => setIsModalOpen(false)} onSaved={handleCertificateSaved} />}
      {isCustomerModalOpen && <CustomerModal initial={editingCustomer} onClose={() => { setIsCustomerModalOpen(false); setEditingCustomer(null); }} onSaved={handleCustomerSaved} />}
      {selectedCertificate && <CertificateDetail certificate={selectedCertificate} customer={selectedCustomer} holders={holdersFor(selectedCertificate.id)} onClose={() => setSelectedCertificate(null)} onPrint={() => notify('Certificate is ready to print')} onManageHolders={() => { setHolderManagerCertId(selectedCertificate.id); setSelectedCertificate(null); }} />}
      {holderManagerCertId && <HolderManagerModal certificateNumber={certificates.find((certificate) => certificate.id === holderManagerCertId)?.certificate_number || ''} holders={holdersFor(holderManagerCertId)} onClose={() => setHolderManagerCertId(null)} onSaved={(holders) => handleHoldersSaved(holderManagerCertId, holders)} />}
      {isEndorsementModalOpen && <EndorsementModal onClose={() => setIsEndorsementModalOpen(false)} onSaved={handleEndorsementSaved} />}
      {toast && <div className="toast"><ShieldCheck size={17} /> {toast}</div>}
    </div>
  );
}

function CustomerSearch({ search, setSearch, matches, selectedCustomer, onSubmit, onSelect, onNewCustomer, onEditCustomer, onDeleteCustomer }: { search: string; setSearch: (value: string) => void; matches: Customer[]; selectedCustomer: Customer | null; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onSelect: (customer: Customer) => void; onNewCustomer: () => void; onEditCustomer: (customer: Customer) => void; onDeleteCustomer: (customer: Customer) => void }) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const picked = matches.find((customer) => customer.id === pickedId) || null;
  return <div className="customer-screen"><div className="customer-screen-title"><strong>Customer</strong><span title="Producing agency and agency code">Meridian Coverage Group, Inc. · 884215-1</span><span title="Help searching for a customer"><CircleHelp size={14} /></span></div><form className="customer-controls" onSubmit={onSubmit}><div className="customer-search-input"><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search customer" title="Type a customer, prospect, or suspect name to search" /><button type="submit" aria-label="Search" title="Run search"><Search size={16} /></button></div><span title="Pick a prior search from history">Pick:</span><select aria-label="Pick result" title="Recent search history"><option>1</option><option>2</option></select><div className="search-rules" title="Current search settings">Search By: <b>Name</b> &nbsp;|&nbsp; Include: All &nbsp;|&nbsp; Agency, Broker &nbsp;|&nbsp; Customer Type: Customers</div></form><div className="customer-viewbar"><button title="Show or hide search filtering options"><ChevronDown size={13} /> View Options</button><div><span>Select View:</span><select defaultValue="User Default" title="Choose a saved grid layout"><option>User Default</option><option>System Default</option></select><button className="apply" title="Apply the selected view">Apply View</button></div></div><div className="customer-grid"><div className="grid-actions"><button onClick={onNewCustomer} title="Create a new customer, prospect, or suspect record"><Plus size={14} /> New Customer</button><button disabled={!picked} onClick={() => picked && onEditCustomer(picked)} title={picked ? `Edit ${picked.name}` : 'Select a row first'}>Edit</button><button disabled={!picked} onClick={() => picked && onSelect(picked)} title={picked ? `Open ${picked.name}` : 'Select a row first'}>Open</button><button disabled={!picked} onClick={() => picked && onDeleteCustomer(picked)} title={picked ? `Delete ${picked.name}` : 'Select a row first'}>Delete</button></div><table><thead><tr><th title="Row number">#</th><th title="How this row matched your search">Match</th><th title="Customer or firm name">Name</th><th title="Mailing address">Address</th><th>City</th><th>State</th><th>Zip</th><th title="Primary phone on file">Phone List</th><th title="Assigned agency executive">Primary Exec.</th><th title="Assigned agency representative">Primary Rep(s)</th><th title="Agency account number">Account</th><th title="Customer / Prospect / Suspect">Customer Type</th><th title="Master account flag">Master</th><th title="Internal business unit">Business Unit</th><th title="Line of business with this agency">Business with Agency</th></tr></thead><tbody>{matches.map((customer, index) => <tr key={customer.id} className={selectedCustomer?.id === customer.id || pickedId === customer.id ? 'row-selected' : ''} onClick={() => setPickedId(customer.id)} onDoubleClick={() => onSelect(customer)} title="Click to select, double-click to open"><td>{index + 1}</td><td>{customer.name}</td><td className="link" onClick={(event) => { event.stopPropagation(); onSelect(customer); }} title={`Open ${customer.name}`}>{customer.name}</td><td>{customer.address}</td><td>{customer.city}</td><td>{customer.state}</td><td>{customer.zip}</td><td>{customer.phone}</td><td>{customer.primaryExecutive || 'Unassigned'}</td><td>{customer.primaryRepresentative || 'Unassigned'}</td><td>10045822</td><td>{customer.customerType}</td><td>Standard</td><td>Central</td><td>Commercial</td></tr>)}</tbody></table><div className="customer-grid-footer"><span><span title="First page"><ChevronLeft size={13} /></span> <span title="Previous page"><ChevronLeft size={13} /></span> <b>1</b> <span title="Next page"><ChevronRight size={13} /></span> <span title="Last page"><ChevronRight size={13} /></span></span><span>{matches.length ? `Displaying record(s) 1 - ${matches.length} of ${matches.length}` : 'No records to display'}</span></div></div></div>;
}

function Policies({ endorsements, onEndorse }: { endorsements: Endorsement[]; onEndorse: () => void }) {
  const latest = endorsements[0];
  const transactionLabel = latest ? 'Endorsement' : 'Policy change';
  const transactionDate = latest ? new Date(latest.effectiveDate).toLocaleDateString('en-US') : '07/14/2026';
  return <div className="policy-layout"><div className="table-wrap"><div className="toolbar"><button title="Start a new policy for this customer"><Plus size={14} /> New Policy</button><button title="Copy this policy to start a similar one">Copy</button><button onClick={onEndorse} title="Submit a mid-term change (endorsement) to this policy"><Pencil size={13} /> Endorse</button><button title="Renew this policy for a new term">Renew</button><button className="danger" title="Cancel this policy">Cancel</button><button title="Compare policy versions">Compare</button><button title="Export the policy list">Export All</button></div><table><thead><tr><th title="Policy number">Policy #</th><th title="Current policy status">Status</th><th title="Policy term dates">Term</th><th title="Policy type / line code">Type</th><th title="Writing insurance carrier">Company</th><th title="Most recent transaction type">Transaction</th><th title="Transaction effective date">Effective</th></tr></thead><tbody><tr className="row-selected" title="Currently selected policy"><td className="link" title="Open policy 07CPK455190-01">07CPK455190-01</td><td><span className="pill green">Active</span></td><td>03/22/2026<br />03/22/2027</td><td>Package<br />CPKGE</td><td>Meridian National<br />Insurance Company</td><td>{transactionLabel}</td><td>{transactionDate}</td></tr></tbody></table>{endorsements.length > 0 && <div className="endorsement-history"><h3 title="Endorsements submitted on this policy">Endorsement History</h3><table><thead><tr><th>Effective Date</th><th>Description</th></tr></thead><tbody>{endorsements.map((endorsement) => <tr key={endorsement.id} title={endorsement.transactionType}><td>{new Date(endorsement.effectiveDate).toLocaleDateString('en-US')}</td><td>{endorsement.description}</td></tr>)}</tbody></table></div>}</div><aside className="policy-summary"><h3>Policy Summary</h3><InfoBlock title="Basic Policy Information" lines={['Business New to Agency: N', 'Policy #: 07CPK455190-01', 'Policy Term: 03/22/2026 - 03/22/2027', 'Policy Type: Package', `Transaction Date: ${transactionDate}`, 'Parent Company: Meridian Holdings Inc', 'Writing Company: Meridian National Insurance Company', 'Division: Central Division', 'Branch: Uptown Branch', 'Department: Small Commercial']} /><InfoBlock title="Service Personnel" lines={['Primary Executive: Alex Ramirez', 'Primary Representative: House Account']} /><InfoBlock title="First Named Insured" lines={['Name: MORGAN ELLIS', 'Firm Name: NORTHGATE FREIGHT SOLUTIONS INC', 'Business: (312) 555-0148', 'Email: dispatch@northgatefreight.example.com']} /></aside></div>;
}

function InfoBlock({ title, lines }: { title: string; lines: string[] }) { return <div className="info-block"><strong>{title}</strong>{lines.map((line) => <span key={line}>{line}</span>)}</div>; }

function CertificateRegister({ certificates, loading, onNew, onSelect, onManageHolders, onCopy, onRenew, onDelete }: { certificates: Certificate[]; loading: boolean; onNew: () => void; onSelect: (certificate: Certificate) => void; onManageHolders: (certificate: Certificate) => void; onCopy: (certificate: Certificate) => void; onRenew: (certificate: Certificate) => void; onDelete: (certificate: Certificate) => void }) {
  const [contextMenu, setContextMenu] = useState<{ certificate: Certificate; x: number; y: number } | null>(null);

  function openContextMenu(event: MouseEvent, certificate: Certificate): void {
    event.preventDefault();
    setContextMenu({ certificate, x: event.clientX, y: event.clientY });
  }

  function runAction(action: (certificate: Certificate) => void): void {
    if (contextMenu) action(contextMenu.certificate);
    setContextMenu(null);
  }

  return <div className="register"><div className="toolbar"><button className="primary-action" onClick={onNew} title="Start a new liability certificate (Certificate of Liability)"><FilePlus2 size={15} /> New Cert Lib</button><button onClick={onNew} title="Start a new property certificate"><Plus size={15} /> New Cert Prop</button><button title="Export all certificates in this list"><Files size={14} /> Export All</button><button className="more" title="More options"><MoreHorizontal size={17} /></button></div><div className="table-scroll"><table><thead><tr><th title="Certificate type">Type</th><th title="Certificate number">Certificate #</th><th title="Master Certificate flag">Description</th><th title="Certificate holder, if one has been added">Holder</th><th title="Description of operations, locations, or vehicles">Description of Ops./Special Cond.</th><th title="Policy this certificate is based on">Policy #</th><th title="Date this certificate was issued">Issued Date</th><th title="Certificate status">Status</th></tr></thead><tbody>{loading ? <tr><td colSpan={8} className="empty">Loading certificates...</td></tr> : certificates.map((certificate) => <tr key={certificate.id} onClick={() => onSelect(certificate)} onContextMenu={(event) => openContextMenu(event, certificate)} title="Click to view, right-click for more options"><td>Liability</td><td className="link" title={`View ${certificate.certificate_number}`}>{certificate.certificate_number}</td><td>Master</td><td>{certificate.holder_name}</td><td>{certificate.description}</td><td>{certificate.policy_number}</td><td>{new Date(certificate.issued_date).toLocaleDateString('en-US')}</td><td><span className="pill green">{certificate.status}</span></td></tr>)}</tbody></table></div><div className="pager"><span>Displaying record(s) 1 - {certificates.length} of {certificates.length}</span><span><span title="Previous page"><ChevronLeft size={14} /></span><b>1</b><span title="Next page"><ChevronRight size={14} /></span></span></div>
    {contextMenu && <div className="context-menu-backdrop" onClick={() => setContextMenu(null)} onContextMenu={(event) => { event.preventDefault(); setContextMenu(null); }} />}
    {contextMenu && <ul className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
      <li><button onClick={() => runAction(onManageHolders)} title="Add or edit the certificate holder(s) for this certificate">Add/Edit Holder</button></li>
      <li><button onClick={() => runAction(onCopy)} title="Create a new Master Certificate with the same details">Copy</button></li>
      <li><button onClick={() => runAction(onRenew)} title="Reissue this certificate with today's date">Renew</button></li>
      <li><button onClick={() => runAction((certificate) => onSelect(certificate))} title="Replace the Master Certificate this one was generated from">Replace Master Cert</button></li>
      <li><button onClick={() => runAction((certificate) => onSelect(certificate))} title="Refresh this certificate from the current Master Certificate">Update Master Cert</button></li>
      <li><button onClick={() => setContextMenu(null)} title="Email or distribute this certificate to holders (not available in this prototype)">Distribute Certificates</button></li>
      <li><button onClick={() => setContextMenu(null)} title="View or add file attachments (not available in this prototype)">Attachments</button></li>
      <li className="divider" />
      <li><button className="danger" onClick={() => runAction(onDelete)} title="Permanently delete this certificate">Delete</button></li>
    </ul>}
  </div>;
}

function PlaceholderSection({ section, onCertificates }: { section: string; onCertificates: () => void }) { return <div className="placeholder"><div className="placeholder-icon"><Files size={27} /></div><h2>{section}</h2><p>This customer workspace is ready for the next activity. Use Certificates to create and manage proof of insurance.</p><button onClick={onCertificates} title="Go to the Certificates section">Open Certificates</button></div>; }

const eformsCategories = ['All Forms', 'Applications', 'Auto ID Card', 'Binder', 'Cancellation', 'Certificates', 'Change Request', 'EPI', 'Loss Notice', 'Additional Forms'];

const eformsTiles: Record<string, { label: string; icon: typeof FileBadge; action?: 'new-cert-lib' | 'new-cert-prop' }[]> = {
  'All Forms': [{ label: 'ACORD 125', icon: FileBadge }, { label: 'ACORD 126', icon: FileBadge }, { label: 'ACORD 127', icon: FileBadge }, { label: 'ACORD 25', icon: ShieldCheck }, { label: 'Auto ID Card', icon: FileBadge }, { label: 'Binder', icon: FileBadge }, { label: 'Cancellation', icon: FileBadge }, { label: 'Change Request', icon: FileBadge }, { label: 'EPI', icon: FileBadge }, { label: 'Loss Notice', icon: FileBadge }],
  'Applications': [{ label: 'ACORD 125', icon: FileBadge }, { label: 'ACORD 126', icon: FileBadge }, { label: 'ACORD 127', icon: FileBadge }, { label: 'ACORD 130', icon: FileBadge }, { label: 'ACORD 131', icon: FileBadge }, { label: 'ACORD 140', icon: FileBadge }],
  'Auto ID Card': [{ label: 'Personal Auto ID', icon: FileBadge }, { label: 'Commercial Auto ID', icon: FileBadge }],
  'Binder': [{ label: 'Liability Binder', icon: FileBadge }, { label: 'Property Binder', icon: FileBadge }],
  'Cancellation': [{ label: 'Cancellation Request', icon: FileBadge }, { label: 'Cancellation Notice', icon: FileBadge }],
  'Certificates': [{ label: 'New Cert Lib', icon: ShieldCheck, action: 'new-cert-lib' }, { label: 'New Cert Prop', icon: FileBadge, action: 'new-cert-prop' }, { label: 'Copy Cert Lib', icon: FileBadge }, { label: 'Copy Cert Prop', icon: FileBadge }],
  'Change Request': [{ label: 'Policy Change Request', icon: FileBadge }],
  'EPI': [{ label: 'EPI Form', icon: FileBadge }],
  'Loss Notice': [{ label: 'Loss Notice Form', icon: FileBadge }],
  'Additional Forms': [{ label: 'Endorsement Request', icon: FileBadge }, { label: 'Reinstatement Request', icon: FileBadge }, { label: 'Quote Letter', icon: FileBadge }],
};

function EformsManager({ customer, tab, onTabChange, onClose, onNewCertificate }: { customer: Customer | null; tab: string; onTabChange: (tab: string) => void; onClose: () => void; onNewCertificate: () => void }) {
  const tiles = eformsTiles[tab] || eformsTiles['All Forms'];
  function handleTileClick(tile: { label: string; action?: 'new-cert-lib' | 'new-cert-prop' }): void {
    if (tile.action === 'new-cert-lib' || tile.action === 'new-cert-prop') {
      onClose();
      onNewCertificate();
    }
  }
  return <div className="eforms-backdrop"><section className="eforms-window"><div className="eforms-titlebar"><span className="eforms-title">eForms Manager</span><div className="eforms-title-actions"><button aria-label="Minimize" title="Minimize">—</button><button aria-label="Maximize" title="Maximize">□</button><button onClick={onClose} aria-label="Close" title="Close eForms Manager"><X size={15} /></button></div></div><div className="eforms-toolbar"><button title="File menu">File</button><button title="Edit menu">Edit</button><button title="View menu">View</button><button title="Tools menu">Tools</button><button title="Help menu">Help</button><span className="eforms-customer" title="Forms will be generated for this customer">Customer: <b>{customer?.name || '—'}</b></span></div><div className="eforms-body"><aside className="eforms-sidebar"><div className="eforms-side-label">Form Categories</div>{eformsCategories.map((category) => <button key={category} className={`eforms-cat ${tab === category ? 'selected' : ''}`} onClick={() => onTabChange(category)} title={`Browse ${category} forms`}>{category}</button>)}</aside><div className="eforms-main"><div className="eforms-search-row"><Search size={15} /><input placeholder="Search forms..." title="Search the form library by name" /></div><div className="eforms-grid">{tiles.map((tile) => {
  const Icon = tile.icon;
  return <button key={tile.label} className={`eforms-tile ${tile.action ? 'action-tile' : ''}`} onClick={() => handleTileClick(tile)} title={tile.action ? `Start a new ${tile.label}` : `${tile.label} (preview only in this prototype)`}><span className="eforms-tile-icon"><Icon size={28} /></span><span className="eforms-tile-label">{tile.label}</span>{tile.action && <span className="eforms-tile-badge">New</span>}</button>;
})}</div></div></div><div className="eforms-statusbar"><span>eForms Manager · Veritafore</span><span>{tiles.length} form(s) available</span></div></section></div>;
}

function CertificateModal({ customer, onClose, onSaved }: { customer: Customer | null; onClose: () => void; onSaved: (certificate: Certificate) => void }) {
  const [form, setForm] = useState({ holder: 'Master', description: '', policy: '', issuedDate: '2026-07-27', namedInsured: '' });
  const [saving, setSaving] = useState(false);
  const [certificateNumber] = useState(() => buildCertificateNumber('2026-07-27'));
  const isInsuredSelected = form.namedInsured.length > 0;
  function selectInsured(value: string): void {
    setForm({ ...form, namedInsured: value, policy: value ? '07CPK455190-01' : '', description: value ? `Certificate of liability insurance for ${customer?.name || 'insured'}` : '' });
  }
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaving(true);
    const payload = { certificate_number: certificateNumber, insured_name: customer?.name || '', holder_name: form.holder, policy_number: form.policy || '07CPK455190-01', description: form.description || 'Certificate of liability insurance', issued_date: form.issuedDate, status: 'Issued' };
    if (!supabase) {
      onSaved({ ...payload, id: `local-${Date.now()}` });
      setSaving(false);
      return;
    }
    const { data, error } = await supabase.from('coi_certificates').insert(payload).select().maybeSingle();
    if (!error && data) onSaved(data as Certificate);
    else if (error) onSaved({ ...payload, id: `local-${Date.now()}` });
    setSaving(false);
  }
  return <div className="form-backdrop"><section className="legacy-form-window"><div className="legacy-titlebar"><span>eForms - {customer?.name || 'Customer'}</span><div><button title="Minimize">—</button><button title="Maximize">□</button><button onClick={onClose} aria-label="Close" title="Close without saving"><X size={14} /></button></div></div><div className="legacy-menu"><span title="File menu">File</span><span title="Edit menu">Edit</span><span title="eForms menu">eForms</span><span title="View menu">View</span><span title="Operation menu">Operation</span><span title="Toolbox menu">Toolbox</span><span title="Help menu">Help</span></div><div className="legacy-iconbar"><span title="New">◧</span><span title="Open">▣</span><span title="Save">▱</span><span title="Save As">▾</span><span title="Edit form">✎</span><span title="Print">▤</span><span title="Export">◉</span><span title="Link">↔</span><span title="Zoom in">＋</span><span title="Zoom out">−</span><span title="Previous">◀</span><span title="Next">▶</span></div><form onSubmit={submit}><div className="legacy-heading"><b>Certificate of Liability</b><div><button className="legacy-create" disabled={!isInsuredSelected || saving} type="submit" title="Create this certificate and add it to the register">{saving ? 'Saving...' : 'Create'}</button><button type="button" onClick={onClose} title="Discard this form">Cancel</button></div></div><p className="legacy-instruction">Select which form you wish to create, as well as appropriate policies &amp; types of insurance.</p><div className="legacy-form-body"><div className="legacy-left"><fieldset><legend title="The ACORD form template used for this certificate">Form Selection Filters</legend><label>Form: <select title="Certificate form version"><option>Certificate of Liability Insurance, 25, 12/2025</option></select></label></fieldset><div className="legacy-cert-fields"><label>Certificate #: <input value={isInsuredSelected ? certificateNumber : ''} readOnly title="Auto-assigned certificate number: CL + issue date + sequence" /></label><label className="assign" title="Uncheck to enter a certificate number manually"><input type="checkbox" defaultChecked /> Assign Number</label><label>Description: <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} title="Short description to identify this certificate in the register" /></label></div><div className="legacy-row"><label title="Make this certificate visible in the insured's client portal"><input type="checkbox" /> Show to Insured</label><label>Issue Date: <input type="date" value={form.issuedDate} onChange={(event) => setForm({ ...form, issuedDate: event.target.value })} title="Date this certificate is issued" /></label></div><fieldset className="insurance-fieldset"><legend title="Select which coverages appear on this certificate">Type of Insurance</legend><div className="insurance-head"><span>Policy #</span><span>Get detail<br />based on:</span></div>{['General Liability:', 'Automobile:', 'Cargo:', 'Trailer Interchange:', 'Work Comp/Emp Liability:', 'Garage Liability:', 'Garage Keepers Liability:', 'Umbrella/Excess Liability:', 'Other:'].map((type, index) => <label className={index > 1 && index < 7 ? 'disabled-row' : ''} key={type} title={index > 1 && index < 7 ? 'Not applicable to this customer’s policy' : `Include ${type.replace(':', '')} coverage on this certificate`}>{type}<select value={index < 2 && isInsuredSelected ? '07CPK455190-01' : ''} onChange={(event) => setForm({ ...form, policy: event.target.value })}><option value=""> </option><option>07CPK455190-01</option></select><select><option> </option><option>07/27/2026</option></select></label>)}</fieldset></div><div className="legacy-right"><fieldset><legend title="The customer this certificate is issued for">Select Named Insured</legend><select value={form.namedInsured} onChange={(event) => selectInsured(event.target.value)} title="Choose the named insured for this certificate"><option value=""> </option>{customer && <option value={customer.name}>{customer.name} - {customer.address}</option>}</select></fieldset><fieldset className="operations"><legend title="Free text describing operations, locations, or vehicles covered">Description of Operations</legend><label>Default Text: <select title="Insert a saved boilerplate description"><option> </option><option>Commercial transportation operations</option></select><button type="button" title="Insert the selected default text at the cursor">Insert</button><button type="button" title="Replace all text with the selected default text">Replace</button></label><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} title="Description of operations, locations, or vehicles" /><a href="#text-setup" title="Manage saved default text snippets">Text Setup</a></fieldset><fieldset className="note-field"><legend>Note/Message <label title="Print this note on the certificate"><input type="checkbox" defaultChecked /> Print note with form</label></legend><textarea title="Internal note or message to print with the form" /></fieldset><fieldset><legend title="The licensed employee whose signature appears on the certificate">Authorized Representative Signature:</legend><select title="Choose a signature on file"><option> </option><option>Alex Ramirez</option></select></fieldset><div className="legacy-links"><button type="button" title="Add or edit certificate holders after this certificate is created">Holder Detail</button><button type="button" title="Copy holder details from another certificate">Copy Holder Detail</button></div></div></div><div className="legacy-footer"><button type="submit" disabled={!isInsuredSelected || saving} title="Create this certificate">Create</button><span>Meridian Coverage Group</span><span>DEMOU1</span></div></form></section></div>;
}

function CertificateDetail({ certificate, customer, holders, onClose, onPrint, onManageHolders }: { certificate: Certificate; customer: Customer | null; holders: CertificateHolder[]; onClose: () => void; onPrint: () => void; onManageHolders: () => void }) {
  const holder = holders[0] || null;
  const [effDate, expDate] = ['03/22/2026', '03/22/2027'];
  return <div className="modal-backdrop"><section className="acord-drawer"><div className="modal-header"><div><span className="eyebrow">Certificate register</span><h2>{certificate.certificate_number}</h2></div><button onClick={onClose} aria-label="Close" title="Close this preview"><X size={19} /></button></div><div className="detail-status"><span className="pill green" title="Certificate status">{certificate.status}</span><span title="Date this certificate was issued">Issued {new Date(certificate.issued_date).toLocaleDateString('en-US')}</span><button className="link-button" onClick={onManageHolders} title="Add or edit who this certificate names as holder">Manage Holders</button></div>
    <div className="acord-body">
      <div className="acord-topline" title="Standard ACORD 25 Certificate of Liability Insurance form"><span className="acord-logo">ACORD</span><h3>CERTIFICATE OF LIABILITY INSURANCE</h3><span className="acord-date-box">DATE (MM/DD/YYYY)<br /><b>{new Date(certificate.issued_date).toLocaleDateString('en-US')}</b></span></div>
      <p className="acord-boilerplate">THIS CERTIFICATE IS ISSUED AS A MATTER OF INFORMATION ONLY AND CONFERS NO RIGHTS UPON THE CERTIFICATE HOLDER. THIS CERTIFICATE DOES NOT AFFIRMATIVELY OR NEGATIVELY AMEND, EXTEND OR ALTER THE COVERAGE AFFORDED BY THE POLICIES BELOW. THIS CERTIFICATE OF INSURANCE DOES NOT CONSTITUTE A CONTRACT BETWEEN THE ISSUING INSURER(S), AUTHORIZED REPRESENTATIVE OR PRODUCER, AND THE CERTIFICATE HOLDER.</p>
      <p className="acord-boilerplate">IMPORTANT: If the certificate holder is an ADDITIONAL INSURED, the policy(ies) must have ADDITIONAL INSURED provisions or be endorsed. If SUBROGATION IS WAIVED, subject to the terms and conditions of the policy, certain policies may require an endorsement. A statement on this certificate does not confer rights to the certificate holder in lieu of such endorsement(s).</p>
      <div className="acord-grid">
        <div className="acord-cell producer" title="The agency issuing this certificate"><b>PRODUCER</b><span>Meridian Coverage Group, Inc</span><span>PO Box 9</span><span>Central City, ST 40001</span></div>
        <div className="acord-cell contact" title="Agency contact for questions about this certificate"><b>CONTACT NAME:</b><span>House Account</span><b>PHONE (A/C, No, Ext):</b><span>(555) 010-9200</span><b>EMAIL ADDRESS:</b><span>certs@meridiancoverage.example.com</span></div>
        <div className="acord-cell insured" title="The policyholder named on the policy"><b>INSURED</b><span>{customer?.name || certificate.insured_name}</span><span>{customer?.address}</span><span>{customer ? `${customer.city}, ${customer.state} ${customer.zip}` : ''}</span></div>
        <div className="acord-cell insurers" title="Carriers affording the coverage listed below"><table><tbody><tr><td>INSURER A:</td><td>Meridian National Insurance Company</td><td>30045</td></tr><tr><td>INSURER B:</td><td /><td /></tr><tr><td>INSURER C:</td><td /><td /></tr></tbody></table></div>
      </div>
      <div className="acord-coverages-bar" title="Certificate and revision tracking numbers"><span>COVERAGES</span><span>CERTIFICATE NUMBER: {certificate.certificate_number}</span><span>REVISION NUMBER:</span></div>
      <table className="acord-coverage-table"><thead><tr><th title="Letter referencing which insurer wrote this coverage">INSR LTR</th><th title="Coverage line">TYPE OF INSURANCE</th><th title="Policy number for this coverage">POLICY NUMBER</th><th title="Policy effective date">POLICY EFF</th><th title="Policy expiration date">POLICY EXP</th><th title="Coverage limits">LIMITS</th></tr></thead><tbody>
        <tr><td>A</td><td>COMMERCIAL GENERAL LIABILITY</td><td>{certificate.policy_number}</td><td>{effDate}</td><td>{expDate}</td><td>EACH OCCURRENCE $1,000,000<br />GENERAL AGGREGATE $2,000,000</td></tr>
        <tr><td>A</td><td>AUTOMOBILE LIABILITY</td><td>{certificate.policy_number}</td><td>{effDate}</td><td>{expDate}</td><td>COMBINED SINGLE LIMIT $1,000,000</td></tr>
        <tr><td /><td>UMBRELLA LIAB / EXCESS LIAB</td><td /><td /><td /><td>EACH OCCURRENCE<br />AGGREGATE</td></tr>
        <tr><td /><td>WORKERS COMPENSATION AND EMPLOYERS' LIABILITY</td><td /><td /><td /><td>E.L. EACH ACCIDENT<br />E.L. DISEASE - POLICY LIMIT</td></tr>
      </tbody></table>
      <div className="acord-cell full" title="Free-text description of the operations, locations, or vehicles this certificate covers"><b>DESCRIPTION OF OPERATIONS / LOCATIONS / VEHICLES</b><span>{certificate.description}</span></div>
      <div className="acord-grid">
        <div className="acord-cell full" title="Who this certificate is being issued to"><b>CERTIFICATE HOLDER</b>{holder ? <><span>{holder.name}</span><span>{holder.address}</span><span>{holder.city}, {holder.state} {holder.zip}</span></> : <span>Master Certificate — no specific holder assigned</span>}</div>
        <div className="acord-cell full" title="Standard ACORD cancellation notice clause"><b>CANCELLATION</b><span>SHOULD ANY OF THE ABOVE DESCRIBED POLICIES BE CANCELLED BEFORE THE EXPIRATION DATE THEREOF, NOTICE WILL BE DELIVERED IN ACCORDANCE WITH THE POLICY PROVISIONS.</span></div>
      </div>
      <div className="acord-signature" title="Signature of the agency's authorized representative"><span>AUTHORIZED REPRESENTATIVE</span><span className="acord-sig-line">Alex Ramirez</span></div>
      <div className="acord-footer"><span>ACORD 25 (2025/12)</span><span>© 1988-2025 ACORD CORPORATION. All rights reserved.</span></div>
    </div>
    <div className="modal-footer"><button onClick={onClose} title="Close this preview">Close</button><button className="primary-action" onClick={onPrint} title="Print or export this certificate as a PDF"><Printer size={15} /> Print / Export</button></div>
  </section></div>;
}

function CustomerModal({ initial, onClose, onSaved }: { initial: Customer | null; onClose: () => void; onSaved: (form: CustomerFormState) => void }) {
  const [form, setForm] = useState<CustomerFormState>(() => initial ? customerToFormState(initial) : { customerType: 'Customer', nameType: 'Business', firmName: '', dba: '', fein: '', firstName: '', lastName: '', dob: '', address: '', city: '', state: '', zip: '', phone: '', email: '', primaryExecutive: 'Alex Ramirez', primaryRepresentative: 'House Account' });
  const [saving, setSaving] = useState(false);
  const displayName = form.nameType === 'Business' ? form.firmName.trim() : `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
  const canSave = displayName.length > 0 && form.address.trim().length > 0 && form.city.trim().length > 0 && form.state.trim().length > 0 && form.zip.trim().length > 0;

  function update<K extends keyof CustomerFormState>(key: K, value: CustomerFormState[K]): void {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);
    await onSaved(form);
    setSaving(false);
  }

  return <div className="modal-backdrop"><section className="modal"><div className="modal-header"><div><span className="eyebrow">{initial ? 'Edit customer' : 'New customer'}</span><h2>{initial ? initial.name : 'Customer Setup'}</h2></div><button onClick={onClose} aria-label="Close" title="Close without saving"><X size={19} /></button></div><form onSubmit={submit}>
    <div className="modal-body">
    <div className="modal-section">
      <div className="section-label" title="How this customer is classified and named"><BriefcaseBusiness size={14} /> Customer Type &amp; Name</div>
      <div className="field-grid">
        <label>Customer Type<select value={form.customerType} onChange={(event) => update('customerType', event.target.value as Customer['customerType'])} title="Customer: active account. Prospect: qualified lead you can quote. Suspect: unqualified lead."><option>Customer</option><option>Prospect</option><option>Suspect</option></select></label>
        <label>Name Type<select value={form.nameType} onChange={(event) => update('nameType', event.target.value as CustomerFormState['nameType'])} title="Business for commercial lines, Individual for personal lines"><option>Business</option><option>Individual</option></select></label>
        {form.nameType === 'Business' ? (<>
          <label>Firm Name<input required value={form.firmName} onChange={(event) => update('firmName', event.target.value)} title="Legal business name" /></label>
          <label>DBA<input value={form.dba} onChange={(event) => update('dba', event.target.value)} title="Doing Business As name, if different from the legal name" /></label>
          <label>FEIN<input value={form.fein} onChange={(event) => update('fein', event.target.value)} placeholder="00-0000000" title="Federal Employer Identification Number" /></label>
        </>) : (<>
          <label>First Name<input required value={form.firstName} onChange={(event) => update('firstName', event.target.value)} title="Insured's first name" /></label>
          <label>Last Name<input required value={form.lastName} onChange={(event) => update('lastName', event.target.value)} title="Insured's last name" /></label>
          <label>Date of Birth<input type="date" value={form.dob} onChange={(event) => update('dob', event.target.value)} title="Used for personal lines underwriting" /></label>
        </>)}
      </div>
      <div className="notice"><ShieldCheck size={14} /> {form.nameType === 'Business' ? 'Commercial lines: business coverage will be written under this firm name and FEIN.' : 'Personal lines: coverage will be written under this individual’s name.'}</div>
    </div>
    <div className="modal-section">
      <div className="section-label" title="How to reach this customer"><Link2 size={14} /> Contact &amp; Address</div>
      <div className="field-grid">
        <label>Phone<input value={form.phone} onChange={(event) => update('phone', event.target.value)} title="Primary phone number" /></label>
        <label>Email<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} title="Primary email address" /></label>
        <label className="full">Address<input required value={form.address} onChange={(event) => update('address', event.target.value)} title="Street address" /></label>
        <label>City<input required value={form.city} onChange={(event) => update('city', event.target.value)} /></label>
        <label>State<input required maxLength={2} value={form.state} onChange={(event) => update('state', event.target.value.toUpperCase())} title="Two-letter state code" /></label>
        <label>Zip<input required value={form.zip} onChange={(event) => update('zip', event.target.value)} /></label>
      </div>
    </div>
    <div className="modal-section">
      <div className="section-label" title="Who at the agency services this account"><Gauge size={14} /> Agency Personnel</div>
      <div className="field-grid">
        <label>Primary Executive<input value={form.primaryExecutive} onChange={(event) => update('primaryExecutive', event.target.value)} title="Agency executive assigned to this account" /></label>
        <label>Primary Representative<input value={form.primaryRepresentative} onChange={(event) => update('primaryRepresentative', event.target.value)} title="Agency representative assigned to this account" /></label>
      </div>
      <div className="notice"><ShieldCheck size={14} /> This becomes the policy Named Insured and appears on invoices and certificates.</div>
    </div>
    </div>
    <div className="modal-footer"><button type="button" onClick={onClose} title="Discard changes">Cancel</button><button type="submit" className="primary-action" disabled={!canSave || saving} title={initial ? 'Save changes to this customer' : 'Create this customer record'}>{saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Customer'}</button></div>
  </form></section></div>;
}

function HolderManagerModal({ certificateNumber, holders, onClose, onSaved }: { certificateNumber: string; holders: CertificateHolder[]; onClose: () => void; onSaved: (holders: CertificateHolder[]) => void }) {
  const [draft, setDraft] = useState<CertificateHolder[]>(holders);
  const [view, setView] = useState<'grid' | 'form'>('grid');
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [form, setForm] = useState<CertificateHolder>(emptyHolderForm());
  const picked = draft.find((holder) => holder.id === pickedId) || null;

  function update<K extends keyof CertificateHolder>(key: K, value: CertificateHolder[K]): void {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openNewHolder(): void {
    setForm(emptyHolderForm());
    setView('form');
  }

  function openEditHolder(): void {
    if (!picked) return;
    setForm(picked);
    setView('form');
  }

  function deleteHolder(): void {
    if (!picked) return;
    setDraft((current) => current.filter((holder) => holder.id !== picked.id));
    setPickedId(null);
  }

  function addHolder(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!form.name.trim()) return;
    if (form.id) {
      setDraft((current) => current.map((holder) => (holder.id === form.id ? form : holder)));
    } else {
      setDraft((current) => [...current, { ...form, id: `holder-${Date.now()}` }]);
    }
    setView('grid');
  }

  if (view === 'form') {
    return <div className="form-backdrop"><section className="legacy-form-window holder-form"><div className="legacy-titlebar"><span>Add/Edit Certificate Holders</span><div><button title="Minimize">—</button><button title="Maximize">□</button><button onClick={() => setView('grid')} aria-label="Close" title="Back to holder list without saving"><X size={14} /></button></div></div><form onSubmit={addHolder}><div className="legacy-heading"><b>Add/Edit Certificate Holders</b><div><button className="legacy-create" type="submit" title={form.id ? 'Save changes to this holder' : 'Add this holder to the certificate'}>{form.id ? 'Save' : 'Add'}</button><button type="button" onClick={() => setView('grid')} title="Discard and return to the holder list">Cancel</button></div></div><div className="legacy-form-body holder-body"><div className="legacy-left"><fieldset><legend title="Where this holder's name is sourced from">Name Selection</legend>{['Additional Named Insureds', 'Certificate Holder Master List', 'Customer Certificate Holder List', 'Policy Additional Interests', 'Setup Additional Interests'].map((option, index) => <label key={option} title={`Pull holder names from: ${option}`}><input type="radio" name="name-selection" defaultChecked={index === 1} readOnly /> {option}</label>)}</fieldset><fieldset><legend title="How many days' notice this holder receives before cancellation">Written Notice</legend><label># of Days: <input type="number" defaultValue={10} title="Days of advance notice before policy cancellation" /></label></fieldset><fieldset><legend>Holder Details</legend><label>Name: <input required value={form.name} onChange={(event) => update('name', event.target.value)} title="Certificate holder's name" /></label><label>Contact: <input value={form.contact} onChange={(event) => update('contact', event.target.value)} title="Contact person at the holder" /></label><label>Address: <input value={form.address} onChange={(event) => update('address', event.target.value)} /></label><label>City: <input value={form.city} onChange={(event) => update('city', event.target.value)} /></label><label>State: <input maxLength={2} value={form.state} onChange={(event) => update('state', event.target.value.toUpperCase())} /></label><label>Zip: <input value={form.zip} onChange={(event) => update('zip', event.target.value)} /></label><label>Email: <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} title="Email to distribute the certificate to" /></label></fieldset></div><div className="legacy-right"><fieldset><legend title="Whether this holder is added as an additional insured, and whether the insurer waives its right to subrogate against them">Additional Insured and Waiver of Subrogation</legend><div className="holder-matrix-head"><span /><span>Additional Insured?</span><span>Waiver of Subrogation?</span></div>{coverageTypes.map((type) => <div className="holder-matrix-row" key={type} title={type}><span>{type}</span><span><label title={`Add this holder as an additional insured for ${type}`}><input type="radio" name={`ai-${type}`} checked={form.additionalInsured[type] === true} onChange={() => update('additionalInsured', { ...form.additionalInsured, [type]: true })} /> Y</label><label title={`Do not add as additional insured for ${type}`}><input type="radio" name={`ai-${type}`} checked={form.additionalInsured[type] !== true} onChange={() => update('additionalInsured', { ...form.additionalInsured, [type]: false })} /> N</label></span><span><label title={`Waive subrogation rights against this holder for ${type}`}><input type="radio" name={`wv-${type}`} checked={form.waiverOfSubrogation[type] === true} onChange={() => update('waiverOfSubrogation', { ...form.waiverOfSubrogation, [type]: true })} /> Y</label><label title={`Do not waive subrogation for ${type}`}><input type="radio" name={`wv-${type}`} checked={form.waiverOfSubrogation[type] !== true} onChange={() => update('waiverOfSubrogation', { ...form.waiverOfSubrogation, [type]: false })} /> N</label></span></div>)}</fieldset><fieldset><legend>Additional Information</legend><label>Job Type: <input value={form.jobType} onChange={(event) => update('jobType', event.target.value)} title="Type of job or project this holder relates to" /></label><label>Job #: <input value={form.jobNumber} onChange={(event) => update('jobNumber', event.target.value)} title="Job or project number" /></label><label>Project End Date: <input type="date" value={form.projectEndDate} onChange={(event) => update('projectEndDate', event.target.value)} title="Expected project completion date" /></label></fieldset></div></div><div className="legacy-footer"><button type="submit" title={form.id ? 'Save changes to this holder' : 'Add this holder to the certificate'}>{form.id ? 'Save' : 'Add'}</button><span>Meridian Coverage Group</span><span>DEMOU1</span></div></form></section></div>;
  }

  return <div className="form-backdrop"><section className="legacy-form-window holder-form"><div className="legacy-titlebar"><span>Add/Edit Certificate Holders</span><div><button title="Minimize">—</button><button title="Maximize">□</button><button onClick={onClose} aria-label="Close" title="Close without saving holder changes"><X size={14} /></button></div></div><div className="legacy-heading"><b>Add/Edit Certificate Holders — {certificateNumber}</b><div><button className="legacy-create" onClick={() => onSaved(draft)} title="Save this holder list and regenerate the certificate register entry">Create/Refresh Forms</button><button type="button" onClick={onClose} title="Close without saving">Cancel</button></div></div><div className="holder-grid-toolbar"><button onClick={openNewHolder} title="Add a new certificate holder">New</button><button disabled={!picked} onClick={openEditHolder} title={picked ? `Edit ${picked.name}` : 'Select a holder first'}>Edit</button><button disabled={!picked} onClick={deleteHolder} title={picked ? `Remove ${picked.name}` : 'Select a holder first'}>Delete</button><button type="button" className="link-button" title="Copy holders from another certificate (not available in this prototype)">Copy multiple holders</button></div><div className="table-scroll"><table><thead><tr><th>Name</th><th>Addr</th><th>City</th><th>State</th><th>Zip</th><th>Job Type</th><th>Job #</th><th>Project End Date</th></tr></thead><tbody>{draft.length === 0 ? <tr><td colSpan={8} className="empty">No results were found.</td></tr> : draft.map((holder) => <tr key={holder.id} className={pickedId === holder.id ? 'row-selected' : ''} onClick={() => setPickedId(holder.id)} title="Click to select this holder"><td>{holder.name}</td><td>{holder.address}</td><td>{holder.city}</td><td>{holder.state}</td><td>{holder.zip}</td><td>{holder.jobType}</td><td>{holder.jobNumber}</td><td>{holder.projectEndDate}</td></tr>)}</tbody></table></div></section></div>;
}

function EndorsementModal({ onClose, onSaved }: { onClose: () => void; onSaved: (endorsement: Endorsement) => void }) {
  const [description, setDescription] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('2026-07-27');
  const [transactionType, setTransactionType] = useState('Add Coverage');
  const canSave = description.trim().length > 0;

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSave) return;
    onSaved({ id: `endorsement-${Date.now()}`, description: description.trim(), effectiveDate, transactionType });
  }

  return <div className="modal-backdrop"><section className="modal"><div className="modal-header"><div><span className="eyebrow">Policy transaction</span><h2>Endorse Policy 07CPK455190-01</h2></div><button onClick={onClose} aria-label="Close" title="Close without submitting"><X size={19} /></button></div><form onSubmit={submit}>
    <div className="modal-body">
    <div className="modal-section">
      <div className="section-label" title="Details for this mid-term policy change"><Pencil size={14} /> Endorsement Details</div>
      <div className="field-grid">
        <label>Transaction Type<select value={transactionType} onChange={(event) => setTransactionType(event.target.value)} title="What kind of change this endorsement makes"><option>Add Coverage</option><option>Remove Coverage</option><option>Change Limits</option><option>Add Driver/Vehicle</option><option>Change Named Insured</option><option>Other Endorsement</option></select></label>
        <label>Effective Date<input type="date" value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} title="Date this endorsement takes effect" /></label>
        <label className="full">Description of Change<textarea required value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the change being endorsed onto the policy" title="Explain what is changing on the policy" /></label>
      </div>
      <div className="notice"><ShieldCheck size={14} /> This creates an endorsement transaction on the policy and updates the transaction history.</div>
    </div>
    </div>
    <div className="modal-footer"><button type="button" onClick={onClose} title="Discard this endorsement">Cancel</button><button type="submit" className="primary-action" disabled={!canSave} title="Submit this endorsement for processing">Submit Endorsement</button></div>
  </form></section></div>;
}

export default App;
