import MainLayout from "@/components/layouts/MainLayout";
import PlayerStats from "@/components/dashboard/PlayerStats";
import CompanyTracking from "@/components/dashboard/CompanyTracking";
import FactionTracking from "@/components/dashboard/FactionTracking";
import TornBazaar from "@/components/dashboard/TornBazaar";
import EmployeeSearchCard from "@/components/dashboard/EmployeeSearchCard";
import FactionSearchCard from "@/components/dashboard/FactionSearchCard";
import { Helmet } from "react-helmet";
import CompanySearchCard from "@/components/dashboard/CompanySearchCard";
import FactionsSearchCard from "@/components/dashboard/FactionsSearchCard";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Dashboard | Byte-Core Vault</title>
        <meta name="description" content="View your Torn RPG stats, company, faction and bazaar information in one place with Byte-Core Vault." />
      </Helmet>
      <MainLayout title="User Stats Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PlayerStats />
          <CompanyTracking />
          <FactionTracking />
          <TornBazaar />
          <EmployeeSearchCard />
          <FactionSearchCard />
          <CompanySearchCard />
          <FactionsSearchCard />
        </div>
      </MainLayout>
    </>
  );
}