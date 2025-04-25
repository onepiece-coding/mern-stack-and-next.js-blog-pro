import { dataFetching } from "@/lib/api/admin.calls";
import { TInfo } from "@/types";
import InfoList from "./InfoList";

const DashboardStatistics = async ({ token }: { token: string }) => {
  const info = await dataFetching<TInfo>("/api/admin/info", token);

  const stats = Object.entries(info).map(([key, value]) => ({ key, value }));

  return (
    <section className="py-4 px-2 sm:px-4">
      <h2 id="stats-heading" className="sr-only">
        Statistics
      </h2>
      <InfoList data={stats} />
    </section>
  );
};

export default DashboardStatistics;
