export interface DashboardData {
    userId: string;
    email: string;
    name: string;
    totalLinksCreated: number;
    uniqueLinksCount: number;
    lastFiveLinks: Array<{
      link: string;
      customSuffix: string;
    }>;
    topCountries: Array<{
      country: string;
      clickCount: number;
    }>;
  }