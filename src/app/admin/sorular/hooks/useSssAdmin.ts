import { useEffect, useMemo, useState } from "react";
import { SssItem } from "@/app/admin/sorular/constants/sss.constants";
import { 
  getAllSssAction, 
  createSssAction, 
  updateSssAction, 
  deleteSssAction 
} from "@/features/sss/actions/sss.action";

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
      const res = await getAllSssAction();
      if (res.success && res.data) {
        setSssList(res.data as unknown as SssItem[]);
      }
    } catch (error) {
      console.error("Veriler çekilemedi:", error);
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

    setIsDeleting(true);
    try {
      const res = await deleteSssAction(itemToDelete.id);
      if (res.success) {
        setSssList((prev) => prev.filter((item) => item.id !== itemToDelete.id));
        setDeleteModalOpen(false);
        setItemToDelete(null);
      } else {
        alert(res.message || "Silme işlemi başarısız oldu.");
      }
    } catch (error) {
      console.error("Silme hatası:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveSss = async (payload: Pick<SssItem, "question" | "answer" | "isActive">) => {
    try {
      if (modalMode === "create") {
        const res = await createSssAction(payload);
        if (res.success) {
          fetchSssList();
          setModalOpen(false);
        } else {
          alert(res.message || "Kayıt eklenemedi.");
        }
      } else if (modalMode === "edit" && selectedSss) {
        const res = await updateSssAction(selectedSss.id, payload);
        if (res.success) {
          fetchSssList();
          setModalOpen(false);
        } else {
          alert(res.message || "Kayıt güncellenemedi.");
        }
      }
    } catch (error) {
      console.error("Kaydetme hatası:", error);
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