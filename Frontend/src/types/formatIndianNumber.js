// src/utils/formatIndianNumber.js

export function formatIndianNumber(num) {
  if (num == null) return "";
  const parsed = Number(num);
  if (isNaN(parsed)) return "";

  const value = Math.abs(parsed);
  const sign = parsed < 0 ? "-" : "";

  const crore = 1e7;
  const lakh = 1e5;
  const thousand = 1e3;

  const formatWithIndianCommas = (n) =>
    new Intl.NumberFormat("en-IN").format(Math.round(n));

  const trimZeros = (n) => n.toFixed(3).replace(/\.?0+$/, "");

  if (value >= crore) {
    const croreVal = value / crore;
    return `${sign}${trimZeros(croreVal)}Cr`;
  } else if (value >= lakh) {
    const lakhVal = value / lakh;
    return `${sign}${trimZeros(lakhVal)}L`;
  } else if (value >= thousand) {
    const thousandVal = value / thousand;
    return `${sign}${trimZeros(thousandVal)}K`;
  } else {
    return `${sign}${formatWithIndianCommas(value)}`;
  }
}
