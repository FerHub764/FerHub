export const INGREDIENTS = {
  bunTop: { pt: ['Pão brioche', 'Assado toda manhã, pincelado com manteiga e coberto de gergelim tostado.'], en: ['Brioche bun', 'Baked every morning, brushed with butter and topped with toasted sesame.'] },
  lettuce: { pt: ['Alface americana', 'Folhas crocantes de produtor local, lavadas e geladas.'], en: ['Iceberg lettuce', 'Crisp leaves from a local grower, washed and chilled.'] },
  onion: { pt: ['Cebola roxa', 'Fatiada fina na hora, para um toque doce e picante.'], en: ['Red onion', 'Thin-sliced to order for a sweet, sharp bite.'] },
  tomato: { pt: ['Tomate', 'Tomates maduros em rodelas grossas e suculentas.'], en: ['Tomato', 'Ripe tomatoes in thick, juicy slices.'] },
  pickles: { pt: ['Picles', 'Pepino em conserva da casa, azedinho e crocante.'], en: ['Pickles', 'House-brined cucumber, tangy and crunchy.'] },
  bacon: { pt: ['Bacon', 'Fatias defumadas e crocantes, feitas na chapa.'], en: ['Bacon', 'Smoked strips crisped on the griddle.'] },
  cheese: { pt: ['Queijo cheddar', 'Derretido em cima da carne até escorrer pelas bordas.'], en: ['Cheddar cheese', 'Melted on the patty until it drips off the edges.'] },
  patty: { pt: ['Carne 160 g', 'Blend de acém e peito, moído no dia e selado na brasa.'], en: ['6 oz patty', 'Chuck and brisket blend, ground daily and seared over the coals.'] },
  bunBottom: { pt: ['Base do pão', 'Tostada na chapa para segurar todo o suco.'], en: ['Bottom bun', 'Griddle-toasted to hold every drop of juice.'] },
};

export const BUILD = { base: 12, items: [
  { id: 'patty', price: 14, min: 1, max: 3, start: 1 },
  { id: 'cheese', price: 4, min: 0, max: 3, start: 1 },
  { id: 'bacon', price: 6, min: 0, max: 2, start: 0 },
  { id: 'tomato', price: 2, min: 0, max: 2, start: 1 },
  { id: 'onion', price: 2, min: 0, max: 2, start: 1 },
  { id: 'pickles', price: 2, min: 0, max: 2, start: 0 },
  { id: 'lettuce', price: 2, min: 0, max: 2, start: 1 },
] };

export const MENU = [
  { id: 'classic', price: 32.9, types: ['bunBottom', 'patty', 'cheese', 'tomato', 'onion', 'lettuce', 'bunTop'],
    pt: ['Clássico da Casa', 'Carne 160 g, cheddar, tomate, cebola roxa e alface.'], en: ['House Classic', '6 oz patty, cheddar, tomato, red onion and lettuce.'] },
  { id: 'double', price: 41.9, types: ['bunBottom', 'patty', 'cheese', 'patty', 'cheese', 'pickles', 'bunTop'],
    pt: ['Duplo Cheddar', 'Duas carnes, cheddar em dobro e picles da casa.'], en: ['Double Cheddar', 'Two patties, double cheddar and house pickles.'] },
  { id: 'bacon', price: 38.9, types: ['bunBottom', 'patty', 'cheese', 'bacon', 'onion', 'bunTop'],
    pt: ['Bacon na Brasa', 'Carne, cheddar, bacon crocante e cebola roxa.'], en: ['Ember Bacon', 'Patty, cheddar, crispy bacon and red onion.'] },
  { id: 'green', price: 34.9, types: ['bunBottom', 'patty', 'cheese', 'tomato', 'pickles', 'lettuce', 'lettuce', 'bunTop'],
    pt: ['Smash Verde', 'Carne, cheddar, tomate, picles e alface em dobro.'], en: ['Green Smash', 'Patty, cheddar, tomato, pickles and double lettuce.'] },
];

export const SPECIALS = [
  { id: 'duo', price: 79.9, old: 96.8, types: MENU[0].types, pt: ['Combo Casal', '2 Clássicos, fritas grandes e 2 refrigerantes.'], en: ['Date Night Combo', '2 Classics, large fries and 2 sodas.'] },
  { id: 'ember', price: 54.9, old: 63.7, types: MENU[2].types, pt: ['Combo Brasa', 'Bacon na Brasa, onion rings e milkshake.'], en: ['Ember Combo', 'Ember Bacon, onion rings and a milkshake.'] },
  { id: 'double', price: 58.9, old: 68.7, types: MENU[1].types, pt: ['Combo Duplo', 'Duplo Cheddar, fritas e refrigerante.'], en: ['Double Combo', 'Double Cheddar, fries and a soda.'] },
  { id: 'kids', price: 29.9, old: 36.5, types: ['bunBottom', 'patty', 'cheese', 'bunTop'], pt: ['Combo Kids', 'Mini burger com queijo, batatinha e suco.'], en: ['Kids Combo', 'Mini cheeseburger, small fries and juice.'] },
  { id: 'tuesday', price: 24.9, old: 34.9, types: MENU[3].types, pt: ['Terça do Smash', 'Smash Verde pela metade do preço, só às terças.'], en: ['Smash Tuesday', 'Green Smash at half price, Tuesdays only.'] },
];

export const REVIEWS = [
  { name: 'Marina S.', stars: 5, pt: 'O pão brilha, o queijo escorre e a carne tem gosto de brasa de verdade. Virei cliente.', en: 'The bun shines, the cheese drips and the patty actually tastes of the grill. I\'m a regular now.' },
  { name: 'Rafael T.', stars: 5, pt: 'Montei o meu com bacon duplo e chegou exatamente como eu vi na tela.', en: 'I built mine with double bacon and it arrived exactly as it looked on screen.' },
  { name: 'Júlia M.', stars: 5, pt: 'Entrega rápida e o burger ainda chegou quente. A Terça do Smash é imperdível.', en: 'Fast delivery and the burger was still hot. Smash Tuesday is a must.' },
  { name: 'Diego A.', stars: 4, pt: 'Melhor cheddar da cidade. Só queria que as fritas viessem em porção maior.', en: 'Best cheddar in town. I just wish the fries came in a bigger portion.' },
  { name: 'Carla P.', stars: 5, pt: 'Levei meus filhos e o Combo Kids fez sucesso. Atendimento muito simpático.', en: 'Took my kids and the Kids Combo was a hit. Very friendly staff.' },
  { name: 'Bruno L.', stars: 5, pt: 'Picles da casa e cebola roxa fininha fazem toda a diferença. Nota 10.', en: 'House pickles and thin red onion make all the difference. 10/10.' },
];

export const I18N = {
  pt: {
    'nav.menu': 'Cardápio', 'nav.specials': 'Especiais', 'nav.about': 'Sobre', 'nav.reviews': 'Avaliações', 'nav.contact': 'Contato',
    'cta.order': 'Peça agora', 'cta.view': 'Ver cardápio', 'cta.build': 'Monte o seu',
    'hero.badge': '🔥 O burger nº 1 da cidade', 'hero.l1': 'Prove o', 'hero.l2': 'Burger', 'hero.l3': 'Perfeito',
    'hero.p': 'Grelhado na hora, cheio de sabor e feito com carinho. Descubra o burger de que todo mundo está falando.',
    'f1.t': 'Entrega rápida', 'f1.s': 'Na sua porta', 'f2.t': 'Ingredientes frescos', 'f2.s': '100% naturais', 'f3.t': 'Nota 4.9', 'f3.s': 'De mais de 10 mil clientes',
    'hint': 'Arraste para girar · clique numa camada',
    'layers.h': 'Camada por camada', 'layers.p': 'Role para desmontar o burger e ver cada ingrediente. Ele se monta de novo no fim.',
    'menu.h': 'Cardápio', 'menu.p': 'Passe o mouse para girar cada burger.', 'add': 'Adicionar',
    'specials.h': 'Especiais da semana', 'specials.p': 'Combos com desconto. Arraste ou use as setas.', 'prev': 'Anterior', 'next': 'Próximo',
    'build.h': 'Monte o seu', 'build.p': 'Adicione ou tire ingredientes e veja o burger mudar na hora.', 'build.base': 'Pão brioche (base)', 'build.total': 'Total', 'build.add': 'Adicionar ao carrinho', 'build.name': 'Burger do seu jeito',
    'about.h': 'Nossa história', 'about.p1': 'A Burger House começou em 2014 com uma chapa, uma grelha a carvão e uma receita de blend que o fundador levou três anos para acertar.',
    'about.p2': 'Até hoje a carne é moída todo dia, o pão sai do nosso forno de manhã e cada burger passa pela brasa antes de chegar até você.', 'about.hint': 'Clique numa carne para virá-la.',
    'about.s1': 'anos na brasa', 'about.s2': 'burgers por dia', 'about.s3': 'ingredientes locais',
    'reviews.h': 'O que dizem por aí', 'reviews.p': '4.9 de média em mais de 10 mil avaliações.',
    'contact.h': 'Fale com a gente', 'contact.p': 'Reservas, eventos ou só um oi.', 'contact.name': 'Nome', 'contact.email': 'E-mail', 'contact.msg': 'Mensagem', 'contact.send': 'Enviar mensagem',
    'contact.ok': 'Mensagem enviada. Respondemos em até 1 dia útil.', 'contact.err': 'Preencha nome, um e-mail válido e a mensagem.',
    'contact.addr': 'Rua das Brasas, 123 · Vila Madalena, São Paulo', 'contact.hours': 'Todos os dias, 11h às 23h',
    'cart.h': 'Seu pedido', 'cart.empty': 'Seu carrinho está vazio. Escolha um burger no cardápio.', 'cart.total': 'Total', 'cart.checkout': 'Finalizar pedido', 'cart.done': 'Pedido recebido! Ele começa a ser grelhado agora.', 'cart.close': 'Fechar carrinho', 'cart.open': 'Abrir carrinho', 'cart.added': 'adicionado ao carrinho',
    'a11y.mute': 'Ativar ou desativar som', 'a11y.motion': 'Reduzir movimento', 'a11y.lang': 'Mudar idioma para inglês', 'a11y.menu': 'Abrir menu',
    'loading': 'Montando seu burger…', 'rain': 'Chuva de ingredientes!', 'footer': 'Burger House · Feito na brasa desde 2014',
    'remove': 'Remover', 'more': 'Mais', 'less': 'Menos', 'off': 'de',
  },
  en: {
    'nav.menu': 'Menu', 'nav.specials': 'Specials', 'nav.about': 'About', 'nav.reviews': 'Reviews', 'nav.contact': 'Contact',
    'cta.order': 'Order Now', 'cta.view': 'View Menu', 'cta.build': 'Build yours',
    'hero.badge': '🔥 #1 Burger Spot in Town', 'hero.l1': 'Taste The', 'hero.l2': 'Perfect', 'hero.l3': 'Burger',
    'hero.p': 'Freshly grilled, loaded with flavors, and made with love. Experience the burger that everyone\'s talking about.',
    'f1.t': 'Fast Delivery', 'f1.s': 'At your doorstep', 'f2.t': 'Fresh Ingredients', 'f2.s': '100% Natural', 'f3.t': '4.9 Rating', 'f3.s': 'From 10K+ Customers',
    'hint': 'Drag to spin · click a layer',
    'layers.h': 'Layer by layer', 'layers.p': 'Scroll to take the burger apart and see every ingredient. It builds itself back at the end.',
    'menu.h': 'Menu', 'menu.p': 'Hover to spin each burger.', 'add': 'Add',
    'specials.h': 'This week\'s specials', 'specials.p': 'Discounted combos. Drag or use the arrows.', 'prev': 'Previous', 'next': 'Next',
    'build.h': 'Build yours', 'build.p': 'Add or remove ingredients and watch the burger change instantly.', 'build.base': 'Brioche bun (base)', 'build.total': 'Total', 'build.add': 'Add to cart', 'build.name': 'Your custom burger',
    'about.h': 'Our story', 'about.p1': 'Burger House started in 2014 with one griddle, a charcoal grill and a blend recipe our founder spent three years getting right.',
    'about.p2': 'We still grind the meat every day, bake the buns every morning and sear every burger over the coals before it reaches you.', 'about.hint': 'Click a patty to flip it.',
    'about.s1': 'years on the grill', 'about.s2': 'burgers a day', 'about.s3': 'local ingredients',
    'reviews.h': 'What people say', 'reviews.p': '4.9 average from more than 10,000 reviews.',
    'contact.h': 'Get in touch', 'contact.p': 'Bookings, events or just to say hi.', 'contact.name': 'Name', 'contact.email': 'Email', 'contact.msg': 'Message', 'contact.send': 'Send message',
    'contact.ok': 'Message sent. We reply within 1 business day.', 'contact.err': 'Fill in your name, a valid email and a message.',
    'contact.addr': '123 Ember St · Vila Madalena, São Paulo', 'contact.hours': 'Every day, 11am to 11pm',
    'cart.h': 'Your order', 'cart.empty': 'Your cart is empty. Pick a burger from the menu.', 'cart.total': 'Total', 'cart.checkout': 'Place order', 'cart.done': 'Order placed! It\'s hitting the grill now.', 'cart.close': 'Close cart', 'cart.open': 'Open cart', 'cart.added': 'added to cart',
    'a11y.mute': 'Toggle sound', 'a11y.motion': 'Reduce motion', 'a11y.lang': 'Switch language to Portuguese', 'a11y.menu': 'Open menu',
    'loading': 'Building your burger…', 'rain': 'Ingredient rain!', 'footer': 'Burger House · Flame-grilled since 2014',
    'remove': 'Remove', 'more': 'More', 'less': 'Less', 'off': 'was',
  },
};
