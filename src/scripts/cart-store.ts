// Persistencia del carrito en localStorage ({ [productId]: cantidad }).
// Es el único módulo que sabe dónde vive el carrito: al llegar el backend solo se cambia este archivo.
const KEY = 'objeto.cart.v1';

export type Cart = Map<string, number>;

export function loadCart(): Cart {
  const cart: Cart = new Map();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    for (const [id, qty] of Object.entries(raw)) {
      if (Number.isInteger(qty) && (qty as number) > 0) cart.set(id, qty as number);
    }
  } catch {
    // almacenamiento no disponible o contenido corrupto: empezamos vacíos
  }
  return cart;
}

export function saveCart(cart: Cart) {
  try {
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(cart)));
  } catch {
    // modo privado o cuota llena: el carrito sigue funcionando en memoria
  }
}

/** Llama a `onChange` cuando otra pestaña modifica el carrito. */
export function onExternalChange(onChange: () => void) {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY || e.key === null) onChange();
  });
}
