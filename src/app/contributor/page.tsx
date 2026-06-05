import ContributorDashboard from "@/components/ContributorDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contributor Dashboard — Lens.ke",
  description: "Manage your photography portfolio on Lens.ke",
};

export default function ContributorPage() {
  return <ContributorDashboard />;
}
