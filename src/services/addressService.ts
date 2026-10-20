import type { Address, SavedAddress } from '@/types';
import { storage, KEYS } from '@/utils/storage';
import { uid } from './ids';

type Book = Record<string, SavedAddress[]>;
export const addressService = {
  list(userId: string): SavedAddress[] { return storage.get<Book>(KEYS.addresses, {})[userId] ?? []; },
  save(userId: string, a: Address): SavedAddress[] {
    const book = storage.get<Book>(KEYS.addresses, {});
    const list = book[userId] ?? [];
    const dup = list.find((x) => x.line1 === a.line1 && x.pincode === a.pincode);
    book[userId] = dup ? list.map((x) => (x.id === dup.id ? { ...a, id: dup.id } : x)) : [...list, { ...a, id: uid() }];
    storage.set(KEYS.addresses, book);
    return book[userId];
  },
  remove(userId: string, id: string): SavedAddress[] {
    const book = storage.get<Book>(KEYS.addresses, {});
    book[userId] = (book[userId] ?? []).filter((x) => x.id !== id);
    storage.set(KEYS.addresses, book);
    return book[userId];
  },
};
