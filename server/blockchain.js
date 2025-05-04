const CryptoJS = require('crypto-js');
const ProofOfStorage = require('./storage.js');

class Blockchain {
  constructor(gun) {
    this.gun = gun;
    this.chain = [];
    this.storage = new ProofOfStorage();
    this.init();
  }

  async init() {
    // Correction : Retirez la parenthèse fermante en trop après "block.hash"
    this.gun.get('blocks').map().on((block) => {
      if (block && !this.chain.find(b => b.hash === block.hash)) { // <-- Ligne corrigée
        this.chain.push(block);
      }
    });
  }

  async mineBlock(spaceMB) {
    const reward = this.storage.calculateReward(spaceMB);
    const newBlock = {
      index: this.chain.length,
      timestamp: Date.now(),
      transactions: [{ reward }],
      previousHash: this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : '0',
    };
    newBlock.hash = CryptoJS.SHA256(JSON.stringify(newBlock)).toString();
    
    this.gun.get('blocks').get(newBlock.index.toString()).put(newBlock);
    this.chain.push(newBlock);
  }
}

module.exports = Blockchain;