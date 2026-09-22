import { useEffect, useMemo, useState, type FormEvent } from 'react';
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
  firstName: string;
  lastName: string;
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
    firstName: '',
    lastName: '',
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

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><span /></span><strong>AMS360</strong></div>
        <button className="quick-button" aria-label="Quick actions"><Zap size={17} /></button>
        <nav className="primary-nav">
          {['Customer', 'Broker', 'Company'].map((item) => <button className={item === 'Customer' ? 'active' : ''} key={item}>{item}</button>)}
        </nav>
        <div className="top-actions"><button aria-label="Links"><Link2 size={19} /></button><button aria-label="Notifications"><Bell size={19} /><i /></button><button aria-label="Help"><CircleHelp size={19} /></button><button className="user-menu"><span className="avatar">D</span><span>DEMOU1</span><ChevronDown size={15} /></button></div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-heading"><span>Views</span><button aria-label="Collapse sidebar"><ChevronLeft size={14} /></button></div>
          <div className="side-group">
            <div className="side-label"><Gauge size={13} /> Actions</div>
            {['New Customer', 'Notes', 'Target List'].map((item) => <button className="side-item" key={item} onClick={item === 'New Customer' ? openNewCustomer : undefined}>{item}</button>)}
            <button className="side-item quick"><Files size={13} /> Quick Reports</button>
          </div>
          <div className="side-group customer-nav">
            <div className="side-label"><BriefcaseBusiness size={13} /> Customer</div>
            {navItems.map((item) => <button key={item} onClick={() => setActiveSection(item)} className={`side-item ${activeSection === item ? 'selected' : ''}`}>{item}</button>)}
          </div>
          <div className="side-group bottom-actions"><div className="side-label"><Settings size={13} /> Actions</div><button className={`side-item ${isEformsOpen ? 'selected' : ''}`} onClick={() => setIsEformsOpen((current) => !current)}><Files size={13} /> eForms</button>{isEformsOpen && <div className="eforms-menu"><button onClick={() => { setIsEformsOpen(true); setEformsTab('All Forms'); }}>Launch eForms Manager</button><strong>New</strong>{['Applications', 'Auto ID Card', 'Binder', 'Cancellation', 'Certificate of Liability', 'Certificate of Property', 'Change Request', 'EPI', 'Loss Notice', 'Additional Forms'].map((item) => <button key={item} onClick={() => { setEformsTab(item === 'Certificate of Liability' ? 'Certificates' : 'All Forms'); setIsEformsOpen(true); }}>{item}</button>)}</div>}<button className="side-item quick"><Files size={13} /> Quick Reports</button></div>
        </aside>

        <main className="main-area">
          <div className="breadcrumb"><span>Customer</span><ChevronRight size={12} /><strong>{selectedCustomer?.name || 'Customer Search'}</strong><ChevronRight size={12} /><em>{activeSection}</em></div>
          {activeSection === 'Customer Overview' || !selectedCustomer ? <CustomerSearch search={search} setSearch={setSearch} matches={matches} selectedCustomer={selectedCustomer} onSubmit={handleCustomerSearch} onSelect={(customer) => { setSelectedCustomer(customer); setActiveSection('Certificates'); notify('Customer record loaded'); }} onNewCustomer={openNewCustomer} onEditCustomer={openEditCustomer} onDeleteCustomer={handleCustomerDeleted} /> : (
            <>
              <div className="page-heading"><div><h1>{selectedCustomer.name} <span>— {activeSection}</span></h1><div className="summary"><span className="green-dot" /> <b>$0.00</b><span>|</span><span>{selectedCustomer.customerType}</span><span>|</span><span>{selectedCustomer.primaryExecutive || 'Unassigned'}</span><span>|</span><span>{selectedCustomer.primaryRepresentative || 'Unassigned'}</span></div></div><div className="heading-actions"><button><ShieldCheck size={15} /> Additional Customer Info</button><button onClick={() => openEditCustomer(selectedCustomer)}><Pencil size={14} /> Edit Customer</button><CircleHelp size={16} /></div></div>
              <div className="content-card">
                <div className="viewbar"><button className="collapse"><ChevronDown size={14} /> View Options</button><div className="view-select"><span>Select View:</span><select defaultValue="System Default"><option>System Default</option><option>My Certificate View</option></select><button>Apply View</button></div></div>
                {activeSection === 'Policies' ? <Policies /> : activeSection === 'Certificates' ? <CertificateRegister certificates={certificates} loading={loading} onNew={() => { setEformsTab('Certificates'); setIsEformsOpen(true); }} onSelect={setSelectedCertificate} /> : <PlaceholderSection section={activeSection} onCertificates={() => setActiveSection('Certificates')} />}
              </div>
            </>
          )}
        </main>
      </div>
      <footer className="statusbar"><span><span className="status-logo">360</span> Toolbox</span><span>Contacts</span><strong>WorkSmart</strong><span className="footer-right">Veritafore</span></footer>

      {isEformsOpen && <EformsManager customer={selectedCustomer} tab={eformsTab} onTabChange={setEformsTab} onClose={() => setIsEformsOpen(false)} onNewCertificate={() => setIsModalOpen(true)} />}
      {isModalOpen && <CertificateModal customer={selectedCustomer} onClose={() => setIsModalOpen(false)} onSaved={handleCertificateSaved} />}
      {isCustomerModalOpen && <CustomerModal initial={editingCustomer} onClose={() => { setIsCustomerModalOpen(false); setEditingCustomer(null); }} onSaved={handleCustomerSaved} />}
      {selectedCertificate && <CertificateDetail certificate={selectedCertificate} onClose={() => setSelectedCertificate(null)} onPrint={() => notify('Certificate is ready to print')} />}
      {toast && <div className="toast"><ShieldCheck size={17} /> {toast}</div>}
    </div>
  );
}

function CustomerSearch({ search, setSearch, matches, selectedCustomer, onSubmit, onSelect, onNewCustomer, onEditCustomer, onDeleteCustomer }: { search: string; setSearch: (value: string) => void; matches: Customer[]; selectedCustomer: Customer | null; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onSelect: (customer: Customer) => void; onNewCustomer: () => void; onEditCustomer: (customer: Customer) => void; onDeleteCustomer: (customer: Customer) => void }) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const picked = matches.find((customer) => customer.id === pickedId) || null;
  return <div className="customer-screen"><div className="customer-screen-title"><strong>Customer</strong><span>Meridian Coverage Group, Inc. · 884215-1</span><CircleHelp size={14} /></div><form className="customer-controls" onSubmit={onSubmit}><div className="customer-search-input"><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search customer" /><button type="submit" aria-label="Search"><Search size={16} /></button></div><span>Pick:</span><select aria-label="Pick result"><option>1</option><option>2</option></select><div className="search-rules">Search By: <b>Name</b> &nbsp;|&nbsp; Include: All &nbsp;|&nbsp; Agency, Broker &nbsp;|&nbsp; Customer Type: Customers</div></form><div className="customer-viewbar"><button><ChevronDown size={13} /> View Options</button><div><span>Select View:</span><select defaultValue="User Default"><option>User Default</option><option>System Default</option></select><button className="apply">Apply View</button></div></div><div className="customer-grid"><div className="grid-actions"><button onClick={onNewCustomer}><Plus size={14} /> New Customer</button><button disabled={!picked} onClick={() => picked && onEditCustomer(picked)}>Edit</button><button disabled={!picked} onClick={() => picked && onSelect(picked)}>Open</button><button disabled={!picked} onClick={() => picked && onDeleteCustomer(picked)}>Delete</button></div><table><thead><tr><th>#</th><th>Match</th><th>Name</th><th>Address</th><th>City</th><th>State</th><th>Zip</th><th>Phone List</th><th>Primary Exec.</th><th>Primary Rep(s)</th><th>Account</th><th>Customer Type</th><th>Master</th><th>Business Unit</th><th>Business with Agency</th></tr></thead><tbody>{matches.map((customer, index) => <tr key={customer.id} className={selectedCustomer?.id === customer.id || pickedId === customer.id ? 'row-selected' : ''} onClick={() => setPickedId(customer.id)} onDoubleClick={() => onSelect(customer)}><td>{index + 1}</td><td>{customer.name}</td><td className="link" onClick={(event) => { event.stopPropagation(); onSelect(customer); }}>{customer.name}</td><td>{customer.address}</td><td>{customer.city}</td><td>{customer.state}</td><td>{customer.zip}</td><td>{customer.phone}</td><td>{customer.primaryExecutive || 'Unassigned'}</td><td>{customer.primaryRepresentative || 'Unassigned'}</td><td>10045822</td><td>{customer.customerType}</td><td>Standard</td><td>Central</td><td>Commercial</td></tr>)}</tbody></table><div className="customer-grid-footer"><span><ChevronLeft size={13} /> <ChevronLeft size={13} /> <b>1</b> <ChevronRight size={13} /> <ChevronRight size={13} /></span><span>{matches.length ? `Displaying record(s) 1 - ${matches.length} of ${matches.length}` : 'No records to display'}</span></div></div></div>;
}

function Policies() {
  return <div className="policy-layout"><div className="table-wrap"><div className="toolbar"><button><Plus size={14} /> New Policy</button><button>Copy</button><button>Endorse</button><button>Renew</button><button className="danger">Cancel</button><button>Compare</button><button>Export All</button></div><table><thead><tr><th>Policy #</th><th>Status</th><th>Term</th><th>Type</th><th>Company</th><th>Transaction</th><th>Effective</th></tr></thead><tbody><tr className="row-selected"><td className="link">07CPK455190-01</td><td><span className="pill green">Active</span></td><td>03/22/2026<br />03/22/2027</td><td>Package<br />CPKGE</td><td>Meridian National<br />Insurance Company</td><td>Policy change</td><td>07/14/2026</td></tr></tbody></table></div><aside className="policy-summary"><h3>Policy Summary</h3><InfoBlock title="Basic Policy Information" lines={['Business New to Agency: N', 'Policy #: 07CPK455190-01', 'Policy Term: 03/22/2026 - 03/22/2027', 'Policy Type: Package', 'Transaction Date: 07/14/2026', 'Parent Company: Meridian Holdings Inc', 'Writing Company: Meridian National Insurance Company', 'Division: Central Division', 'Branch: Uptown Branch', 'Department: Small Commercial']} /><InfoBlock title="Service Personnel" lines={['Primary Executive: Alex Ramirez', 'Primary Representative: House Account']} /><InfoBlock title="First Named Insured" lines={['Name: MORGAN ELLIS', 'Firm Name: NORTHGATE FREIGHT SOLUTIONS INC', 'Business: (312) 555-0148', 'Email: dispatch@northgatefreight.example.com']} /></aside></div>;
}

function InfoBlock({ title, lines }: { title: string; lines: string[] }) { return <div className="info-block"><strong>{title}</strong>{lines.map((line) => <span key={line}>{line}</span>)}</div>; }

function CertificateRegister({ certificates, loading, onNew, onSelect }: { certificates: Certificate[]; loading: boolean; onNew: () => void; onSelect: (certificate: Certificate) => void }) {
  return <div className="register"><div className="toolbar"><button className="primary-action" onClick={onNew}><FilePlus2 size={15} /> New Cert Lib</button><button onClick={onNew}><Plus size={15} /> New Cert Prop</button><button><Files size={14} /> Export All</button><button className="more"><MoreHorizontal size={17} /></button></div><div className="table-scroll"><table><thead><tr><th>Type</th><th>Certificate #</th><th>Description</th><th>Holder</th><th>Description of Ops./Special Cond.</th><th>Policy #</th><th>Issued Date</th><th>Status</th></tr></thead><tbody>{loading ? <tr><td colSpan={8} className="empty">Loading certificates...</td></tr> : certificates.map((certificate) => <tr key={certificate.id} onClick={() => onSelect(certificate)}><td>Liability</td><td className="link">{certificate.certificate_number}</td><td>Master</td><td>{certificate.holder_name}</td><td>{certificate.description}</td><td>{certificate.policy_number}</td><td>{new Date(certificate.issued_date).toLocaleDateString('en-US')}</td><td><span className="pill green">{certificate.status}</span></td></tr>)}</tbody></table></div><div className="pager"><span>Displaying record(s) 1 - {certificates.length} of {certificates.length}</span><span><ChevronLeft size={14} /><b>1</b><ChevronRight size={14} /></span></div></div>;
}

function PlaceholderSection({ section, onCertificates }: { section: string; onCertificates: () => void }) { return <div className="placeholder"><div className="placeholder-icon"><Files size={27} /></div><h2>{section}</h2><p>This customer workspace is ready for the next activity. Use Certificates to create and manage proof of insurance.</p><button onClick={onCertificates}>Open Certificates</button></div>; }

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
  return <div className="eforms-backdrop"><section className="eforms-window"><div className="eforms-titlebar"><span className="eforms-title">eForms Manager</span><div className="eforms-title-actions"><button aria-label="Minimize">—</button><button aria-label="Maximize">□</button><button onClick={onClose} aria-label="Close"><X size={15} /></button></div></div><div className="eforms-toolbar"><button>File</button><button>Edit</button><button>View</button><button>Tools</button><button>Help</button><span className="eforms-customer">Customer: <b>{customer?.name || '—'}</b></span></div><div className="eforms-body"><aside className="eforms-sidebar"><div className="eforms-side-label">Form Categories</div>{eformsCategories.map((category) => <button key={category} className={`eforms-cat ${tab === category ? 'selected' : ''}`} onClick={() => onTabChange(category)}>{category}</button>)}</aside><div className="eforms-main"><div className="eforms-search-row"><Search size={15} /><input placeholder="Search forms..." /></div><div className="eforms-grid">{tiles.map((tile) => {
  const Icon = tile.icon;
  return <button key={tile.label} className={`eforms-tile ${tile.action ? 'action-tile' : ''}`} onClick={() => handleTileClick(tile)}><span className="eforms-tile-icon"><Icon size={28} /></span><span className="eforms-tile-label">{tile.label}</span>{tile.action && <span className="eforms-tile-badge">New</span>}</button>;
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
  return <div className="form-backdrop"><section className="legacy-form-window"><div className="legacy-titlebar"><span>eForms - {customer?.name || 'Customer'}</span><div><button>—</button><button>□</button><button onClick={onClose} aria-label="Close"><X size={14} /></button></div></div><div className="legacy-menu"><span>File</span><span>Edit</span><span>eForms</span><span>View</span><span>Operation</span><span>Toolbox</span><span>Help</span></div><div className="legacy-iconbar"><span>◧</span><span>▣</span><span>▱</span><span>▾</span><span>✎</span><span>▤</span><span>◉</span><span>↔</span><span>＋</span><span>−</span><span>◀</span><span>▶</span></div><form onSubmit={submit}><div className="legacy-heading"><b>Certificate of Liability</b><div><button className="legacy-create" disabled={!isInsuredSelected || saving} type="submit">{saving ? 'Saving...' : 'Create'}</button><button type="button" onClick={onClose}>Cancel</button></div></div><p className="legacy-instruction">Select which form you wish to create, as well as appropriate policies &amp; types of insurance.</p><div className="legacy-form-body"><div className="legacy-left"><fieldset><legend>Form Selection Filters</legend><label>Form: <select><option>Certificate of Liability Insurance, 25, 12/2025</option></select></label></fieldset><div className="legacy-cert-fields"><label>Certificate #: <input value={isInsuredSelected ? certificateNumber : ''} readOnly /></label><label className="assign"><input type="checkbox" defaultChecked /> Assign Number</label><label>Description: <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label></div><div className="legacy-row"><label><input type="checkbox" /> Show to Insured</label><label>Issue Date: <input type="date" value={form.issuedDate} onChange={(event) => setForm({ ...form, issuedDate: event.target.value })} /></label></div><fieldset className="insurance-fieldset"><legend>Type of Insurance</legend><div className="insurance-head"><span>Policy #</span><span>Get detail<br />based on:</span></div>{['General Liability:', 'Automobile:', 'Cargo:', 'Trailer Interchange:', 'Work Comp/Emp Liability:', 'Garage Liability:', 'Garage Keepers Liability:', 'Umbrella/Excess Liability:', 'Other:'].map((type, index) => <label className={index > 1 && index < 7 ? 'disabled-row' : ''} key={type}>{type}<select value={index < 2 && isInsuredSelected ? '07CPK455190-01' : ''} onChange={(event) => setForm({ ...form, policy: event.target.value })}><option value=""> </option><option>07CPK455190-01</option></select><select><option> </option><option>07/27/2026</option></select></label>)}</fieldset></div><div className="legacy-right"><fieldset><legend>Select Named Insured</legend><select value={form.namedInsured} onChange={(event) => selectInsured(event.target.value)}><option value=""> </option>{customer && <option value={customer.name}>{customer.name} - {customer.address}</option>}</select></fieldset><fieldset className="operations"><legend>Description of Operations</legend><label>Default Text: <select><option> </option><option>Commercial transportation operations</option></select><button type="button">Insert</button><button type="button">Replace</button></label><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><a href="#text-setup">Text Setup</a></fieldset><fieldset className="note-field"><legend>Note/Message <label><input type="checkbox" defaultChecked /> Print note with form</label></legend><textarea /></fieldset><fieldset><legend>Authorized Representative Signature:</legend><select><option> </option><option>Alex Ramirez</option></select></fieldset><div className="legacy-links"><button type="button">Holder Detail</button><button type="button">Copy Holder Detail</button></div></div></div><div className="legacy-footer"><button type="submit" disabled={!isInsuredSelected || saving}>Create</button><span>Meridian Coverage Group</span><span>DEMOU1</span></div></form></section></div>;
}

function CertificateDetail({ certificate, onClose, onPrint }: { certificate: Certificate; onClose: () => void; onPrint: () => void }) { return <div className="modal-backdrop"><section className="detail-drawer"><div className="modal-header"><div><span className="eyebrow">Certificate register</span><h2>{certificate.certificate_number}</h2></div><button onClick={onClose} aria-label="Close"><X size={19} /></button></div><div className="detail-status"><span className="pill green">{certificate.status}</span><span>Issued {new Date(certificate.issued_date).toLocaleDateString('en-US')}</span></div><div className="document-preview"><div className="document-top"><span className="document-logo">AMS<span>360</span></span><span>ACORD 25 (2016/03)</span></div><h3>CERTIFICATE OF LIABILITY INSURANCE</h3><p>This certificate is issued as a matter of information only and confers no rights upon the certificate holder.</p><div className="document-line"><b>INSURED</b><span>{certificate.insured_name}</span></div><div className="document-line"><b>CERTIFICATE HOLDER</b><span>{certificate.holder_name}</span></div><div className="document-line"><b>DESCRIPTION OF OPERATIONS</b><span>{certificate.description}</span></div><div className="document-line"><b>POLICY NUMBER</b><span>{certificate.policy_number}</span></div></div><div className="modal-footer"><button onClick={onClose}>Close</button><button className="primary-action" onClick={onPrint}><Printer size={15} /> Print / Export</button></div></section></div>; }

function CustomerModal({ initial, onClose, onSaved }: { initial: Customer | null; onClose: () => void; onSaved: (form: CustomerFormState) => void }) {
  const [form, setForm] = useState<CustomerFormState>(() => initial ? customerToFormState(initial) : { customerType: 'Customer', nameType: 'Business', firmName: '', dba: '', firstName: '', lastName: '', address: '', city: '', state: '', zip: '', phone: '', email: '', primaryExecutive: 'Alex Ramirez', primaryRepresentative: 'House Account' });
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

  return <div className="modal-backdrop"><section className="modal"><div className="modal-header"><div><span className="eyebrow">{initial ? 'Edit customer' : 'New customer'}</span><h2>{initial ? initial.name : 'Customer Setup'}</h2></div><button onClick={onClose} aria-label="Close"><X size={19} /></button></div><form onSubmit={submit}>
    <div className="modal-body">
    <div className="modal-section">
      <div className="section-label"><BriefcaseBusiness size={14} /> Customer Type &amp; Name</div>
      <div className="field-grid">
        <label>Customer Type<select value={form.customerType} onChange={(event) => update('customerType', event.target.value as Customer['customerType'])}><option>Customer</option><option>Prospect</option><option>Suspect</option></select></label>
        <label>Name Type<select value={form.nameType} onChange={(event) => update('nameType', event.target.value as CustomerFormState['nameType'])}><option>Business</option><option>Individual</option></select></label>
        {form.nameType === 'Business' ? (<>
          <label>Firm Name<input required value={form.firmName} onChange={(event) => update('firmName', event.target.value)} /></label>
          <label>DBA<input value={form.dba} onChange={(event) => update('dba', event.target.value)} /></label>
        </>) : (<>
          <label>First Name<input required value={form.firstName} onChange={(event) => update('firstName', event.target.value)} /></label>
          <label>Last Name<input required value={form.lastName} onChange={(event) => update('lastName', event.target.value)} /></label>
        </>)}
      </div>
    </div>
    <div className="modal-section">
      <div className="section-label"><Link2 size={14} /> Contact &amp; Address</div>
      <div className="field-grid">
        <label>Phone<input value={form.phone} onChange={(event) => update('phone', event.target.value)} /></label>
        <label>Email<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} /></label>
        <label className="full">Address<input required value={form.address} onChange={(event) => update('address', event.target.value)} /></label>
        <label>City<input required value={form.city} onChange={(event) => update('city', event.target.value)} /></label>
        <label>State<input required maxLength={2} value={form.state} onChange={(event) => update('state', event.target.value.toUpperCase())} /></label>
        <label>Zip<input required value={form.zip} onChange={(event) => update('zip', event.target.value)} /></label>
      </div>
    </div>
    <div className="modal-section">
      <div className="section-label"><Gauge size={14} /> Agency Personnel</div>
      <div className="field-grid">
        <label>Primary Executive<input value={form.primaryExecutive} onChange={(event) => update('primaryExecutive', event.target.value)} /></label>
        <label>Primary Representative<input value={form.primaryRepresentative} onChange={(event) => update('primaryRepresentative', event.target.value)} /></label>
      </div>
      <div className="notice"><ShieldCheck size={14} /> This becomes the policy Named Insured and appears on invoices and certificates.</div>
    </div>
    </div>
    <div className="modal-footer"><button type="button" onClick={onClose}>Cancel</button><button type="submit" className="primary-action" disabled={!canSave || saving}>{saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Customer'}</button></div>
  </form></section></div>;
}

export default App;
