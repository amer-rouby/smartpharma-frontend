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
