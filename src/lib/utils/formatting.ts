/**
 * Formatting utilities for ORDINA application
 * Handles currency, date, and number formatting with localization support
 */

/**
 * Formats a currency amount with proper localization
 * 
 * Currency conversion logic:
 * - AZN (Azerbaijani Manat) is the base currency
 * - USD conversion uses a fixed exchange rate (default 1.7)
 * - When displaying in USD, amount is divided by exchange rate
 * - Example: 100 AZN = 100 / 1.7 = 58.82 USD
 * 
 * Why fixed exchange rate:
 * The application uses a fixed rate for simplicity and consistency.
 * Users can see their expenses in both currencies without API calls.
 * 
 * @param amount - The amount to format (in base currency AZN)
 * @param currency - The currency code ('AZN' or 'USD')
 * @param exchangeRate - The exchange rate for USD conversion (default 1.7)
 * @returns Formatted currency string (e.g., "100.00 AZN" or "58.82 USD")
 */
export function formatCurrency(
  amount: number,
  currency: 'AZN' | 'USD' = 'AZN',
  exchangeRate: number = 1.7
): string {
  if (typeof amount !== 'number' || !isFinite(amount)) {
    return '0.00';
  }

  // Convert to USD if needed, otherwise use amount as-is
  const displayAmount = currency === 'USD' ? amount / exchangeRate : amount;
  const formatted = displayAmount.toFixed(2);
  
  return `${formatted} ${currency}`;
}

/**
 * Formats an ISO date string for display based on language
 * 
 * Date formatting varies by language:
 * - English: "January 1, 2024" (Month Day, Year)
 * - Russian: "1 января 2024" (Day Month Year, genitive case for month)
 * - Azerbaijani: "1 Yanvar 2024" (Day Month Year)
 * - Italian: "1 gennaio 2024" (Day Month Year)
 * 
 * Russian genitive case:
 * Russian uses the genitive case for month names in dates.
 * Example: "Январь" (January) becomes "января" (of January)
 * This is grammatically correct for expressing "1st of January"
 * 
 * @param isoDate - ISO date string (YYYY-MM-DD)
 * @param language - Language code ('en', 'ru', 'az', 'it')
 * @param monthsArray - Optional array of month names for the language
 * @returns Formatted date string
 */
export function formatISODateForDisplay(
  isoDate: string,
  language: string = 'en',
  monthsArray?: string[]
): string {
  if (!isoDate || typeof isoDate !== 'string') {
    return '';
  }

  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return isoDate;
  }

  const year = match[1];
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  // Default month names for different languages
  const defaultMonths: Record<string, string[]> = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 
         'July', 'August', 'September', 'October', 'November', 'December'],
    ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
         'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    az: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
         'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'],
    it: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
         'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
  };

  const months = monthsArray || defaultMonths[language] || defaultMonths.en;
  const monthName = months[month - 1] || month.toString();

  // Format based on language conventions
  switch (language) {
    case 'ru':
      // Russian: "1 января 2024"
      return `${day} ${monthName} ${year}`;
    case 'en':
      // English: "January 1, 2024"
      return `${months[month - 1]} ${day}, ${year}`;
    case 'az':
      // Azerbaijani: "1 Yanvar 2024"
      return `${day} ${monthName} ${year}`;
    case 'it':
      // Italian: "1 gennaio 2024"
      return `${day} ${monthName} ${year}`;
    default:
      return `${day} ${monthName} ${year}`;
  }
}

/**
 * Formats a month ID (YYYY-MM) for display
 * @param monthId - Month ID string (YYYY-MM)
 * @param language - Language code
 * @param monthsArray - Optional array of month names
 * @returns Formatted month string (e.g., "January 2024")
 */
export function formatMonthId(
  monthId: string,
  language: string = 'en',
  monthsArray?: string[]
): string {
  if (!monthId || typeof monthId !== 'string') {
    return '';
  }

  const match = monthId.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return monthId;
  }

  const year = match[1];
  const month = parseInt(match[2], 10);

  const defaultMonths: Record<string, string[]> = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 
         'July', 'August', 'September', 'October', 'November', 'December'],
    ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
         'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    az: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
         'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'],
    it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
         'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
  };

  const months = monthsArray || defaultMonths[language] || defaultMonths.en;
  const monthName = months[month - 1] || month.toString();

  return `${monthName} ${year}`;
}

/**
 * Gets today's date as an ISO string (YYYY-MM-DD)
 * @returns ISO date string for today
 */
export function getTodayISOString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Gets current month ID (YYYY-MM)
 * @returns Month ID string
 */
export function getCurrentMonthId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  return `${year}-${month}`;
}

/**
 * Formats a number with thousands separators
 * @param num - Number to format
 * @param decimals - Number of decimal places (default 2)
 * @returns Formatted number string
 */
export function formatNumber(num: number, decimals: number = 2): string {
  if (typeof num !== 'number' || !isFinite(num)) {
    return '0';
  }
  
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
