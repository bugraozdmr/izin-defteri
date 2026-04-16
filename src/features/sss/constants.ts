import { SssFormType } from "./types";

// PUBLIC
export type FaqItem = {
	id: string;
	question: string;
	answer: string;
    isActive: boolean;
};

// ADMIN
export type SssItem = {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const INITIAL_SSS_FORM: SssFormType = {
  question: "",
  answer: "",
  isActive: true,
};