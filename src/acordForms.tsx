import { useState, type FormEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { fillAcordForm, downloadPdf } from './lib/acordFill';
import { AGENCY, type AcordFormId } from './lib/acordSchema';
import type { AcordValues } from './lib/acordTaxonomy';

export type AcordSubmission = { form: string; name: string; detail?: string };
export type AcordCustomer = { name: string; address: string; city: string; state: string; zip: string };

function YesNoRow({ label }: { label: string }) {
  return <div className="yn-row"><span>{label}</span><span className="yn-toggle"><label><input type="radio" name={label} /> Y</label><label><input type="radio" name={label} /> N</label></span></div>;
}

function AcordShell({ formCode, title, subtitle, onClose, onSubmit, saving, children }: { formCode: string; title: string; subtitle: string; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; saving: boolean; children: ReactNode }) {
  return <div className="modal-backdrop"><section className="modal acord-app-modal"><div className="modal-header"><div><span className="eyebrow">{formCode}</span><h2>{title}</h2><div className="acord-app-subtitle">{subtitle}</div></div><button onClick={onClose} aria-label="Close" title="Close without saving"><X size={19} /></button></div><form onSubmit={onSubmit}>
    <div className="modal-body">{children}</div>
    <div className="modal-footer"><button type="button" onClick={onClose} title="Discard this form">Cancel</button><button type="submit" className="primary-action" disabled={saving} title="Fill and download the real ACORD PDF">{saving ? 'Generating…' : 'Generate PDF'}</button></div>
  </form></section></div>;
}

function agencyValues(): AcordValues {
  return { producerName: AGENCY.name, producerStreet: AGENCY.street, producerCity: AGENCY.city, producerState: AGENCY.state, producerZip: AGENCY.zip, producerContact: AGENCY.contact, producerPhone: AGENCY.phone, producerEmail: AGENCY.email, signature: AGENCY.signature };
}

function customerValues(customer: AcordCustomer | null): AcordValues {
  if (!customer) return {};
  return { namedInsured: customer.name, insStreet: customer.address, insCity: customer.city, insState: customer.state, insZip: customer.zip };
}

function useAcordSubmit(formId: AcordFormId | null, formCode: string, customer: AcordCustomer | null, onSubmit: (submission: AcordSubmission) => void) {
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const typed = Object.fromEntries(new FormData(event.currentTarget).entries()) as AcordValues;
    const values: AcordValues = { ...agencyValues(), ...customerValues(customer), ...typed };
    const name = values.namedInsured || 'Unnamed applicant';

    if (!formId) {
      onSubmit({ form: formCode, name, detail: 'saved — no fillable PDF template available for this form yet' });
      return;
    }

    setSaving(true);
    try {
      const { bytes, wrote, failed } = await fillAcordForm(formId, values);
      downloadPdf(bytes, `ACORD-${formId}-${name.replace(/[^a-z0-9]+/gi, '-').slice(0, 40)}.pdf`);
      onSubmit({ form: formCode, name, detail: `${wrote} field${wrote === 1 ? '' : 's'} filled${failed.length ? `, ${failed.length} skipped` : ''}` });
    } catch (error) {
      onSubmit({ form: formCode, name, detail: error instanceof Error ? `PDF generation failed: ${error.message}` : 'PDF generation failed' });
    } finally {
      setSaving(false);
    }
  }

  return { saving, handleSubmit };
}

export function Acord125Modal({ customer, onClose, onSubmit }: { customer: AcordCustomer | null; onClose: () => void; onSubmit: (submission: AcordSubmission) => void }) {
  const { saving, handleSubmit } = useAcordSubmit(null, 'ACORD 125 — Commercial Insurance Application', customer, onSubmit);
  return <AcordShell formCode="ACORD 125" title="Commercial Insurance Application" subtitle="Applicant Information Section — the master new-business application" onClose={onClose} onSubmit={handleSubmit} saving={saving}>
    <div className="modal-section">
      <div className="section-label">Status of Transaction</div>
      <div className="checkbox-group"><label><input type="radio" name="status" defaultChecked /> Quote</label><label><input type="radio" name="status" /> Issue Policy</label><label><input type="radio" name="status" /> Renew</label><label><input type="radio" name="status" /> Bound</label><label><input type="radio" name="status" /> Change</label><label><input type="radio" name="status" /> Cancel</label></div>
      <div className="field-grid">
        <label>Proposed Eff Date<input type="date" /></label>
        <label>Proposed Exp Date<input type="date" /></label>
        <label>Billing Plan<select><option>Agency</option><option>Direct</option></select></label>
        <label>Payment Plan<select><option>Annual</option><option>Semi-Annual</option><option>Quarterly</option><option>Monthly</option></select></label>
      </div>
    </div>
    <div className="modal-section">
      <div className="section-label">Lines of Business</div>
      <div className="acord-section-note">Check each line being applied for and enter an estimated premium.</div>
      <div className="lob-grid">{['Boiler & Machinery', 'Business Auto', 'Business Owners', 'Commercial General Liability', 'Commercial Inland Marine', 'Commercial Property', 'Crime', 'Cyber and Privacy', 'Fiduciary Liability', 'Garage and Dealers', 'Liquor Liability', 'Motor Carrier', 'Truckers', 'Umbrella', 'Yacht'].map((lob) => <label key={lob}><input type="checkbox" /> {lob} <input type="text" placeholder="$" /></label>)}</div>
    </div>
    <div className="modal-section">
      <div className="section-label">Applicant Information</div>
      <div className="field-grid">
        <label className="full">Name (First Named Insured)<input name="namedInsured" required placeholder="Legal business name" defaultValue={customer?.name || ''} /></label>
        <label className="full">Mailing Address<input name="insStreet" placeholder="Street" defaultValue={customer?.address || ''} /></label>
        <label>City<input name="insCity" defaultValue={customer?.city || ''} /></label>
        <label>State<input name="insState" maxLength={2} defaultValue={customer?.state || ''} /></label>
        <label>Zip<input name="insZip" defaultValue={customer?.zip || ''} /></label>
        <label>GL Code<input /></label>
        <label>SIC<input /></label>
        <label>NAICS<input /></label>
        <label>FEIN or SOC SEC #<input /></label>
        <label>Business Phone<input /></label>
        <label>Website Address<input /></label>
      </div>
      <div className="checkbox-group">{['Corporation', 'Individual', 'LLC', 'Partnership', 'Joint Venture', 'Not for Profit Org', 'Subchapter S Corporation', 'Trust'].map((type) => <label key={type}><input type="radio" name="entity-type" /> {type}</label>)}</div>
    </div>
    <div className="modal-section">
      <div className="section-label">Premises Information</div>
      <div className="field-grid">
        <label className="full">Street<input /></label>
        <label>City<input /></label>
        <label>State<input maxLength={2} /></label>
        <label>Zip<input /></label>
        <label>Interest<select><option>Owner</option><option>Tenant</option></select></label>
        <label># Full Time Employees<input type="number" /></label>
        <label># Part Time Employees<input type="number" /></label>
        <label>Annual Revenues<input placeholder="$" /></label>
      </div>
    </div>
    <div className="modal-section">
      <div className="section-label">Nature of Business</div>
      <div className="checkbox-group">{['Apartments', 'Condominiums', 'Contractor', 'Institutional', 'Manufacturing', 'Office', 'Restaurant', 'Retail', 'Service', 'Wholesale'].map((nature) => <label key={nature}><input type="radio" name="nature" /> {nature}</label>)}</div>
      <div className="field-grid">
        <label>Date Business Started<input type="date" /></label>
        <label className="full">Description of Primary Operations<textarea name="operations" /></label>
      </div>
    </div>
    <div className="modal-section">
      <div className="section-label">Prior Carrier Information</div>
      <table className="app-table"><thead><tr><th>Category</th><th>Carrier</th><th>Policy Number</th><th>Premium</th><th>Eff Date</th><th>Exp Date</th></tr></thead><tbody>{['General Liability', 'Automobile', 'Property'].map((cat) => <tr key={cat}><td>{cat}</td><td><input /></td><td><input /></td><td><input /></td><td><input type="date" /></td><td><input type="date" /></td></tr>)}</tbody></table>
    </div>
    <div className="modal-section">
      <div className="section-label">General Information</div>
      <div className="yn-grid">{['Is the applicant a subsidiary of another entity?', 'Is a formal safety program in operation?', 'Any exposure to flammables, explosives, chemicals?', 'Any other insurance with this company?', 'Any policy or coverage declined, cancelled or non-renewed during the prior 3 years?', 'Any past losses or claims relating to sexual abuse, discrimination, or negligent hiring?', 'Has applicant had a foreclosure, repossession, or bankruptcy during the last 5 years?', 'Has applicant had a judgment or lien during the last 5 years?', 'Does applicant own / lease / operate any drones?'].map((question) => <YesNoRow key={question} label={question} />)}</div>
    </div>
    <div className="modal-section">
      <div className="section-label">Signature</div>
      <div className="acord-section-note">The undersigned is an authorized representative of the applicant and represents that reasonable inquiry has been made to obtain the answers on this application.</div>
      <div className="field-grid">
        <label>Producer's Name<input defaultValue={AGENCY.signature} /></label>
        <label>Applicant's Signature<input placeholder="Type full name to sign" /></label>
        <label>Date<input type="date" /></label>
      </div>
    </div>
    <div className="acord-section-note">No fillable original of ACORD 125 is available yet, so this saves the applicant data but does not generate a downloadable PDF.</div>
  </AcordShell>;
}

export function Acord126Modal({ customer, onClose, onSubmit }: { customer: AcordCustomer | null; onClose: () => void; onSubmit: (submission: AcordSubmission) => void }) {
  const { saving, handleSubmit } = useAcordSubmit('126', 'ACORD 126 — Commercial General Liability Section', customer, onSubmit);
  return <AcordShell formCode="ACORD 126" title="Commercial General Liability Section" subtitle="Attach to ACORD 125" onClose={onClose} onSubmit={handleSubmit} saving={saving}>
    <div className="modal-section">
      <div className="section-label">Coverages</div>
      <div className="checkbox-group"><label><input type="checkbox" defaultChecked /> Commercial General Liability</label><label><input type="radio" name="cgl-basis" defaultChecked /> Claims Made</label><label><input type="radio" name="cgl-basis" /> Occurrence</label><label><input type="checkbox" /> Owner's & Contractor's Protective</label></div>
      <div className="field-grid">
        <label>Applicant / First Named Insured<input name="namedInsured" required defaultValue={customer?.name || ''} /></label>
        <label>Carrier<input name="insurerA" placeholder="Insurer name" /></label>
        <label>NAIC Code<input name="insurerAnaic" /></label>
        <label>Policy Number<input name="policyNumber" /></label>
        <label>Effective Date<input name="effectiveDate" type="date" /></label>
        <label>General Aggregate<input name="glGenAgg" placeholder="$" /></label>
        <label>Limit Applies Per<select><option>Policy</option><option>Location</option><option>Project</option><option>Other</option></select></label>
        <label>Products & Completed Ops Aggregate<input name="glProducts" placeholder="$" /></label>
        <label>Personal & Advertising Injury<input name="glPersonalAdv" placeholder="$" /></label>
        <label>Each Occurrence<input name="glEachOcc" placeholder="$" /></label>
        <label>Damage to Rented Premises<input name="glFireDamage" placeholder="$" /></label>
        <label>Medical Expense (Any one person)<input name="glMedExp" placeholder="$" /></label>
      </div>
    </div>
    <div className="modal-section">
      <div className="section-label">Schedule of Hazards</div>
      <table className="app-table"><thead><tr><th>Loc #</th><th>Classification</th><th>Class Code</th><th>Premium Basis</th><th>Exposure</th><th>Territory</th></tr></thead><tbody>{[1, 2, 3].map((row) => <tr key={row}><td><input /></td><td><input /></td><td><input /></td><td><input /></td><td><input /></td><td><input /></td></tr>)}</tbody></table>
    </div>
    <div className="modal-section">
      <div className="section-label">Contractors / Products &amp; Completed Operations</div>
      <div className="yn-grid">{['Does applicant draw plans, designs, or specifications for others?', 'Do any operations include blasting or utilize or store explosive material?', 'Do your subcontractors carry coverages or limits less than yours?', 'Does applicant install, service or demonstrate products?', 'Research and development conducted or new products planned?'].map((question) => <YesNoRow key={question} label={question} />)}</div>
    </div>
    <div className="modal-section">
      <div className="section-label">General Information</div>
      <div className="yn-grid">{['Any medical facilities provided or medical professionals employed?', 'Any exposure to radioactive / nuclear materials?', 'Any watercraft, docks, floats owned, hired or leased?', 'Is there a swimming pool on the premises?', 'Have any crimes occurred or been attempted on your premises within the last 3 years?'].map((question) => <YesNoRow key={question} label={question} />)}</div>
    </div>
    <div className="acord-section-note">Generate PDF fills the real ACORD 126 and downloads it.</div>
  </AcordShell>;
}

export function Acord127Modal({ customer, onClose, onSubmit }: { customer: AcordCustomer | null; onClose: () => void; onSubmit: (submission: AcordSubmission) => void }) {
  const { saving, handleSubmit } = useAcordSubmit('127', 'ACORD 127 — Business Auto Section', customer, onSubmit);
  return <AcordShell formCode="ACORD 127" title="Business Auto Section" subtitle="Attach to ACORD 125" onClose={onClose} onSubmit={handleSubmit} saving={saving}>
    <div className="modal-section">
      <div className="section-label">Policy</div>
      <div className="field-grid">
        <label>Named Insured(s)<input name="namedInsured" required defaultValue={customer?.name || ''} /></label>
        <label>Carrier<input name="insurerA" /></label>
        <label>NAIC Code<input name="insurerAnaic" /></label>
        <label>Policy Number<input name="policyNumber" /></label>
        <label>Effective Date<input name="effectiveDate" type="date" /></label>
      </div>
    </div>
    <div className="modal-section">
      <div className="section-label">Driver Information</div>
      <table className="app-table"><thead><tr><th>Driver #</th><th>Name</th><th>Date of Birth</th><th>License #</th></tr></thead><tbody>{([1, 2, 3] as const).map((row) => <tr key={row}><td>{row}</td><td><input name={`drv${row}Name`} /></td><td><input name={`drv${row}Dob`} type="date" /></td><td><input name={`drv${row}License`} /></td></tr>)}</tbody></table>
    </div>
    <div className="modal-section">
      <div className="section-label">Vehicle Description</div>
      <table className="app-table"><thead><tr><th>Veh #</th><th>Make</th><th>Model</th><th>V.I.N.</th></tr></thead><tbody>{([1, 2, 3] as const).map((row) => <tr key={row}><td>{row}</td><td><input name={`veh${row}Make`} /></td><td><input name={`veh${row}Model`} /></td><td><input name={`veh${row}Vin`} /></td></tr>)}</tbody></table>
    </div>
    <div className="modal-section">
      <div className="section-label">General Information</div>
      <div className="yn-grid">{['With the exception of any encumbrances, are any vehicles not solely owned by and registered to the applicant?', 'Do over 50% of the employees use their autos in the business?', 'Is there a vehicle maintenance program in operation?', 'Are any vehicles leased to others?', 'Do operations involve transporting hazardous material?', 'Does the applicant obtain MVR verifications?', 'Any drivers with convictions for moving traffic violations?'].map((question) => <YesNoRow key={question} label={question} />)}</div>
    </div>
    <div className="acord-section-note">Generate PDF fills the real ACORD 127 (driver/vehicle rows 1–3 of 4) and downloads it.</div>
  </AcordShell>;
}

export function Acord130Modal({ customer, onClose, onSubmit }: { customer: AcordCustomer | null; onClose: () => void; onSubmit: (submission: AcordSubmission) => void }) {
  const { saving, handleSubmit } = useAcordSubmit('130', 'ACORD 130 — Workers Compensation Application', customer, onSubmit);
  return <AcordShell formCode="ACORD 130" title="Workers Compensation Application" subtitle="Standalone new-business application" onClose={onClose} onSubmit={handleSubmit} saving={saving}>
    <div className="modal-section">
      <div className="section-label">Applicant</div>
      <div className="field-grid">
        <label className="full">Applicant Name<input name="namedInsured" required defaultValue={customer?.name || ''} /></label>
        <label className="full">Street Address<input name="insStreet" defaultValue={customer?.address || ''} /></label>
        <label>City<input name="insCity" defaultValue={customer?.city || ''} /></label>
        <label>State<input name="insState" maxLength={2} defaultValue={customer?.state || ''} /></label>
        <label>Zip<input name="insZip" defaultValue={customer?.zip || ''} /></label>
        <label>Carrier<input name="insurerA" /></label>
        <label>Office Phone<input /></label>
        <label>FEIN<input /></label>
        <label>NCCI Risk ID<input /></label>
        <label>Yrs in Business<input type="number" /></label>
      </div>
      <div className="checkbox-group">{['Sole Proprietor', 'Partnership', 'Corporation', 'Subchapter S Corp', 'LLC', 'Joint Venture', 'Trust', 'Unincorporated Association'].map((type) => <label key={type}><input type="radio" name="wc-entity" /> {type}</label>)}</div>
    </div>
    <div className="modal-section">
      <div className="section-label">Status of Submission</div>
      <div className="checkbox-group"><label><input type="radio" name="wc-status" defaultChecked /> Quote</label><label><input type="radio" name="wc-status" /> Issue Policy</label><label><input type="radio" name="wc-status" /> Bound</label><label><input type="radio" name="wc-status" /> Assigned Risk</label></div>
    </div>
    <div className="modal-section">
      <div className="section-label">Locations</div>
      <table className="app-table"><thead><tr><th>Loc #</th><th>Street</th><th>City</th><th>County</th><th>State</th><th>Zip Code</th></tr></thead><tbody>{[1, 2].map((row) => <tr key={row}><td>{row}</td><td><input /></td><td><input /></td><td><input /></td><td><input maxLength={2} /></td><td><input /></td></tr>)}</tbody></table>
    </div>
    <div className="modal-section">
      <div className="section-label">Policy Information</div>
      <div className="field-grid">
        <label>Proposed Eff Date<input name="effectiveDate" type="date" /></label>
        <label>Proposed Exp Date<input name="expirationDate" type="date" /></label>
        <label>Employer's Liability — Each Accident<input placeholder="$" /></label>
        <label>Disease — Policy Limit<input placeholder="$" /></label>
        <label>Disease — Each Employee<input placeholder="$" /></label>
      </div>
    </div>
    <div className="modal-section">
      <div className="section-label">State Rating Worksheet</div>
      <table className="app-table"><thead><tr><th>Loc #</th><th>Class Code</th><th>Categories / Duties</th><th>Full Time</th><th>Part Time</th><th>Est. Annual Remuneration</th></tr></thead><tbody>{[1, 2, 3].map((row) => <tr key={row}><td><input /></td><td><input /></td><td><input /></td><td><input type="number" /></td><td><input type="number" /></td><td><input placeholder="$" /></td></tr>)}</tbody></table>
    </div>
    <div className="modal-section">
      <div className="section-label">Nature of Business / Description of Operations</div>
      <textarea placeholder="Describe operations, products, and equipment" />
    </div>
    <div className="modal-section">
      <div className="section-label">General Information</div>
      <div className="yn-grid">{['Does applicant own, operate or lease aircraft / watercraft?', 'Any work performed underground or above 15 feet?', 'Are sub-contractors used?', 'Is a written safety program in operation?', 'Any employees under 16 or over 60 years of age?', 'Any seasonal employees?', 'Do employees travel out of state?', 'Any prior coverage declined / cancelled / non-renewed in the last 3 years?'].map((question) => <YesNoRow key={question} label={question} />)}</div>
    </div>
    <div className="acord-section-note">Generate PDF fills the real ACORD 130 (Producer, Applicant, Carrier, and Policy dates) and downloads it.</div>
  </AcordShell>;
}

export function Acord131Modal({ customer, onClose, onSubmit }: { customer: AcordCustomer | null; onClose: () => void; onSubmit: (submission: AcordSubmission) => void }) {
  const { saving, handleSubmit } = useAcordSubmit(null, 'ACORD 131 — Umbrella / Excess Section', customer, onSubmit);
  return <AcordShell formCode="ACORD 131" title="Umbrella / Excess Section" subtitle="Attach to ACORD 125 and ACORD 126" onClose={onClose} onSubmit={handleSubmit} saving={saving}>
    <div className="modal-section">
      <div className="section-label">Policy Information</div>
      <div className="field-grid">
        <label>Named Insured(s)<input name="namedInsured" required defaultValue={customer?.name || ''} /></label>
        <label>Effective Date<input type="date" /></label>
      </div>
      <div className="checkbox-group"><label><input type="radio" name="ux-type" defaultChecked /> New</label><label><input type="radio" name="ux-type" /> Renewal</label><label><input type="radio" name="ux-form" defaultChecked /> Umbrella</label><label><input type="radio" name="ux-form" /> Excess</label><label><input type="radio" name="ux-basis" defaultChecked /> Occurrence</label><label><input type="radio" name="ux-basis" /> Claims Made</label></div>
      <div className="field-grid">
        <label>Limit of Liability (Ea Occ)<input placeholder="$" /></label>
        <label>Retained Limit<input placeholder="$" /></label>
        <label>Retroactive Date<input type="date" /></label>
        <label>Expiring Policy #<input /></label>
      </div>
    </div>
    <div className="modal-section">
      <div className="section-label">Underlying Insurance</div>
      <table className="app-table"><thead><tr><th>Type</th><th>Carrier / Policy #</th><th>Policy Eff</th><th>Policy Exp</th><th>Limits</th></tr></thead><tbody>{['Automobile Liability', 'General Liability', 'Employers Liability'].map((row) => <tr key={row}><td>{row}</td><td><input /></td><td><input type="date" /></td><td><input type="date" /></td><td><input placeholder="$" /></td></tr>)}</tbody></table>
    </div>
    <div className="modal-section">
      <div className="section-label">Underlying General Liability Information</div>
      <div className="yn-grid">{['Has any product, work, accident, or location been excluded, uninsured or self-insured from any previous coverage?', 'For claims made, was "tail" coverage purchased for any previous primary or excess policy?'].map((question) => <YesNoRow key={question} label={question} />)}</div>
    </div>
    <div className="modal-section">
      <div className="section-label">Additional Exposures</div>
      <div className="yn-grid">{['Does applicant own / lease / operate aircraft?', 'Are hired and non-owned auto coverages provided?', 'Is bridge, dam, or marine work performed?', 'Is applicant self-insured in any state?', 'Any foreign operations, or foreign products distributed in the USA?'].map((question) => <YesNoRow key={question} label={question} />)}</div>
    </div>
    <div className="acord-section-note">No fillable original of ACORD 131 is available yet, so this saves the applicant data but does not generate a downloadable PDF.</div>
  </AcordShell>;
}

export function Acord140Modal({ customer, onClose, onSubmit }: { customer: AcordCustomer | null; onClose: () => void; onSubmit: (submission: AcordSubmission) => void }) {
  const { saving, handleSubmit } = useAcordSubmit('140', 'ACORD 140 — Property Section', customer, onSubmit);
  return <AcordShell formCode="ACORD 140" title="Property Section" subtitle="Attach to ACORD 125" onClose={onClose} onSubmit={handleSubmit} saving={saving}>
    <div className="modal-section">
      <div className="section-label">Policy</div>
      <div className="field-grid">
        <label>Named Insured(s)<input name="namedInsured" required defaultValue={customer?.name || ''} /></label>
        <label>Carrier<input name="insurerA" /></label>
        <label>NAIC Code<input name="insurerAnaic" /></label>
        <label>Policy Number<input name="policyNumber" /></label>
        <label>Effective Date<input name="effectiveDate" type="date" /></label>
        <label>Expiration Date<input name="expirationDate" type="date" /></label>
      </div>
    </div>
    <div className="modal-section">
      <div className="section-label">Premises Information</div>
      <div className="field-grid">
        <label>Street Address<input name="insStreet" defaultValue={customer?.address || ''} /></label>
        <label>City<input name="insCity" defaultValue={customer?.city || ''} /></label>
        <label>State<input name="insState" maxLength={2} defaultValue={customer?.state || ''} /></label>
        <label>Zip<input name="insZip" defaultValue={customer?.zip || ''} /></label>
        <label>Building Description<input /></label>
        <label>Total Area (sq ft)<input name="propBuildingArea" type="number" /></label>
      </div>
      <table className="app-table"><thead><tr><th>Subject of Insurance</th><th>Amount</th><th>Coins %</th><th>Valuation</th><th>Causes of Loss</th><th>Deductible</th></tr></thead><tbody>{[1, 2, 3].map((row) => <tr key={row}><td><input /></td><td><input placeholder="$" /></td><td><input /></td><td><input /></td><td><input /></td><td><input placeholder="$" /></td></tr>)}</tbody></table>
    </div>
    <div className="modal-section">
      <div className="section-label">Construction &amp; Protection</div>
      <div className="field-grid">
        <label>Construction Type<input /></label>
        <label>Protection Class<input /></label>
        <label># Stories<input type="number" /></label>
        <label>Year Built<input type="number" /></label>
        <label>Distance to Fire Station<input /></label>
        <label>Distance to Hydrant (ft)<input type="number" /></label>
        <label>Roof Type<input /></label>
      </div>
    </div>
    <div className="modal-section">
      <div className="section-label">Fire &amp; Burglar Protection</div>
      <div className="field-grid">
        <label>Burglar Alarm Type<select><option>Central Station</option><option>Local Gong</option><option>With Keys</option><option>None</option></select></label>
        <label># Guards / Watchmen<input type="number" /></label>
        <label>Sprinklered %<input /></label>
        <label>Fire Alarm Manufacturer<input /></label>
      </div>
    </div>
    <div className="modal-section">
      <div className="section-label">Remarks</div>
      <textarea name="operations" placeholder="Additional coverages, options, restrictions, endorsements and rating information" />
    </div>
    <div className="acord-section-note">Generate PDF fills the real ACORD 140 and downloads it.</div>
  </AcordShell>;
}
