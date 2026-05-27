export type DefaultCategory = {
  name: string;
  kind: 'expense' | 'income';
  color: string;
  icon: string;
  position: number;
};

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'Food & Drink',  kind: 'expense', color: '#F59E0B', icon: 'fork.knife',         position: 1 },
  { name: 'Transport',     kind: 'expense', color: '#3B82F6', icon: 'car.fill',           position: 2 },
  { name: 'Bills',         kind: 'expense', color: '#EF4444', icon: 'doc.text.fill',      position: 3 },
  { name: 'Shopping',      kind: 'expense', color: '#EC4899', icon: 'bag.fill',           position: 4 },
  { name: 'Entertainment', kind: 'expense', color: '#8B5CF6', icon: 'tv.fill',            position: 5 },
  { name: 'Health',        kind: 'expense', color: '#10B981', icon: 'cross.case.fill',    position: 6 },
  { name: 'Travel',        kind: 'expense', color: '#06B6D4', icon: 'airplane',           position: 7 },
  { name: 'Education',     kind: 'expense', color: '#0EA5E9', icon: 'book.fill',          position: 8 },
  { name: 'Home',          kind: 'expense', color: '#84CC16', icon: 'house.fill',         position: 9 },
  { name: 'Salary',        kind: 'income',  color: '#22C55E', icon: 'banknote.fill',      position: 1 },
  { name: 'Other Income',  kind: 'income',  color: '#A3E635', icon: 'arrow.down.circle',  position: 2 },
];
