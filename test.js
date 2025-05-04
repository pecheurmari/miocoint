const Blockchain = require('./blockchain.js');
const blockchain = new Blockchain();

async function test() {
  // Simule un utilisateur allouant 100 mébioctes
  await blockchain.storageSystem.allocateStorage(100); 
  
  // Ajoute un bloc avec la récompense
  await blockchain.addBlock(100); 
  
  console.log("Blockchain actuelle :", blockchain.chain);
}

test();