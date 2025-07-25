export type Specialization = {
  id: number;
  name: string;
  icon: string;
  role?: "tank" | "healer" | "dps";
  href: string;
};
