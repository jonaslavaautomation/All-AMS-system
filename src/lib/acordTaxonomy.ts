/* ACORD field-name taxonomy mapper.
   Official fillable ACORD PDFs name their fields with a shared, semantic
   convention (e.g. NamedInsured_FullName_A, Producer_MailingAddress_LineOne_A,
   GeneralLiability_EachOccurrence_LimitAmount_A). Because the tokens are shared
   across forms, ONE convention-based mapper fills every fillable ACORD form.

   Field names may be wrapped in ACORD's hierarchical prefix
   (F[0].P3[0].<name>[0]); normFieldName strips that so the same stem matches
   on every form and every page. */

export const normFieldName = (n: string): string =>
  n.replace(/^F\[0\]\.P\d+\[0\]\./, '').replace(/\[0\]$/, '');

export type AcordValues = Record<string, string>;

// normalized "_A" field stem -> our data key
export const TAXONOMY: Record<string, string> = {
  // Form meta
  'Form_CompletionDate_A': 'formDate',
  'CertificateOfInsurance_CertificateNumberIdentifier_A': 'certNumber',
  'CertificateOfInsurance_RevisionNumberIdentifier_A': 'revisionNumber',
  'Producer_AuthorizedRepresentative_Signature_A': 'signature',
  // Producer / agency
  'Producer_FullName_A': 'producerName',
  'Producer_ContactPerson_FullName_A': 'producerContact',
  'Producer_ContactPerson_PhoneNumber_A': 'producerPhone',
  'Producer_FaxNumber_A': 'producerFax',
  'Producer_ContactPerson_EmailAddress_A': 'producerEmail',
  'Producer_MailingAddress_LineOne_A': 'producerStreet',
  'Producer_MailingAddress_CityName_A': 'producerCity',
  'Producer_MailingAddress_StateOrProvinceCode_A': 'producerState',
  'Producer_MailingAddress_PostalCode_A': 'producerZip',
  // Named insured
  'NamedInsured_FullName_A': 'namedInsured',
  'NamedInsured_MailingAddress_LineOne_A': 'insStreet',
  'NamedInsured_MailingAddress_CityName_A': 'insCity',
  'NamedInsured_MailingAddress_StateOrProvinceCode_A': 'insState',
  'NamedInsured_MailingAddress_PostalCode_A': 'insZip',
  // Carrier
  'Insurer_FullName_A': 'insurerA',
  'Insurer_NAICCode_A': 'insurerAnaic',
  // Policy — generic + per-coverage variants (ACORD 25 has one policy # per line of business)
  'Policy_PolicyNumberIdentifier_A': 'policyNumber',
  'Policy_EffectiveDate_A': 'effectiveDate',
  'Policy_ExpirationDate_A': 'expirationDate',
  'Policy_GeneralLiability_PolicyNumberIdentifier_A': 'policyNumber',
  'Policy_GeneralLiability_EffectiveDate_A': 'effectiveDate',
  'Policy_GeneralLiability_ExpirationDate_A': 'expirationDate',
  'Policy_AutomobileLiability_PolicyNumberIdentifier_A': 'policyNumber',
  'Policy_AutomobileLiability_EffectiveDate_A': 'effectiveDate',
  'Policy_AutomobileLiability_ExpirationDate_A': 'expirationDate',
  // Certificate holder
  'CertificateHolder_FullName_A': 'holderName',
  'CertificateHolder_MailingAddress_LineOne_A': 'holderStreet',
  'CertificateHolder_MailingAddress_CityName_A': 'holderCity',
  'CertificateHolder_MailingAddress_StateOrProvinceCode_A': 'holderState',
  'CertificateHolder_MailingAddress_PostalCode_A': 'holderZip',
  // General Liability limits
  'GeneralLiability_EachOccurrence_LimitAmount_A': 'glEachOcc',
  'GeneralLiability_GeneralAggregate_LimitAmount_A': 'glGenAgg',
  'GeneralLiability_ProductsAndCompletedOperations_AggregateLimitAmount_A': 'glProducts',
  'GeneralLiability_PersonalAndAdvertisingInjury_LimitAmount_A': 'glPersonalAdv',
  'GeneralLiability_FireDamageRentedPremises_EachOccurrenceLimitAmount_A': 'glFireDamage',
  'GeneralLiability_MedicalExpense_EachPersonLimitAmount_A': 'glMedExp',
  // Automobile liability limits
  'Vehicle_CombinedSingleLimit_EachAccidentAmount_A': 'autoCombinedLimit',
  // Property
  'Construction_BuildingArea_A': 'propBuildingArea',
  // Operations / remarks (different forms name it differently)
  'BuildingOccupancy_OperationsDescription_A': 'operations',
  'GeneralLiabilityLineOfBusiness_RemarkText_A': 'operations',
  'CertificateOfLiabilityInsurance_ACORDForm_RemarkText_A': 'operations',
};

// Checkbox rules keyed by normalized stem: when `when` has a value, check these.
export const CHECK_RULES: { when: string; check: string[] }[] = [
  { when: 'glEachOcc', check: ['GeneralLiability_OccurrenceIndicator_A', 'GeneralLiability_CoverageIndicator_A'] },
  { when: 'autoCombinedLimit', check: ['Vehicle_AnyAutoIndicator_A'] },
];
