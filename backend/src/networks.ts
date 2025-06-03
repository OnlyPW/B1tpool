import { Network } from 'bitcoinjs-lib';

export const bitNetwork: Network = {
  messagePrefix: '\x18Bit Signed Message:\n',
  bech32: 'bit', // Annahme, muss verifiziert werden, ob Bit Bech32 verwendet und welches HRP
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398,
  },
  pubKeyHash: 0x19, // Dezimal 25 (B)
  scriptHash: 0x16, // Dezimal 22
  wif: 0x9e, // Dezimal 158
  // Die folgenden sind eher für P2P relevant, aber zur Vollständigkeit
  // magic: 0x46544231, // FTB1 - bitcoinjs-lib verwendet dies nicht direkt
  // port: 33317, // P2P Port
};

// Optional: Wenn es ein Testnet gibt und dessen Parameter bekannt sind
// export const bitTestnetNetwork: Network = { ... }; 