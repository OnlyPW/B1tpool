import { TransactionExtended, TransactionMinerInfo } from '../mempool.interfaces';
import { IEsploraApi } from './bitcoin/esplora-api.interface';
import { Common } from './common';
import bitcoinApi, { bitcoinCoreApi } from './bitcoin/bitcoin-api-factory';

class TransactionUtils {
  constructor() { }

  public stripCoinbaseTransaction(tx: TransactionExtended): TransactionMinerInfo {
    return {
      vin: [{
        scriptsig: tx.vin[0].scriptsig || tx.vin[0]['coinbase']
      }],
      vout: tx.vout
        .map((vout) => ({
          scriptpubkey_address: vout.scriptpubkey_address,
          scriptpubkey_asm: vout.scriptpubkey_asm,
          value: vout.value
        }))
        .filter((vout) => vout.value)
    };
  }

  /**
   * @param txId 
   * @param addPrevouts 
   * @param lazyPrevouts 
   * @param forceCore - See https://github.com/mempool/mempool/issues/2904
   */
  public async $getTransactionExtended(txId: string, addPrevouts = false, lazyPrevouts = false, forceCore = false): Promise<TransactionExtended> {
    let transaction: IEsploraApi.Transaction;
    if (forceCore === true) {
      transaction  = await bitcoinCoreApi.$getRawTransaction(txId, true);
    } else {
      transaction  = await bitcoinApi.$getRawTransaction(txId, false, addPrevouts, lazyPrevouts);
    }
    return this.extendTransaction(transaction);
  }

  private extendTransaction(rpcTxData: IEsploraApi.Transaction): TransactionExtended {
    console.log("transaction-utils.ts: extendTransaction called. Input rpcTxData:", JSON.stringify(rpcTxData)); // DEBUG

    const txExtended: Partial<TransactionExtended> = {
      ...rpcTxData,
      weight: 0, // Initialisiere weight, wird unten überschrieben
    };

    // 1. Stelle sicher, dass wir ein numerisches vsize haben
    // rpcTxData.vsize sollte direkt vom Core RPC Call kommen, wenn dieser vsize liefert.
    if (rpcTxData.vsize !== undefined && rpcTxData.vsize !== null) {
      txExtended.vsize = Number(rpcTxData.vsize);
      console.log("transaction-utils.ts: Case 1: vsize from rpcTxData.vsize", txExtended.vsize); // DEBUG
    } else if (rpcTxData.weight !== undefined && rpcTxData.weight !== null && Number(rpcTxData.weight) > 0) { // Fallback: vsize aus weight berechnen
      txExtended.vsize = Math.round(Number(rpcTxData.weight) / 4);
      console.log("transaction-utils.ts: Case 2: vsize from rpcTxData.weight", txExtended.vsize, "rpcTxData.weight", rpcTxData.weight); // DEBUG
    } else {
      txExtended.vsize = 0; // Fallback, falls beides fehlt
      // Wenn weder vsize noch weight vorhanden sind, versuchen wir es aus size zu schätzen (nicht ideal für SegWit)
      if (rpcTxData.size !== undefined && rpcTxData.size !== null && txExtended.vsize === 0) {
        txExtended.vsize = Number(rpcTxData.size); // Annahme: für nicht-segwit tx ist vsize ~ size
        console.log("transaction-utils.ts: Case 3: vsize estimated from rpcTxData.size", txExtended.vsize); // DEBUG
      }
    }

    // 2. Berechne weight aus dem (jetzt gesetzten) vsize
    txExtended.weight = txExtended.vsize * 4;
    console.log("transaction-utils.ts: Calculated weight:", txExtended.weight, "from txExtended.vsize:", txExtended.vsize); // DEBUG

    // 3. Berechne Gebühren pro VByte
    if (txExtended.vsize > 0 && rpcTxData.fee !== undefined && rpcTxData.fee !== null) {
      const feePerV = Number(rpcTxData.fee) / txExtended.vsize;
      txExtended.feePerVsize = feePerV;
      txExtended.effectiveFeePerVsize = feePerV; // Vereinfachung
    } else {
      txExtended.feePerVsize = 0;
      txExtended.effectiveFeePerVsize = 0;
    }
    console.log("transaction-utils.ts: FeePerVsize:", txExtended.feePerVsize); // DEBUG

    // 4. Setze firstSeen für Mempool-Transaktionen
    if (!rpcTxData.status.confirmed) {
      txExtended.firstSeen = Math.round((new Date().getTime() / 1000));
    }

    console.log("transaction-utils.ts: Final txExtended before return:", JSON.stringify(txExtended)); // DEBUG
    return txExtended as TransactionExtended;
  }

  public hex2ascii(hex: string) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  }
}

export default new TransactionUtils();
