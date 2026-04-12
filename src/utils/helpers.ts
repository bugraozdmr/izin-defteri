export const formatHolidayDate = (day: number, month: number) => {
    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    return `${day} ${monthNames[month - 1]}`;
  };