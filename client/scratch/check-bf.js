const bf = require('better-fetch');
console.log('Keys:', Object.keys(bf));
console.log('betterFetch type:', typeof bf.betterFetch);
console.log('default type:', typeof bf.default);
if (bf.default) console.log('default Keys:', Object.keys(bf.default));
