import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MenuPage } from '../src/features/menu/components/menu-page';
import { menuCategories } from '../src/features/menu/menu-data';

const html = renderToStaticMarkup(<MenuPage />);
const cocktailIds = ['margaritas', 'margarita-rita', 'tequila-sunrise', 'cantarito-paloma', 'sex-on-the-beach', 'mimosa-durazno', 'pina-colada', 'mojito'];
const desktopCard = (id: string) => html.match(new RegExp(`<article[^>]*id="plato-${id}"[\\s\\S]*?</article>`))?.[0] ?? '';
const mobileCard = (id: string) => html.match(new RegExp(`<li[^>]*data-item="${id}"[\\s\\S]*?</li>(?=</ul>|<li class="m-card)`))?.[0] ?? '';

test('cocktails without photos show the standard cocktail icon on desktop and mobile', () => {
  for (const id of cocktailIds) for (const card of [desktopCard(id), mobileCard(id)]) {
    assert.match(card, /menu-cocktail\.svg/);
    assert.match(card, /alt="Ícono de cóctel · foto no disponible"/);
  }
});

test('drinks, wine and beer without photos show a glass icon on desktop and mobile', () => {
  for (const category of menuCategories.filter(category => category.id === 'bebidas' || category.id === 'cocteles-y-chelas')) {
    for (const item of category.items.filter(item => !item.image && !cocktailIds.includes(item.id))) {
      for (const card of [desktopCard(item.id), mobileCard(item.id)]) {
        assert.match(card, /menu-drink\.svg/, item.id);
        assert.match(card, /alt="Ícono de bebida · foto no disponible"/, item.id);
        assert.doesNotMatch(card, /menu-product\.svg|menu-cocktail\.svg|foto real de La Lupe/, item.id);
      }
    }
  }
});

test('food without a photo keeps the generic dish icon on desktop and mobile', () => {
  for (const category of menuCategories.filter(category => category.id !== 'bebidas' && category.id !== 'cocteles-y-chelas')) for (const item of category.items.filter(item => !item.image)) {
    for (const card of [desktopCard(item.id), mobileCard(item.id)]) {
      assert.match(card, /menu-product\.svg/, item.id);
      assert.match(card, /alt="Ícono de producto · foto no disponible"/, item.id);
      assert.doesNotMatch(card, /foto real de La Lupe/, item.id);
    }
  }
});

test('all products have descriptions, with neutral standard copy only for missing content', () => {
  for (const category of menuCategories) for (const item of category.items) {
    assert.ok(item.description?.trim(), item.id);
    assert.match(desktopCard(item.id), /class="dish-description"/, item.id);
    assert.match(mobileCard(item.id), /class="m-desc"/, item.id);
  }
  assert.equal(menuCategories[0].items[0].description, 'Una opción de nuestra carta para acompañar tu pedido.');
});

test('existing photos, descriptions, prices and purchase controls remain available', () => {
  const card = desktopCard('esquite');
  assert.match(card, /esquite\.webp/);
  assert.match(card, /Auténtico antojito mexicano/);
  assert.match(card, /\$33\.900/);
  assert.match(card, /aria-label="Agregar Esquite"/);
  assert.match(desktopCard('margaritas'), /Precio por confirmar/);
  assert.match(desktopCard('tacos'), /aria-label="Elegir opciones de Tacos"/);
});
