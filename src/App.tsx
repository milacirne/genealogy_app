import { Route, Routes } from "react-router-dom";
import { Header } from "./components/layout/Header/Header";
import { PageContainer } from "./components/layout/PageContainer/PageContainer";
import { HomePage } from "./pages/HomePage/HomePage";
import { FamiliesPage } from "./pages/FamiliesPage/FamiliesPage";
import { FamilyPage } from "./pages/FamilyPage/FamilyPage";
import { TreePage } from "./pages/TreePage/TreePage";
import { PlaceholderPage } from "./pages/PlaceholderPage/PlaceholderPage";
import { ScrollToTop } from "./components/navigation/ScrollToTop/ScrollToTop";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <PageContainer>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/families" element={<FamiliesPage />} />
          <Route path="/families/:familyId" element={<FamilyPage />} />
          <Route path="/tree" element={<TreePage />} />
          <Route path="/people/:personId" element={<PlaceholderPage title="Registro de Personagem" />} />
          <Route path="*" element={<PlaceholderPage title="Registro não encontrado" />} />
        </Routes>
      </PageContainer>
    </>
  );
}
