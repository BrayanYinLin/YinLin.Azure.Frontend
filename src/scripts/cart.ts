import { formatPrice } from '../lib/format';
import type { Product } from '../lib/api/types';
import { loadCart, saveCart, onExternalChange, type Cart } from './cart-store';

export function initCart() {
  const root = document.querySelector<HTMLElement>('[data-cart-root]');
  // Sin raíz la carga del catálogo falló: no hay nada que pintar ni que podar del carrito guardado
  if (!root) return;

  const catalog: Product[] = JSON.parse(document.getElementById('catalog-data')?.textContent ?? '[]');
  const products = new Map(catalog.map((p) => [p.id, p]));
  const list = root.querySelector<HTMLElement>('[data-cart-list]')!;
  const template = root.querySelector<HTMLTemplateElement>('[data-cart-item-template]')!;
  const empty = root.querySelector<HTMLElement>('[data-cart-empty]')!;
  const filled = root.querySelector<HTMLElement>('[data-cart-filled]')!;
  const cta = document.querySelector<HTMLButtonElement>('[data-cart-cta]')!;
  const rows = new Map<string, HTMLElement>();

  let cart: Cart = loadCart();

  cta.addEventListener('click', () => {
    window.location.href = '/pago';
  });

  const setText = (selector: string, text: string) => {
    for (const el of document.querySelectorAll(selector)) el.textContent = text;
  };

  function update(id: string, qty: number) {
    if (qty > 0) cart.set(id, qty);
    else cart.delete(id);
    saveCart(cart);
    render();
  }

  function createRow(product: Product): HTMLElement {
    const row = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
    const id = product.id;
    row.querySelector('[data-item-name]')!.textContent = product.name;
    if (product.image) {
      const img = row.querySelector<HTMLImageElement>('[data-item-image]')!;
      img.src = product.image;
      img.alt = product.name;
      img.hidden = false;
    }
    row.querySelector('[data-inc]')!.addEventListener('click', () => update(id, (cart.get(id) ?? 0) + 1));
    row.querySelector('[data-dec]')!.addEventListener('click', () => update(id, (cart.get(id) ?? 1) - 1));
    row.querySelector('[data-remove]')!.addEventListener('click', () => update(id, 0));
    return row;
  }

  function render() {
    let items = 0;
    let subtotal = 0;

    for (const [id, qty] of cart) {
      const product = products.get(id);
      if (!product) continue;
      items += qty;
      subtotal += qty * product.price;

      let row = rows.get(id);
      if (!row) {
        row = createRow(product);
        rows.set(id, row);
        list.append(row);
      }
      row.querySelector('[data-qty]')!.textContent = String(qty);
      row.querySelector('[data-item-price]')!.textContent = formatPrice(qty * product.price);
      row.querySelector<HTMLButtonElement>('[data-dec]')!.disabled = qty <= 1;
    }

    for (const [id, row] of rows) {
      if (!cart.has(id)) {
        row.remove();
        rows.delete(id);
      }
    }

    empty.hidden = items > 0;
    filled.hidden = items === 0;
    cta.disabled = items === 0;

    setText('[data-cart-intro] p', items
      ? `${items} ${items === 1 ? 'artículo' : 'artículos'} para tu día a día.`
      : 'Revisa tus artículos antes de pagar.');
    setText('[data-cart-count]', items
      ? `${items} ${items === 1 ? 'producto' : 'productos'} en tu carrito`
      : 'Tu carrito está vacío');
    setText('[data-cart-subtotal]', formatPrice(subtotal));
    setText('[data-cart-total]', formatPrice(subtotal));
  }

  // Descarta productos guardados que ya no existen en el catálogo
  const pruneUnknown = () => {
    let changed = false;
    for (const id of cart.keys()) {
      if (!products.has(id)) {
        cart.delete(id);
        changed = true;
      }
    }
    if (changed) saveCart(cart);
  };

  // Mantiene sincronizadas varias pestañas abiertas
  onExternalChange(() => {
    cart = loadCart();
    pruneUnknown();
    render();
  });

  pruneUnknown();
  render();
}
