export type EtaEnvironment = 'PREPROD' | 'PROD';

export interface EtaSettings {
  environment: EtaEnvironment;
  rin?: string;
  companyTradeName?: string;
  branchCode?: string;
  activityCode?: string;
  governate?: string;
  regionCity?: string;
  street?: string;
  buildingNumber?: string;
  postalCode?: string;
  clientId?: string;
  clientSecretSet: boolean;
  credentialsKeyConfigured: boolean;
}

/** clientSecret: leave empty to keep the stored one. */
export interface EtaSettingsRequest extends Omit<EtaSettings, 'clientSecretSet' | 'credentialsKeyConfigured'> {
  clientSecret?: string;
}

export interface EtaPosDevice {
  id: number;
  serialNumber: string;
  osVersion: string;
  modelFramework: string;
  active: boolean;
  presharedKeySet: boolean;
  hasIssuedReceipts: boolean;
}

/** presharedKey: required on create, leave empty on update to keep it. */
export interface EtaPosDeviceRequest {
  serialNumber: string;
  osVersion: string;
  modelFramework: string;
  presharedKey?: string;
  active?: boolean;
}
