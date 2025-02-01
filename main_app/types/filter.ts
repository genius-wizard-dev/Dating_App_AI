
export interface Filter {
  gender:  GenderFilter;
  location: string;
  ageRange: number[];
}
export type GenderFilter = "Male" | "Female" | "Both" | "Other";
