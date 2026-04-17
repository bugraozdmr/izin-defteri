"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { initializeMultipleBalancesAction } from "@/features/leave/actions";

export interface BalanceDraftRow {
  id: string;
  year: string;
  totalDays: string;
}

function createEmptyRow(year?: string): BalanceDraftRow {
  return {
    id: crypto.randomUUID(),
    year: year ?? "",
    totalDays: "",
  };
}

function createDefaultRows(): BalanceDraftRow[] {
  return [
    {
      id: crypto.randomUUID(),
      year: String(new Date().getFullYear()),
      totalDays: "14",
    },
  ];
}

export function useBalanceDetail(userId: string) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rows, setRows] = useState<BalanceDraftRow[]>(createDefaultRows);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) {
        closeModal();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSaving]);

  const openModal = () => setIsOpen(true);

  const closeModal = () => {
    if (isSaving) return;
    setIsOpen(false);
    setRows(createDefaultRows());
  };

  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  };

  const updateYear = (id: string, value: string) => {
    setRows((prev) => prev.map((item) => (item.id === id ? { ...item, year: value } : item)));
  };

  const updateTotalDays = (id: string, value: string) => {
    setRows((prev) => prev.map((item) => (item.id === id ? { ...item, totalDays: value } : item)));
  };

  const submit = async () => {
    const normalizedRows = rows
      .map((item) => {
        const yearText = item.year.trim();
        const daysText = item.totalDays.trim();
        return {
          yearText,
          daysText,
          year: Number(yearText),
          totalDays: Number(daysText),
        };
      })
      .filter((item) => item.yearText.length > 0 || item.daysText.length > 0);

    if (normalizedRows.length === 0) {
      toast.error("En az bir yıl ve bakiye girin.");
      return;
    }

    for (const item of normalizedRows) {
      if (!item.yearText || !item.daysText) {
        toast.error("Yıl ve bakiye alanları birlikte doldurulmalı.");
        return;
      }

      if (!Number.isInteger(item.year) || item.year < 2000 || item.year > 2100) {
        toast.error("Geçerli bir yıl girin.");
        return;
      }

      if (!Number.isFinite(item.totalDays) || item.totalDays <= 0) {
        toast.error("Geçerli bir bakiye girin.");
        return;
      }
    }

    const uniqueYears = new Set(normalizedRows.map((item) => item.year));
    if (uniqueYears.size !== normalizedRows.length) {
      toast.error("Aynı yıl birden fazla kez girilemez.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Bakiyeler ekleniyor...");

    try {
      const response = await initializeMultipleBalancesAction(
        userId,
        normalizedRows
          .sort((a, b) => a.year - b.year)
          .map((item) => ({ year: item.year, totalDays: item.totalDays }))
      );

      if (!response.success) {
        throw new Error(response.message || "Bakiyeler eklenemedi.");
      }

      toast.success("Bakiyeler eklendi.", { id: toastId });
      setIsOpen(false);
      setRows(createDefaultRows());
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message ? String(error.message) : "Bakiyeler eklenemedi.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isOpen,
    isSaving,
    mounted,
    rows,
    openModal,
    closeModal,
    addRow,
    removeRow,
    updateYear,
    updateTotalDays,
    submit,
  };
}
