import { useEffect, useState } from "react";

import { FaqItem } from "@/app/(home)/sss/constants/sss.constants"; 
import { getAllSssAction } from "@/features/sss/actions/sss.action";

export const useSSS = () => {
  const [faqList, setFaqList] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveFaqs = async () => {
      try {
        setIsLoading(true);
        const res = await getAllSssAction();
        
        if (res.success && res.data) {
          const allFaqs = res.data as unknown as FaqItem[];
          const activeOnly = allFaqs.filter((item) => item.isActive);
          
          setFaqList(activeOnly);
        }
      } catch (error) {
        console.error("SSS verileri çekilirken hata oluştu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveFaqs();
  }, []);

  return {
    faqList,
    isLoading,
  };
};