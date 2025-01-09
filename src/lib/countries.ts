import { type CountryCode, getCountryCallingCode } from "libphonenumber-js";

export const COUNTRIES = [
  { callingCode: "AR", label: "Argentina" },
  { callingCode: "BO", label: "Bolivia" },
  { callingCode: "BR", label: "Brasil" },
  { callingCode: "CL", label: "Chile" },
  { callingCode: "CO", label: "Colombia" },
  { callingCode: "CR", label: "Costa Rica" },
  { callingCode: "CU", label: "Cuba" },
  { callingCode: "DO", label: "República Dominicana" },
  { callingCode: "EC", label: "Ecuador" },
  { callingCode: "SV", label: "El Salvador" },
  { callingCode: "GT", label: "Guatemala" },
  { callingCode: "HN", label: "Honduras" },
  { callingCode: "MX", label: "México" },
  { callingCode: "NI", label: "Nicaragua" },
  { callingCode: "PA", label: "Panamá" },
  { callingCode: "PY", label: "Paraguay" },
  { callingCode: "PE", label: "Perú" },
  { callingCode: "PR", label: "Puerto Rico" },
  { callingCode: "UY", label: "Uruguay" },
  { callingCode: "VE", label: "Venezuela" },
].map((country) => {
  return {
    ...country,
    extension: `+${getCountryCallingCode(country.callingCode as CountryCode)}`,
  };
});
