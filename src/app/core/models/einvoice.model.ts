/** From this sale total ETA requires the buyer's national ID and name (mirrors the backend). */
export const ETA_BUYER_ID_THRESHOLD = 150000;

/** Egyptian national ID: 14 digits, the first being the century (2 = 1900s, 3 = 2000s). */
export const NATIONAL_ID_PATTERN = /^[23][0-9]{13}$/;

export type EInvoiceStatus = 'PENDING' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'ERROR';

export interface EInvoiceSubmission {
  id: number;
  saleTransactionId: number;
  status: EInvoiceStatus;
  etaUuid?: string;
  submittedAt?: string;
  errorMessage?: string;
  retryCount: number;
  receiptNumber?: string;
  dateTimeIssued?: string;
  /** Text to encode in the QR printed on the receipt (ETA portal link). */
  qrContent?: string;
  longId?: string;
  submissionUuid?: string;
}
