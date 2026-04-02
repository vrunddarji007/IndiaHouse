const formatSuspensionDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const weekday = weekdays[d.getDay()];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const strTime = `${hours}:${minutes}:${seconds} ${ampm}`;
  
  const timezone = d.toString().split('(')[1] ? `(${d.toString().split('(')[1]}` : '';
  const gmt = d.toString().match(/GMT[+-]\d{4}/)?.[0] || '';
  
  // Format: Sunday, Mar/29/2026 11:30:18 PM GMT+0530 (India Standard Time)
  return `${weekday}, ${month}/${day}/${year} ${strTime} ${gmt} ${timezone}`;
};

module.exports = formatSuspensionDate;
