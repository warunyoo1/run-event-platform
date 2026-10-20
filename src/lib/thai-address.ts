import rawAddresses from "../data/thai-addresses.json" with { type: "json" };

type Subdistrict = [name: string, postalCode: string];
type District = [name: string, subdistricts: Subdistrict[]];
const addresses = rawAddresses as [name: string, districts: District[]][];

export function addressDistricts(province: string): string[] {
  return addresses.find(([name]) => name === province)?.[1].map(([name]) => name) ?? [];
}

export function addressSubdistricts(province: string, district: string): Subdistrict[] {
  return addresses.find(([name]) => name === province)?.[1].find(([name]) => name === district)?.[1] ?? [];
}

export function updateAddress<T extends { province: string; district: string; subdistrict: string; postalCode: string }>(address: T, key: keyof T, value: string): T {
  if (key === "province") return { ...address, province: value, district: "", subdistrict: "", postalCode: "" };
  if (key === "district") return { ...address, district: value, subdistrict: "", postalCode: "" };
  if (key === "subdistrict") return { ...address, subdistrict: value, postalCode: addressSubdistricts(address.province, address.district).find(([name]) => name === value)?.[1] ?? "" };
  return { ...address, [key]: value };
}
