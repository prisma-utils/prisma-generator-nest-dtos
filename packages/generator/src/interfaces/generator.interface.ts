export interface GeneratorInterface {
  useStrict: 'true' | 'false';
  dryRun: 'true' | 'false';

  DTOPath: string;
  DTOPrefixCreate: string;
  DTOPrefixUpdate: string;
  DTOSuffix: string;
  DTOParentClass?: string;

  CRUDServicePath: string;
  CRUDServiceSuffix: string;
  CRUDStubFile?: string;
}
