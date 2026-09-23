/* ACORD template registry + fill strategy.
   Semantic fillable forms (25, 126, 140) are filled by the convention-based
   taxonomy mapper in acordTaxonomy.ts — no hand crosswalk needed. The flat
   print-only forms (127, 130) keep a coordinate overlay map (text drawn
   directly onto the page) since they ship with no AcroForm fields at all. */

export type AcordFormId = '25' | '126' | '127' | '130' | '140';

export const TEMPLATE_URL: Record<AcordFormId, string> = {
  '25': '/templates/acord-25.pdf',
  '126': '/templates/acord-126.pdf',
  '127': '/templates/acord-127.pdf',
  '130': '/templates/acord-130.pdf',
  '140': '/templates/acord-140.pdf',
};

export const FORM_TITLES: Record<AcordFormId, string> = {
  '25': 'Certificate of Liability Insurance',
  '126': 'Commercial General Liability Section',
  '127': 'Business Auto Section',
  '130': 'Workers Compensation Application',
  '140': 'Property Section',
};

type OverlayEntry = [x: number, y: number, size: number, maxWidth?: number];
type OverlayMapValue = OverlayEntry | number | Record<string, number> | boolean | undefined;
export type OverlayMap = { _page?: number; _pages?: Record<string, number>; _always?: boolean } & Record<string, OverlayMapValue>;

/* Flat forms: draw text at measured PDF points (origin bottom-left), reused
   from a previously-verified overlay mapping for these exact templates. */
export const OVERLAY: Partial<Record<AcordFormId, OverlayMap>> = {
  '127': {
    _page: 0,
    _pages: {
      veh1Make: 2, veh1Model: 2, veh1Vin: 2, veh2Make: 2, veh2Model: 2, veh2Vin: 2,
      veh3Make: 2, veh3Model: 2, veh3Vin: 2, veh4Make: 2, veh4Model: 2, veh4Vin: 2,
    },
    producerName: [24, 706, 8, 300], insurerA: [316, 706, 8, 150], insurerAnaic: [550, 706, 8, 58],
    policyNumber: [24, 679, 8, 300], effectiveDate: [352, 679, 8, 70], namedInsured: [432, 679, 8, 160],
    drv1Name: [84, 585, 7, 118], drv1Dob: [233, 585, 7, 65], drv1License: [349, 585, 7, 83],
    drv2Name: [84, 558, 7, 118], drv2Dob: [233, 558, 7, 65], drv2License: [349, 558, 7, 83],
    drv3Name: [84, 531, 7, 118], drv3Dob: [233, 531, 7, 65], drv3License: [349, 531, 7, 83],
    veh1Make: [113, 740.5, 7, 125], veh1Model: [113, 728.5, 7, 125], veh1Vin: [268, 728.5, 7, 130],
    veh2Make: [113, 620.5, 7, 125], veh2Model: [113, 608.5, 7, 125], veh2Vin: [268, 608.5, 7, 130],
    veh3Make: [113, 500.5, 7, 125], veh3Model: [113, 488.5, 7, 125], veh3Vin: [268, 488.5, 7, 130],
    veh4Make: [113, 380.5, 7, 125], veh4Model: [113, 368.5, 7, 125], veh4Vin: [268, 368.5, 7, 130],
  },
  '130': {
    _page: 0,
    producerName: [24, 731, 8, 300], insurerA: [398, 739, 8, 210], namedInsured: [398, 717, 8, 210],
    insStreet: [398, 683, 8, 200], cityLine: [398, 672, 7, 200],
    producerContact: [95, 671, 8, 230], producerPhone: [95, 655, 7, 230], producerEmail: [95, 635, 7, 230],
    effectiveDate: [35, 395, 8, 110], expirationDate: [220, 395, 8, 110],
  },
};

/* AMS360's fictional agency — the PRODUCER block on every generated form. */
export const AGENCY = {
  name: 'Meridian Coverage Group, Inc',
  street: 'PO Box 9',
  city: 'Central City',
  state: 'ST',
  zip: '40001',
  contact: 'House Account',
  phone: '(555) 010-9200',
  fax: '',
  email: 'certs@meridiancoverage.example.com',
  signature: 'Alex Ramirez',
};
