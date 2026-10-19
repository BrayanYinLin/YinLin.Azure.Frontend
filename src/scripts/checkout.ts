import { formatPrice } from '../lib/format';
import type { Product } from '../lib/api/types';
import {
  formatCardNumber,
  formatExpiry,
  validateCardNumber,
  validateCvv,
  validateEmail,
  validateExpiry,
  validateName,
  type Validator,
} from '../lib/card';
import { submitCheckout } from '../lib/api/checkout';
import { loadCart,onExternalChange, type Cart } from './cart-store';

export function initCheckout() {
  const root = document.querySelector<HTMLElement>('[data-checkout-root]');
  // Sin raíz la carga del catálogo falló: no hay nada que pintar
  if (!root) return;

  const catalog: Product[] = JSON.parse(document.getElementById('catalog-data')?.textContent ?? '[]');
  const products = new Map(catalog.map((p) => [p.id, p]));
  const $ = <T extends HTMLElement = HTMLElement>(sel: string) => root!.querySelector<T>(sel)!;

  const empty = $('[data-checkout-empty]');
  const filled = $('[data-checkout-filled]');
  const list = $('[data-summary-list]');
  const template = $<HTMLTemplateElement>('[data-summary-item-template]');
  const form = $<HTMLFormElement>('[data-payment-form]');
  const payButton = $<HTMLButtonElement>('[data-pay]');
  const status = $('[data-form-status]');

  let cart: Cart = loadCart();

  const setText = (selector: string, text: string) => {
    for (const el of document.querySelectorAll(selector)) el.textContent = text;
  };

  function render() {
    let items = 0;
    let subtotal = 0;
    list.replaceChildren();

    for (const [id, qty] of cart) {
      const product = products.get(id);
      if (!product) continue;
      items += qty;
      subtotal += qty * product.price;

      const row = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
      row.querySelector('[data-item-name]')!.textContent = product.name;
      row.querySelector('[data-item-qty]')!.textContent = `${qty} ${qty === 1 ? 'unidad' : 'unidades'}`;
      row.querySelector('[data-item-price]')!.textContent = formatPrice(qty * product.price);
      if (product.image) {
        const img = row.querySelector<HTMLImageElement>('[data-item-image]')!;
        img.src = product.image;
        img.alt = product.name;
        img.hidden = false;
      }
      list.append(row);
    }

    empty.hidden = items > 0;
    filled.hidden = items === 0;
    payButton.disabled = items === 0;

    setText('[data-checkout-intro] p', items
      ? `Completa tus datos para finalizar tu pedido de ${formatPrice(subtotal)}.`
      : 'Completa tus datos para finalizar tu pedido.');
    setText('[data-cart-subtotal]', formatPrice(subtotal));
    setText('[data-cart-total]', formatPrice(subtotal));
  }

  // --- Formulario -----------------------------------------------------------
  const validators: Record<string, Validator> = {
    fullName: validateName,
    cardNumber: validateCardNumber,
    expiry: validateExpiry(),
    cvv: validateCvv,
    email: validateEmail,
  };
  const field = (id: string) => form.elements.namedItem(id) as HTMLInputElement;

  function check(input: HTMLInputElement): boolean {
    const message = validators[input.id](input.value);
    const errorEl = form.querySelector<HTMLElement>(`[data-error-for="${input.id}"]`)!;
    errorEl.textContent = message ?? '';
    errorEl.hidden = !message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    return !message;
  }

  const inputs = Object.keys(validators).map(field);

  field('cardNumber').addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    el.value = formatCardNumber(el.value);
  });
  field('expiry').addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    el.value = formatExpiry(el.value);
  });
  field('cvv').addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    el.value = el.value.replace(/\D/g, '').slice(0, 4);
  });

  for (const input of inputs) {
    // Se valida al salir del campo; una vez marcado como inválido, se corrige en vivo
    input.addEventListener('blur', () => input.value && check(input));
    input.addEventListener('input', () => input.hasAttribute('aria-invalid') && check(input));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const invalid = inputs.filter((input) => !check(input));
    if (invalid.length) {
      status.hidden = true;
      invalid[0].focus();
      return;
    }

    // Checkout de prueba: solo viajan nombre, email y los productos del carrito;
    // los datos de la tarjeta se validan en el cliente pero no se envían.
    payButton.disabled = true;
    try {
      await submitCheckout({
        fullName: field('fullName').value.trim(),
        email: field('email').value.trim(),
        cart,
      });
      status.textContent = 'Pedido enviado correctamente.';
    } catch {
      status.textContent = 'No se pudo enviar el pedido. Inténtalo de nuevo.';
      payButton.disabled = false;
    }
    status.hidden = false;
  });

  // Mantiene sincronizadas varias pestañas abiertas
  onExternalChange(() => {
    cart = loadCart();
    render();
  });

  render();
}
