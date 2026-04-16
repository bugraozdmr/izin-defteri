import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Holiday } from "@/features/holiday/types";
import { 
  getAllHolidaysAction, 
  createHolidayAction, 
  updateHolidayAction, 
  deleteHolidayAction 
} from "@/features/holiday/actions";

export function useHolidayManagement() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Holiday | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHolidays = async () => {
      setIsLoading(true);
      const response = await getAllHolidaysAction();
      if (response.success && response.data) {
        setHolidays(response.data as unknown as Holiday[]); 
      }
      setIsLoading(false);
    };
    fetchHolidays();
  }, []);

  const filteredHolidays = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return holidays;

    return holidays.filter((h) => {
      const yearLabel = h.year ? String(h.year) : "her yil";
      const typeLabel = h.type === "PUBLIC" ? "resmi public" : "kurumsal corporate";
      const dateLabel = `${String(h.day).padStart(2, "0")}/${String(h.month).padStart(2, "0")}`;
      const text = [h.name, h.description ?? "", yearLabel, typeLabel, dateLabel].join(" ").toLowerCase();
      return text.includes(q);
    });
  }, [holidays, searchTerm]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedHoliday(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (holiday: Holiday) => {
    setModalMode("edit");
    setSelectedHoliday(holiday);
    setIsModalOpen(true);
  };

  const handleSaveHoliday = async (payload: Omit<Holiday, "id">) => {
    const toastId = toast.loading("İşlem yapılıyor, lütfen bekleyin...");

    if (modalMode === "edit" && selectedHoliday) {
      const response = await updateHolidayAction(selectedHoliday.id, payload);
      if (response.success) {
        setHolidays((prev) => prev.map((item) => (item.id === selectedHoliday.id ? { ...item, ...payload } : item)));
        setIsModalOpen(false);
        toast.success("Tatil başarıyla güncellendi!", { id: toastId });
      } else {
        toast.error(response.message || "Güncelleme başarısız.", { id: toastId });
      }
    } else {
      const response = await createHolidayAction(payload);
      if (response.success && response.data) {
        setHolidays((prev) => [response.data as unknown as Holiday, ...prev]);
        setIsModalOpen(false);
        toast.success("Yeni tatil sisteme eklendi!", { id: toastId });
      } else {
        toast.error(response.message || "Ekleme başarısız.", { id: toastId });
      }
    }
  };

  const handleDeleteHoliday = (id: string) => {
    const target = holidays.find((item) => item.id === id) || null;
    setDeleteTarget(target);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const toastId = toast.loading("Tatil siliniyor...");
    const response = await deleteHolidayAction(deleteTarget.id);
    
    if (response.success) {
      setHolidays((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Tatil başarıyla silindi.", { id: toastId });
    } else {
      toast.error(response.message || "Silme işlemi başarısız oldu.", { id: toastId });
    }
    setIsDeleting(false);
  };

  return {
    holidays,
    filteredHolidays,
    searchTerm,
    setSearchTerm,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    selectedHoliday,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    handleOpenCreate,
    handleOpenEdit,
    handleSaveHoliday,
    handleDeleteHoliday,
    handleConfirmDelete,
  };
}