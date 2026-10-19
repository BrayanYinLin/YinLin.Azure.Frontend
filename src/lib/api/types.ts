/** Contrato de GET /api/products */
export interface ProductDto {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string | null;
}

/** Línea del pedido: producto del carrito y su cantidad */
export interface OrderItemDto {
  productId: string;
  quantity: number;
}

/** Cuerpo del pago/pedido. Es un checkout de prueba: no viaja nada de la tarjeta */
export interface CheckoutRequestDto {
  fullName: string;
  email: string;
  items: OrderItemDto[];
}

/** Modelo que consume la UI */
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string | null;
}
