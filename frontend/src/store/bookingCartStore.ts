import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DietaryPreference, EventType } from '@/types/api';

export type WizardStep = 'PACKAGE' | 'CONFIGURE' | 'REVIEW' | 'DETAILS' | 'CONFIRMATION';

interface SelectedMenuItem {
  menuItemId: string;
  quantity: number;
}

interface SelectedOption {
  categoryId: string;
  optionId: string;
  quantity: number;
}

export interface CustomerInfo {
  customerName: string;
  phone: string;
  altPhone: string;
  email: string;
  address: string;
  eventDate: string;
  eventTime: string;
  eventType: EventType;
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
  eventType: 'WEDDING',
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
  menuItems: SelectedMenuItem[];
  selectedOptions: SelectedOption[];
  configureCategoryIndex: number;
  customer: CustomerInfo;
  lastBooking: SubmittedBooking | null;

  goToStep: (step: WizardStep) => void;
  selectPackage: (packageId: string | null, isCustom: boolean) => void;
  setGuestCount: (count: number) => void;
  setDietaryPreference: (pref: DietaryPreference | null) => void;
  setMenuItemQuantity: (menuItemId: string, quantity: number) => void;
  toggleOption: (categoryId: string, optionId: string, allowMultiple: boolean, defaultQuantity: number) => void;
  setOptionQuantity: (categoryId: string, optionId: string, quantity: number) => void;
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
  menuItems: [] as SelectedMenuItem[],
  selectedOptions: [] as SelectedOption[],
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
          menuItems: [],
          selectedOptions: [],
          dietaryPreference: null,
        }),

      setGuestCount: (count) => set({ guestCount: Math.max(1, count) }),

      setDietaryPreference: (pref) => set({ dietaryPreference: pref, menuItems: [] }),

      setMenuItemQuantity: (menuItemId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { menuItems: state.menuItems.filter((m) => m.menuItemId !== menuItemId) };
          }
          const existing = state.menuItems.find((m) => m.menuItemId === menuItemId);
          if (!existing) return { menuItems: [...state.menuItems, { menuItemId, quantity }] };
          return {
            menuItems: state.menuItems.map((m) => (m.menuItemId === menuItemId ? { ...m, quantity } : m)),
          };
        }),

      toggleOption: (categoryId, optionId, allowMultiple, defaultQuantity) =>
        set((state) => {
          const exists = state.selectedOptions.some(
            (o) => o.categoryId === categoryId && o.optionId === optionId,
          );

          if (allowMultiple) {
            return {
              selectedOptions: exists
                ? state.selectedOptions.filter((o) => !(o.categoryId === categoryId && o.optionId === optionId))
                : [...state.selectedOptions, { categoryId, optionId, quantity: defaultQuantity }],
            };
          }

          const withoutCategory = state.selectedOptions.filter((o) => o.categoryId !== categoryId);
          return {
            selectedOptions: exists
              ? withoutCategory
              : [...withoutCategory, { categoryId, optionId, quantity: defaultQuantity }],
          };
        }),

      setOptionQuantity: (categoryId, optionId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              selectedOptions: state.selectedOptions.filter(
                (o) => !(o.categoryId === categoryId && o.optionId === optionId),
              ),
            };
          }
          return {
            selectedOptions: state.selectedOptions.map((o) =>
              o.categoryId === categoryId && o.optionId === optionId ? { ...o, quantity } : o,
            ),
          };
        }),

      setConfigureCategoryIndex: (index) => set({ configureCategoryIndex: index }),
      nextConfigureCategory: () => set((state) => ({ configureCategoryIndex: state.configureCategoryIndex + 1 })),
      prevConfigureCategory: () =>
        set((state) => ({ configureCategoryIndex: Math.max(0, state.configureCategoryIndex - 1) })),

      setCustomerField: (key, value) => set((state) => ({ customer: { ...state.customer, [key]: value } })),

      recordSubmittedBooking: (booking) => set({ lastBooking: booking, step: 'CONFIRMATION' }),

      reset: () => set({ ...initialState, customer: emptyCustomer }),
    }),
    { name: 'ms-wedding-planner-booking-wizard-v2' },
  ),
);
