// ScrapingBee integration for JavaScript-rendered pages
import { ScrapingBeeClient } from 'scrapingbee';

export interface ScrapingBeeOptions {
  render_js?: boolean;
  premium_proxy?: boolean;
  country_code?: string;
  wait?: number;
  wait_for?: string;
  block_ads?: boolean;
  block_resources?: boolean;
  screenshot?: boolean;
  extract_rules?: Record<string, any>;
}

export const SCRAPINGBEE_CONFIG = {
  apiKey: process.env.SCRAPINGBEE_API_KEY || '',

  defaultOptions: {
    render_js: true,
    premium_proxy: true,
    country_code: 'ca',
    wait: 3000,
    block_ads: true,
    block_resources: true,
    screenshot: false,
  } as ScrapingBeeOptions,

  rateLimit: {
    requestsPerMinute: 30,
    delayBetweenRequests: 2000,
  },

  retry: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelay: 1000,
  },
};

export class ScrapingBeeService {
  private client: ScrapingBeeClient | null = null;
  private requestCount = 0;
  private lastRequestTime = 0;

  constructor() {
    if (SCRAPINGBEE_CONFIG.apiKey) {
      this.client = new ScrapingBeeClient(SCRAPINGBEE_CONFIG.apiKey);
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async fetch(url: string, options: ScrapingBeeOptions = {}): Promise<string> {
    if (!this.client) {
      throw new Error('ScrapingBee API key not configured');
    }

    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < SCRAPINGBEE_CONFIG.rateLimit.delayBetweenRequests) {
      await this.delay(SCRAPINGBEE_CONFIG.rateLimit.delayBetweenRequests - timeSinceLastRequest);
    }

    const requestOptions = {
      ...SCRAPINGBEE_CONFIG.defaultOptions,
      ...options,
    };

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < SCRAPINGBEE_CONFIG.retry.maxAttempts) {
      try {
        const response = await this.client.get({
          url,
          params: requestOptions as any,
        });

        this.lastRequestTime = Date.now();
        this.requestCount++;

        return response.data as string;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempt++;

        if (attempt < SCRAPINGBEE_CONFIG.retry.maxAttempts) {
          const delay = SCRAPINGBEE_CONFIG.retry.initialDelay *
                       Math.pow(SCRAPINGBEE_CONFIG.retry.backoffMultiplier, attempt - 1);
          console.log(`ScrapingBee request failed, retrying in ${delay}ms...`);
          await this.delay(delay);
        }
      }
    }

    throw lastError || new Error('ScrapingBee request failed');
  }

  async fetchWithFallback(url: string, options: ScrapingBeeOptions = {}): Promise<string> {
    // Try ScrapingBee first if available
    if (this.isAvailable()) {
      try {
        return await this.fetch(url, options);
      } catch (error) {
        console.warn(`ScrapingBee failed for ${url}, falling back to direct fetch`);
      }
    }

    // Fallback to direct fetch
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-CA,en-US;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.text();
  }

  getStats() {
    return {
      requestCount: this.requestCount,
      isAvailable: this.isAvailable(),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
let scrapingBeeService: ScrapingBeeService | null = null;

export function getScrapingBeeService(): ScrapingBeeService {
  if (!scrapingBeeService) {
    scrapingBeeService = new ScrapingBeeService();
  }
  return scrapingBeeService;
}
