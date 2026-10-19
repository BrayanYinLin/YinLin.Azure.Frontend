import { formatPrice } from '../lib/format';
import { loadCart, saveCart, onExternalChange, type Cart } from './cart-store';

export function initCatalog() {
  let cart: Cart = loadCart();
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-product-card]'));
  const chips = Array.from(document.querySelectorAll<HTMLElement>('[data-chip]'));

  const prices = new Map(cards.map((c) => [c.dataset.id!, Number(c.dataset.price)]));
  const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;

  function render() {
    let items = 0;
    let subtotal = 0;
    for (const [id, qty] of cart) {
      items += qty;
      subtotal += qty * (prices.get(id) ?? 0);
    }

    for (const card of cards) {
      const btn = card.querySelector<HTMLElement>('[data-add]')!;
      const qty = cart.get(card.dataset.id!);
      if (qty) {
        btn.dataset.qty = String(qty);
        btn.querySelector('[data-qty-label]')!.textContent = String(qty);
      } else {
        delete btn.dataset.qty;
      }
    }

    $('[data-cart-count]').textContent = items
      ? `${items} ${items === 1 ? 'producto' : 'productos'} en tu carrito`
      : 'Tu carrito está vacío';
    $('[data-cart-subtotal]').textContent = formatPrice(subtotal);
    $('[data-cart-items]').textContent = String(items);
    $('[data-cart-total]').textContent = formatPrice(subtotal);
    $<HTMLButtonElement>('[data-cart-cta]').disabled = items === 0;
  }

  // Carrito
  for (const card of cards) {
    card.querySelector('[data-add]')!.addEventListener('click', () => {
      const id = card.dataset.id!;
      cart.set(id, (cart.get(id) ?? 0) + 1);
      saveCart(cart);
      render();
    });
  }

  $('[data-cart-cta]').addEventListener('click', () => {
    window.location.href = '/carrito';
  });

  // Filtro por categoría
  for (const chip of chips) {
    chip.addEventListener('click', () => {
      const value = chip.dataset.chip!;
      for (const c of chips) c.setAttribute('aria-pressed', String(c === chip));
      for (const card of cards) {
        card.hidden = value !== 'Todos' && card.dataset.category !== value;
      }
    });
  }

  // Descarta productos guardados que ya no existen en el catálogo
  const pruneUnknown = () => {
    let changed = false;
    for (const id of cart.keys()) {
      if (!prices.has(id)) {
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
