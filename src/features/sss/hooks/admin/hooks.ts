import { useEffect, useMemo, useState } from "react";
import { SssItem } from "@/features/sss/constants";
import { 
  getAllSssFreshAction, 
  createSssAction, 
  updateSssAction, 
  deleteSssAction 
} from "@/features/sss/actions";

import { toast } from "sonner";

export const useSssAdmin = () => {
  const [sssList, setSssList] = useState<SssItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedSss, setSelectedSss] = useState<SssItem | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SssItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSssList = async () => {
    setIsLoading(true);
    try {
      const res = await getAllSssFreshAction();
      if (res.success && res.data) {
        setSssList(res.data as unknown as SssItem[]);
      } else {
        toast.error("Sorular yüklenirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Veriler çekilemedi:", error);
      toast.error("Sunucu ile bağlantı kurulamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSssList();
  }, []);

  const filteredSssList = useMemo(() => {
    if (!searchTerm.trim()) return sssList;

    const normalizedQuery = searchTerm.trim().toLocaleLowerCase("tr-TR");

    return sssList.filter((item) => {
      const question = item.question.toLocaleLowerCase("tr-TR");
      const answer = item.answer.toLocaleLowerCase("tr-TR");
      return question.includes(normalizedQuery) || answer.includes(normalizedQuery);
    });
  }, [searchTerm, sssList]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedSss(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: SssItem) => {
    setModalMode("edit");
    setSelectedSss(item);
    setModalOpen(true);
  };

  const handleDeleteClick = (item: SssItem) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    const toastId = toast.loading("Soru siliniyor...");
    setIsDeleting(true);
    
    try {
      const res = await deleteSssAction(itemToDelete.id);
      if (res.success) {
        setSssList((prev) => prev.filter((item) => item.id !== itemToDelete.id));
        setDeleteModalOpen(false);
        setItemToDelete(null);
        fetchSssList();
        toast.success("Soru başarıyla silindi!", { id: toastId });
      } else {
        toast.error(res.message || "Silme işlemi başarısız oldu.", { id: toastId });
      }
    } catch (error) {
      console.error("Silme hatası:", error);
      toast.error("Silme işlemi sırasında beklenmeyen bir hata oluştu.", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveSss = async (payload: Pick<SssItem, "question" | "answer" | "isActive">) => {
    const toastId = toast.loading("İşlem yapılıyor, lütfen bekleyin...");

    try {
      if (modalMode === "create") {
        const res = await createSssAction(payload);
        if (res.success) {
          if (res.data) {
            setSssList((prev) => [...prev, res.data as unknown as SssItem]);
          }
          fetchSssList();
          setModalOpen(false);
          toast.success("Soru başarıyla oluşturuldu!", { id: toastId });
        } else {
          toast.error(res.message || "Oluşturma işlemi başarısız.", { id: toastId });
        }
      } else if (modalMode === "edit" && selectedSss) {
        const res = await updateSssAction(selectedSss.id, payload);
        if (res.success) {
          if (res.data) {
            setSssList((prev) => prev.map((item) => (item.id === selectedSss.id ? (res.data as unknown as SssItem) : item)));
          }
          fetchSssList();
          setModalOpen(false);
          toast.success("Soru başarıyla güncellendi!", { id: toastId });
        } else {
          toast.error(res.message || "Güncelleme işlemi başarısız.", { id: toastId });
        }
      }
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      toast.error("İşlem sırasında beklenmeyen bir hata oluştu.", { id: toastId });
    }
  };

  return {
    isLoading,
    searchTerm,
    setSearchTerm,
    filteredSssList,
    modalOpen,
    setModalOpen,
    modalMode,
    selectedSss,
    handleOpenCreate,
    handleOpenEdit,
    handleSaveSss,
    deleteModalOpen,
    isDeleting,
    itemToDelete,
    handleDeleteClick,
    handleCancelDelete,
    confirmDelete,
  };
};