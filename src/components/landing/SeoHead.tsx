import React, { useEffect } from "react";

interface SeoHeadProps {
  activeTab: "landing" | "wizard" | "dashboard";
}

export const SeoHead: React.FC<SeoHeadProps> = ({ activeTab }) => {
  useEffect(() => {
    let title = "AI GostDoc — ИИ-Генератор курсовых и ВКР по ГОСТ 7.32-2017";
    let description = "Автоматическая генерация курсовых, ВКР и рефератов с версткой по ГОСТ 7.32-2017.";

    if (activeTab === "wizard") {
      title = "Мастер генерации документа | AI GostDoc";
      description = "Заполните вводные данные и сгенерируйте научную работу по ГОСТ 7.32-2017 с AST-редактором планов.";
    } else if (activeTab === "dashboard") {
      title = "Личный кабинет & Мои документы | AI GostDoc";
      description = "Управление сгенерированными работами, балансом кредитов и точечной перегенерацией.";
    }

    document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }
  }, [activeTab]);

  return null;
};

export default SeoHead;
