import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Layout } from "@/components/Layout";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { SearchInput } from "@/components/SearchInput";
import {
  FileCheck,
  Wrench,
  Clock,
  CheckCircle2,
  MoveRight,
  BarChart4,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

axios.defaults.baseURL = "http://localhost:5000";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
        <div className="glass p-3 rounded-md">
          <p className="font-medium">{label}</p>
          <p className="text-accent">Случаи: {payload[0].value}</p>
          <p className="text-success">Решено: {payload[1].value}</p>
        </div>
    );
  }
  return null;
};

// Status mapping from Russian to English for StatusBadge
const statusMap = {
  Принято: "open",
  "В ремонте": "progress",
  "Ожидает запчастей": "waiting",
  Отремонтировано: "completed",
  "Выдано клиенту": "completed",
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    activeCases: 0,
    inRepair: 0,
    awaitingParts: 0,
    completed: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]); // Renamed to statusData for clarity
  const [categoryData, setCategoryData] = useState([]);
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all warranty cases
      let allWarrantyCases = [];
      let page = 1;
      let totalPages = 1;

      do {
        const warrantyResponse = await axios.get(`/warranty-cases?page=${page}&limit=100`);
        const { warrantyCases, totalPages: fetchedTotalPages } = warrantyResponse.data;
        allWarrantyCases = [...allWarrantyCases, ...warrantyCases];
        totalPages = fetchedTotalPages;
        page++;
      } while (page <= totalPages);

      // Fetch repair statuses for all cases
      const casesWithStatus = await Promise.all(
          allWarrantyCases.map(async (c) => {
            const repairHistoryResponse = await axios.get(`/warranty-cases/${c.id}/repair-history`);
            const repairHistory = repairHistoryResponse.data || [];
            const latestStatus = repairHistory.length > 0 ? repairHistory[0].status : "Принято";
            return {
              ...c,
              currentStatus: latestStatus,
              updated_at: repairHistory.length > 0 ? repairHistory[0].updated_at : c.updated_at,
            };
          })
      );

      console.log("Cases with status:", casesWithStatus);

      // Calculate stats
      const activeCases = casesWithStatus.filter((c) => c.currentStatus === "Принято").length;
      const inRepair = casesWithStatus.filter((c) => c.currentStatus === "В ремонте").length;
      const awaitingParts = casesWithStatus.filter((c) => c.currentStatus === "Ожидает запчастей").length;
      const completed = casesWithStatus.filter(
          (c) => c.currentStatus === "Отремонтировано" || c.currentStatus === "Выдано клиенту"
      ).length; // Removed 30-day filter for consistency

      setStats({
        activeCases,
        inRepair,
        awaitingParts,
        completed,
      });

      // Calculate status-based data for AreaChart (no date dependency)
      const statusData = calculateStatusData(casesWithStatus);
      console.log("Status data:", statusData);
      setMonthlyData(statusData); // Using monthlyData for compatibility with existing chart

      // Calculate category data for BarChart
      const categories = calculateCategoryData(casesWithStatus);
      console.log("Category data:", categories);
      setCategoryData(categories);

      // Recent cases (last 5)
      const sortedCases = casesWithStatus
          .sort((a, b) => b.id - a.id) // Sort by ID descending (no date dependency)
          .slice(0, 5)
          .map((c) => ({
            id: c.id,
            device: `${c.Device?.model || "Неизвестно"} (${c.Device?.imei || "-"})`,
            customer: c.Customer?.name || "Неизвестно",
            issue: c.issue_description || "Нет описания",
            status: statusMap[c.currentStatus] || "unknown",
            date: new Date(c.updated_at).toLocaleDateString("ru-RU"), // Kept for display, not sorting
          }));
      setRecentCases(sortedCases);

    } catch (err) {
      setError("Ошибка при загрузке данных: " + err.message);
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // New function to calculate data by status instead of months
  const calculateStatusData = (cases) => {
    const statuses = ["Принято", "В ремонте", "Ожидает запчастей", "Отремонтировано", "Выдано клиенту"];
    const statusStats = statuses.map((status) => {
      const statusCases = cases.filter((c) => c.currentStatus === status);
      const casesCount = statusCases.length;
      const resolvedCount = statusCases.filter(
          (c) => c.currentStatus === "Отремонтировано" || c.currentStatus === "Выдано клиенту"
      ).length;

      return {
        name: status,
        cases: casesCount,
        resolved: resolvedCount,
      };
    });
    return statusStats;
  };

  const calculateCategoryData = (cases) => {
    const categoryMap = {};
    cases.forEach((c) => {
      const issue = c.issue_description?.toLowerCase() || "Другое";
      let category;
      if (issue.includes("экран") || issue.includes("дисплей")) category = "Дисплей";
      else if (issue.includes("батарея") || issue.includes("аккумулятор")) category = "Батарея";
      else if (issue.includes("камера")) category = "Камера";
      else if (issue.includes("динамик")) category = "Динамик";
      else category = "Другое";

      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    const total = cases.length;
    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: total > 0 ? Math.round((value / total) * 100) : 0,
    }));
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    const filteredCases = recentCases.filter(
        (c) =>
            c.id.toString().toLowerCase().includes(value.toLowerCase()) ||
            c.device.toLowerCase().includes(value.toLowerCase()) ||
            c.customer.toLowerCase().includes(value.toLowerCase())
    );
    setRecentCases(filteredCases.length > 0 ? filteredCases : recentCases);
  };

  const handleViewDetails = (caseId) => {
    navigate(`/warranty-cases/${caseId}`);
  };

  return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Дашборд</h1>
            <p className="text-muted-foreground mt-1">Обзор гарантийных случаев и статистика</p>
          </div>

          {error && <div className="text-red-500 p-2 bg-red-100 rounded">{error}</div>}

          {loading ? (
              <div className="text-center">Загрузка данных...</div>
          ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard
                      title="Активные случаи"
                      value={stats.activeCases.toString()}
                      description="Всего открытых случаев"
                      icon={<FileCheck className="h-6 w-6" />}
                      trend="up"
                      trendValue="12% за неделю"
                  />
                  <StatsCard
                      title="В ремонте"
                      value={stats.inRepair.toString()}
                      description="Устройства в обработке"
                      icon={<Wrench className="h-6 w-6" />}
                      trend="neutral"
                      trendValue="Без изменений"
                  />
                  <StatsCard
                      title="Ожидают запчасти"
                      value={stats.awaitingParts.toString()}
                      description="Задержка ремонта"
                      icon={<Clock className="h-6 w-6" />}
                      trend="down"
                      trendValue="3% за неделю"
                  />
                  <StatsCard
                      title="Завершенные"
                      value={stats.completed.toString()}
                      description="Всего завершенных"
                      icon={<CheckCircle2 className="h-6 w-6" />}
                      trend="up"
                      trendValue="18% за месяц"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-card text-card-foreground p-6 rounded-lg card-shadow">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Динамика гарантийных случаев</h2>
                      <button className="text-sm flex items-center text-accent hover:underline">
                        Полная статистика <MoveRight className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#16A34A" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#16A34A" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Area
                              type="monotone"
                              dataKey="cases"
                              stroke="#3B82F6"
                              fillOpacity={1}
                              fill="url(#colorCases)"
                          />
                          <Area
                              type="monotone"
                              dataKey="resolved"
                              stroke="#16A34A"
                              fillOpacity={1}
                              fill="url(#colorResolved)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-card text-card-foreground p-6 rounded-lg card-shadow">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Типы проблем</h2>
                      <BarChart4 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                              formatter={(value) => [`${value}%`, "Процент"]}
                              wrapperStyle={{
                                background: "white",
                                border: "1px solid #f3f4f6",
                                borderRadius: "8px",
                                padding: "5px",
                              }}
                          />
                          <Legend />
                          <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-card text-card-foreground p-6 rounded-lg card-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl font-semibold">Последние гарантийные случаи</h2>
                    <SearchInput
                        placeholder="Поиск по ID, клиенту или устройству..."
                        onSearch={handleSearch}
                        className="w-full sm:w-auto sm:min-w-[300px]"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                      <tr className="bg-muted">
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground tracking-wider border-b">ID</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground tracking-wider border-b">Устройство</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground tracking-wider border-b">Клиент</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground tracking-wider border-b">Проблема</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground tracking-wider border-b">Статус</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground tracking-wider border-b">Дата</th>
                        <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground tracking-wider border-b">Действия</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-card">
                      {recentCases.map((item) => (
                          <tr key={item.id} className="hover:bg-muted/40 transition-colors duration-200">
                            <td className="px-4 py-3 text-sm font-medium">{item.id}</td>
                            <td className="px-4 py-3 text-sm">{item.device}</td>
                            <td className="px-4 py-3 text-sm">{item.customer}</td>
                            <td className="px-4 py-3 text-sm">{item.issue}</td>
                            <td className="px-4 py-3 text-sm">
                              <StatusBadge status={item.status} />
                            </td>
                            <td className="px-4 py-3 text-sm">{item.date}</td>
                            <td className="px-4 py-3 text-sm text-right">
                              <button
                                  onClick={() => handleViewDetails(item.id)}
                                  className="text-accent hover:text-accent/80 focus:outline-none focus:underline transition-colors"
                              >
                                Подробнее
                              </button>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-center mt-6">
                    <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 focus:outline-none focus:underline transition-colors">
                      Посмотреть все случаи
                      <MoveRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
          )}
        </div>
      </Layout>
  );
};

export default Index;