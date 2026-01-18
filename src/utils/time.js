export function formatInBusinessTime(utcTime, timezone) {
  if (!utcTime) return '';

  return new Date(utcTime).toLocaleString('en-IN', {
    timeZone: timezone,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// Convert local/business time input to UTC for database storage
export function convertToUTC(localDateTime, timezone) {
  if (!localDateTime) return '';
  
  const date = new Date(localDateTime);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const offset = new Date(localDateTime) - new Date(localDateTime.toLocaleString('en-US', { timeZone: timezone }));
  
  return new Date(date.getTime() - offset).toISOString();
}

// Format UTC time to local/business timezone for UI display
export function formatLocalTime(utcTime, timezone = 'Asia/Kolkata') {
  if (!utcTime) return '';

  const date = new Date(utcTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}