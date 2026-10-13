/** Contrato de GET /api/products */
export interface ProductDto {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string | null;
}

/** Modelo que consume la UI */
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string | null;
}
