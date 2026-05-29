export const getYesterday = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
};

// Formats JS Date to YYYY-MM-DD for HTML5 date input
export const formatDateForInput = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Formats YYYY-MM-DD string to YYYYMMDD string for KOBIS API
export const formatForApi = (dateString: string): string => {
  return dateString.replace(/-/g, '');
};

// Re-formats YYYY-MM-DD string visually
export const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};
