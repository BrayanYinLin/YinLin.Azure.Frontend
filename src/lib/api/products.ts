import { apiGet } from './client';
import type { Product, ProductDto } from './types';

const toProduct = (dto: ProductDto): Product => ({
  id: dto.id,
  name: dto.name,
  price: dto.price,
  category: dto.category,
  image: dto.imageUrl,
});

export async function getProducts(): Promise<Product[]> {
  const dtos = await apiGet<ProductDto[]>('/api/GetProducts');
  return dtos.map(toProduct);
}

export const getCategories = (products: Product[]): string[] => [
  ...new Set(products.map((p) => p.category)),
];
