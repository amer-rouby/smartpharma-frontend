export interface WhatsAppData {
  phoneNumber: string;
  encodedMessage: string;
  orderNumber?: string;
}

export interface WhatsAppRequest {
  orderId: number;
  supplierId: number;
}
