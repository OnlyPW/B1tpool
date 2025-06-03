import axios from 'axios';
import logger from '../../logger';
import { ApiPrice } from '../../repositories/PricesRepository'; // Korrigierter Pfad
import { PriceFeed, PriceHistory } from '../price-updater'; // Pfad anpassen, falls nötig

const XeggexTickerURL = 'https://api.xeggex.com/api/v2/asset/getbyticker/B1T';

class XeggexApi implements PriceFeed {
  public name = 'Xeggex';
  public url = XeggexTickerURL; // Für aktuelle Preise
  public urlHist = ''; // Keine historische API von xeggex bekannt/benötigt für diesen einfachen Fall
  public currencies = ['USD']; // Wir holen nur USD direkt

  public async $fetchPrice(currency: string): Promise<number> {
    if (currency !== 'USD') {
      // Xeggex liefert USD, andere Währungen nicht direkt von diesem Endpunkt
      return -1;
    }

    try {
      const response = await axios.get(XeggexTickerURL, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.usdValue) {
        const price = parseFloat(response.data.usdValue);
        if (!isNaN(price) && price > 0) {
          logger.debug(`Xeggex B1T/USD price: ${price}`, logger.tags.mining);
          return price;
        }
      }
      logger.warn(`Could not parse B1T/USD price from Xeggex response: ${JSON.stringify(response.data)}`, logger.tags.mining);
      return -1;
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (axios.isAxiosError(error)) {
        errorMessage = error.message;
        if (error.response) {
          errorMessage += ` - Status: ${error.response.status} - Data: ${JSON.stringify(error.response.data)}`;
        }
      }
      logger.err(`Could not fetch B1T/USD price from Xeggex. Reason: ${errorMessage}`, logger.tags.mining);
      return -1;
    }
  }

  public async $fetchRecentPrice(currencies: string[], type: string): Promise<PriceHistory> {
    // Historische Daten werden von diesem einfachen Feed nicht unterstützt
    logger.debug('Xeggex feed does not support $fetchRecentPrice', logger.tags.mining);
    return {};
  }
}

export default XeggexApi; 