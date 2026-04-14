import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Leave } from "@/features/leave/types/leave";
import { 
  getPaginatedLeavesAction,
  createLeaveAction, 
  updateLeaveAction, 
  deleteLeaveAction 
} from "@/features/leave/actions/leave.action";

export type LeaveFormPayload = {
  fullName: string;
  hireDate: Date | null;
  leaves: Record<string, number>;
};

export function useLeaveManagement() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Leave | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchLeaves = useCallback(async () => {
    setIsLoading(true);
    
    const response = await getPaginatedLeavesAction({ 
      page, 
      limit: 20, 
      searchTerm: debouncedSearch 
    });
    
    if (response.success && response.data) {
      setLeaves(response.data as unknown as Leave[]); 
      setTotalPages(response.meta?.totalPages || 1);
      setTotalCount(response.meta?.totalCount || 0);
    }
    setIsLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedLeave(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (leave: Leave) => {
    setModalMode("edit");
    setSelectedLeave(leave);
    setIsModalOpen(true);
  };

  const handleSaveLeave = async (payload: LeaveFormPayload) => {
    const toastId = toast.loading("İşlem yapılıyor, lütfen bekleyin...");

    if (modalMode === "edit" && selectedLeave) {
      const response = await updateLeaveAction(selectedLeave.id, payload);
      if (response.success) {
        await fetchLeaves();
        setIsModalOpen(false);
        toast.success("Personel izinleri başarıyla güncellendi!", { id: toastId });
      } else {
        toast.error(response.message || "Güncelleme başarısız.", { id: toastId });
      }
    } else {
      const response = await createLeaveAction(payload);
      if (response.success) {
        await fetchLeaves();
        setIsModalOpen(false);
        toast.success("Yeni personel sisteme eklendi!", { id: toastId });
      } else {
        toast.error(response.message || "Ekleme başarısız.", { id: toastId });
      }
    }
  };

  const handleDeleteLeave = (id: string) => {
    const target = leaves.find((item) => item.id === id) || null;
    setDeleteTarget(target);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    const toastId = toast.loading("Personel kaydı siliniyor...");
    const response = await deleteLeaveAction(deleteTarget.id);
    
    if (response.success) {
      await fetchLeaves();
      setDeleteTarget(null);
      toast.success("Personel kaydı başarıyla silindi.", { id: toastId });
    } else {
      toast.error(response.message || "Silme işlemi başarısız oldu.", { id: toastId });
    }
    setIsDeleting(false);
  };

  return {
    leaves,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    totalPages,
    totalCount,
    isLoading,
    refreshLeaves: fetchLeaves,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    selectedLeave,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    handleOpenCreate,
    handleOpenEdit,
    handleSaveLeave,
    handleDeleteLeave,
    handleConfirmDelete,
  };
}