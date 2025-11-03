import "server-only";

const HARVEST_API_BASE = 'https://api.harvestapp.com/v2';

function getHarvestHeaders(): Record<string, string> {
  const accessToken = process.env.HARVEST_ACCESS_TOKEN;
  const accountId = process.env.HARVEST_ACCOUNT_ID;

  if (!accessToken || !accountId) {
    throw new Error('Missing Harvest API credentials. Please set HARVEST_ACCESS_TOKEN and HARVEST_ACCOUNT_ID in your environment variables.');
  }

  return {
    'Authorization': `Bearer ${accessToken}`,
    'Harvest-Account-Id': accountId,
    'User-Agent': 'Pigment Harvest Reporting (raju@pigment.se)',
  };
}

async function fetchHarvestPaginated<T>(
  endpoint: string,
  params?: Record<string, string>,
  itemsKey?: string
): Promise<T[]> {
  const headers = getHarvestHeaders();
  const allItems: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const queryParams = new URLSearchParams({
      ...params,
      page: page.toString(),
      per_page: '2000',
    });

    const url = `${HARVEST_API_BASE}${endpoint}?${queryParams.toString()}`;

    // Debug logging for time entries endpoint
    if (endpoint === '/time_entries') {
      console.log(`Harvest API Request: ${url}`);
    }

    const response = await fetch(url, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Harvest API error: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();

    // Handle both wrapped responses (e.g., { time_entries: [...] }) and direct arrays
    const items: T[] = itemsKey ? (data[itemsKey] || []) : (Array.isArray(data) ? data : []);
    allItems.push(...items);

    // Check if there are more pages
    const totalPages = parseInt(response.headers.get('X-Total-Pages') || '1');
    hasMore = page < totalPages;
    page++;
  }

  return allItems;
}

export interface HarvestUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

export interface HarvestClient {
  id: number;
  name: string;
}

export interface HarvestProject {
  id: number;
  name: string;
  client_id: number;
}

export interface HarvestTimeEntry {
  id: number;
  spent_date: string;
  user: {
    id: number;
    name: string;
  };
  project: {
    id: number;
    name: string;
  };
  client: {
    id: number;
    name: string;
  };
  task: {
    id: number;
    name: string;
  };
  notes: string;
  hours: number;
  billable: boolean;
}

export async function fetchUsers(): Promise<HarvestUser[]> {
  return fetchHarvestPaginated<HarvestUser>('/users', undefined, 'users');
}

export async function fetchClients(): Promise<HarvestClient[]> {
  return fetchHarvestPaginated<HarvestClient>('/clients', undefined, 'clients');
}

export async function fetchProjects(): Promise<HarvestProject[]> {
  return fetchHarvestPaginated<HarvestProject>('/projects', undefined, 'projects');
}

export async function fetchTimeEntries(from: string, to: string): Promise<HarvestTimeEntry[]> {
  // Ensure dates are in YYYY-MM-DD format for Harvest API
  if (!from || !to) {
    throw new Error('Both from and to date parameters are required');
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(from) || !dateRegex.test(to)) {
    throw new Error(`Invalid date format. Expected YYYY-MM-DD, got from: ${from}, to: ${to}`);
  }

  return fetchHarvestPaginated<HarvestTimeEntry>('/time_entries', {
    from,
    to,
  }, 'time_entries');
}
