import { apiPost } from './client';
import type { CheckoutRequestDto } from './types';

export interface CheckoutInput {
  fullName: string;
  email: string;
  cart: ReadonlyMap<string, number>;
}

export function submitCheckout({ fullName, email, cart }: CheckoutInput): Promise<void> {
  const body: CheckoutRequestDto = {
    fullName,
    email,
    items: [...cart].map(([productId, quantity]) => ({ productId, quantity })),
  };
  return apiPost('/api/CreateOrder', body);
}
