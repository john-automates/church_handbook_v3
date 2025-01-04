import sectionUrls from '@/data/handbook_sections.json';

export function getSectionUrl(sectionNumber: string): string | null {
  // Trim whitespace and ensure we're working with the original section number
  const cleanSection = sectionNumber.trim();
  
  console.log('Looking up section:', {
    original: sectionNumber,
    cleaned: cleanSection,
    hasExactMatch: Boolean((sectionUrls as Record<string, string>)[cleanSection]),
    availableKeys: Object.keys(sectionUrls).filter(key => key.startsWith(cleanSection.split('.')[0]))
  });

  // Try exact match first
  if ((sectionUrls as Record<string, string>)[cleanSection]) {
    return (sectionUrls as Record<string, string>)[cleanSection];
  }

  // Split the section number into parts
  const parts = cleanSection.split('.');

  // For sections like 7.1.4, try 7.1.4 first (already done above), then 7.1
  if (parts.length === 3) {
    const parentSection = `${parts[0]}.${parts[1]}`;
    if ((sectionUrls as Record<string, string>)[parentSection]) {
      return (sectionUrls as Record<string, string>)[parentSection];
    }
  }

  // For sections like 30.7, try 30.7 first (already done above), then 30.0
  if (parts.length === 2) {
    const mainSection = `${parts[0]}.0`;
    if ((sectionUrls as Record<string, string>)[mainSection]) {
      return (sectionUrls as Record<string, string>)[mainSection];
    }
  }

  // For sections like 7, try 7.0
  if (parts.length === 1) {
    const mainSection = `${cleanSection}.0`;
    if ((sectionUrls as Record<string, string>)[mainSection]) {
      return (sectionUrls as Record<string, string>)[mainSection];
    }
  }

  return null;
} 