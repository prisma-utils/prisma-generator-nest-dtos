export interface GeneratorInterface {
  useStrict: boolean;
  dryRun: boolean;

  DTOPath: string;
  DTOPrefixCreate: string;
  DTOPrefixUpdate: string;
  DTOSuffix: string;
  DTOParentClass: string;
}
