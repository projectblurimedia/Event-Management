import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DietaryPreference } from '@/types/api';

export type WizardStep = 'PACKAGE' | 'CONFIGURE' | 'REVIEW' | 'DETAILS' | 'CONFIRMATION';

interface SelectedItem {
  categoryId: string;
  itemId: string;
}

export interface CustomerInfo {
  customerName: string;
  phone: string;
  altPhone: string;
  email: string;
  address: string;
  eventDate: string;
  eventTime: string;
  eventTypeId: string;
  specialRequirements: string;
}

const emptyCustomer: CustomerInfo = {
  customerName: '',
  phone: '',
  altPhone: '',
  email: '',
  address: '',
  eventDate: '',
  eventTime: '',
  eventTypeId: '',
  specialRequirements: '',
};

interface SubmittedBooking {
  id: string;
  bookingCode: string;
  phone: string;
}

interface BookingWizardState {
  step: WizardStep;
  packageId: string | null;
  isCustom: boolean;
  guestCount: number | null;
  dietaryPreference: DietaryPreference | null;
  selectedItems: SelectedItem[];
  configureCategoryIndex: number;
  customer: CustomerInfo;
  lastBooking: SubmittedBooking | null;

  goToStep: (step: WizardStep) => void;
  selectPackage: (packageId: string | null, isCustom: boolean) => void;
  setGuestCount: (count: number) => void;
  setDietaryPreference: (pref: DietaryPreference | null) => void;
  /** Add/remove an item. Non-multiple categories replace any existing pick in that category (single-select). */
  toggleItem: (categoryId: string, itemId: string, allowMultiple: boolean) => void;
  clearCategorySelections: (categoryId: string) => void;
  setConfigureCategoryIndex: (index: number) => void;
  nextConfigureCategory: () => void;
  prevConfigureCategory: () => void;
  setCustomerField: <K extends keyof CustomerInfo>(key: K, value: CustomerInfo[K]) => void;
  recordSubmittedBooking: (booking: SubmittedBooking) => void;
  reset: () => void;
}

const initialState = {
  step: 'PACKAGE' as WizardStep,
  packageId: null as string | null,
  isCustom: false,
  guestCount: null as number | null,
  dietaryPreference: null as DietaryPreference | null,
  selectedItems: [] as SelectedItem[],
  configureCategoryIndex: 0,
  customer: emptyCustomer,
  lastBooking: null as SubmittedBooking | null,
};

export const useBookingCartStore = create<BookingWizardState>()(
  persist(
    (set) => ({
      ...initialState,

      goToStep: (step) => set({ step }),

      selectPackage: (packageId, isCustom) =>
        set({
          packageId,
          isCustom,
          configureCategoryIndex: 0,
          selectedItems: [],
          dietaryPreference: null,
        }),

      setGuestCount: (count) => set({ guestCount: Math.max(1, count) }),

      setDietaryPreference: (pref) => set({ dietaryPreference: pref }),

      toggleItem: (categoryId, itemId, allowMultiple) =>
        set((state) => {
          const exists = state.selectedItems.some((i) => i.categoryId === categoryId && i.itemId === itemId);

          if (allowMultiple) {
            return {
              selectedItems: exists
                ? state.selectedItems.filter((i) => !(i.categoryId === categoryId && i.itemId === itemId))
                : [...state.selectedItems, { categoryId, itemId }],
            };
          }

          const withoutCategory = state.selectedItems.filter((i) => i.categoryId !== categoryId);
          return {
            selectedItems: exists ? withoutCategory : [...withoutCategory, { categoryId, itemId }],
          };
        }),

      clearCategorySelections: (categoryId) =>
        set((state) => ({ selectedItems: state.selectedItems.filter((i) => i.categoryId !== categoryId) })),

      setConfigureCategoryIndex: (index) => set({ configureCategoryIndex: index }),
      nextConfigureCategory: () => set((state) => ({ configureCategoryIndex: state.configureCategoryIndex + 1 })),
      prevConfigureCategory: () =>
        set((state) => ({ configureCategoryIndex: Math.max(0, state.configureCategoryIndex - 1) })),

      setCustomerField: (key, value) => set((state) => ({ customer: { ...state.customer, [key]: value } })),

      recordSubmittedBooking: (booking) => set({ lastBooking: booking, step: 'CONFIRMATION' }),

      reset: () => set({ ...initialState, customer: emptyCustomer }),
    }),
    { name: 'event-management-booking-wizard-v4' },
  ),
);
