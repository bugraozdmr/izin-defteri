import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { UserFormPayload } from "@/features/user/types";
import { User, UserTableRow } from "@/features/user/constants";
import { 
  getPaginatedUsersAction,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  
} from "@/features/user/actions";


export function useUserManagement() {
  // const [users, setUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<UserTableRow[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    
    const response = await getPaginatedUsersAction({ 
      page, 
      limit: 20, 
      searchTerm: debouncedSearch 
    });
    
    if (response.success && response.data) {
      // setUsers(response.data as unknown as User[]); 
      setUsers(response.data as unknown as UserTableRow[]);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalCount(response.meta?.totalCount || 0);
    }
    setIsLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setModalMode("edit");
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (payload: UserFormPayload) => {
    const toastId = toast.loading("İşlem yapılıyor, lütfen bekleyin...");

    if (modalMode === "edit" && selectedUser) {
      const response = await updateUserAction(selectedUser.id, payload);
      if (response.success) {
        await fetchUsers();
        setIsModalOpen(false);
        toast.success("Personel bilgileri başarıyla güncellendi!", { id: toastId });
      } else {
        toast.error(response.message || "Güncelleme başarısız.", { id: toastId });
      }
    } else {
      const response = await createUserAction(payload);
      if (response.success) {
        await fetchUsers();
        setIsModalOpen(false);
        toast.success("Yeni personel sisteme eklendi!", { id: toastId });
      } else {
        toast.error(response.message || "Ekleme başarısız.", { id: toastId });
      }
    }
  };

  const handleDeleteUser = (id: string) => {
    const target = users.find((item) => item.id === id) || null;
    setDeleteTarget(target);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    const toastId = toast.loading("Personel kaydı siliniyor...");
    const response = await deleteUserAction(deleteTarget.id);
    
    if (response.success) {
      await fetchUsers();
      setDeleteTarget(null);
      toast.success("Personel kaydı başarıyla silindi.", { id: toastId });
    } else {
      toast.error(response.message || "Silme işlemi başarısız oldu.", { id: toastId });
    }
    setIsDeleting(false);
  };

  return {
    users,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    totalPages,
    totalCount,
    isLoading,
    refreshUsers: fetchUsers,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    selectedUser,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    handleOpenCreate,
    handleOpenEdit,
    handleSaveUser,
    handleDeleteUser,
    handleConfirmDelete,
  };
}