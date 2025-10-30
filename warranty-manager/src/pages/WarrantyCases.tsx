import { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout } from '@/components/Layout';
import { SearchInput } from '@/components/SearchInput';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Filter, Plus, ArrowUpDown, FileText, ShieldAlert, Clock } from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Подключаем плагин для таблиц
import { saveAs } from "file-saver";
import DejaVuSans from "@/fonts/DejaVuSans.ttf"; // Поместите шрифт в `public/fonts`

axios.defaults.baseURL = 'http://localhost:5000';

export default function WarrantyCases() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [warrantyCases, setWarrantyCases] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [stores, setStores] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [repairHistory, setRepairHistory] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [newStatus, setNewStatus] = useState({ status: '', comment: '' });
  const [newPart, setNewPart] = useState({ spare_part_id: '', quantity: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const repairStatuses = [
    'Принято',
    'В ремонте',
    'Ожидает запчастей',
    'Отремонтировано',
    'Выдано клиенту',
  ];

  useEffect(() => {
    fetchWarrantyCases();
    fetchDropdownData();
    fetchSpareParts();
  }, [page, statusFilter, searchQuery]);

  const fetchWarrantyCases = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/warranty-cases', {
        params: { page, status: statusFilter, search: searchQuery },
      });
      console.log(response.data.warrantyCases)
      setWarrantyCases(response.data.warrantyCases || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      setError('Ошибка при загрузке гарантийных случаев: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [customersRes, devicesRes, storesRes, employeesRes] = await Promise.all([
        axios.get('/customers'),
        axios.get('/devices'),
        axios.get('/stores'),
        axios.get('/employees'),
      ]);
      setCustomers(customersRes.data.customers || customersRes.data || []);
      setDevices(devicesRes.data || []);
      setStores(storesRes.data.stores || []);
      setEmployees(employeesRes.data || []);
    } catch (error) {
      setError('Ошибка при загрузке данных для выпадающих списков: ' + error.message);
    }
  };

  const fetchSpareParts = async () => {
    try {
      const response = await axios.get('/spare-parts');
      console.log(response.data)
      setSpareParts(response.data.spareParts || []);
    } catch (error) {
      setError('Ошибка при загрузке запчастей: ' + error.message);
    }
  };

  const fetchRepairHistory = async (caseId) => {
    try {
      const response = await axios.get(`/warranty-cases/${caseId}/repair-history`);
      setRepairHistory(response.data || []);
    } catch (error) {
      setError('Ошибка при загрузке истории ремонтов: ' + error.message);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleViewDetails = (warrantyCase) => {
    setSelectedCase(warrantyCase);
    fetchRepairHistory(warrantyCase.id);
    setShowDetailDialog(true);
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newCase = {
      customer_id: formData.get('customer'),
      device_id: formData.get('device'),
      store_id: formData.get('store'),
      employee_id: formData.get('technician'),
      issue_description: formData.get('issue'),
      status: formData.get('initial-status'),
    };
    try {
      await axios.post('/warranty-cases', newCase);
      setShowCreateDialog(false);
      fetchWarrantyCases();
    } catch (error) {
      setError('Ошибка при создании гарантийного случая: ' + error.message);
    }
  };

  const handleEditCase = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedCase = {
      customer_id: formData.get('customer'),
      device_id: formData.get('device'),
      store_id: formData.get('store'),
      employee_id: formData.get('technician'),
      issue_description: formData.get('issue'),
      status: selectedCase.status,
    };
    try {
      await axios.put(`/warranty-cases/${selectedCase.id}`, updatedCase);
      setShowEditDialog(false);
      setSelectedCase({ ...selectedCase, ...updatedCase });
      fetchWarrantyCases();
    } catch (error) {
      setError('Ошибка при обновлении гарантийного случая: ' + error.message);
    }
  };

  const handleChangeStatus = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`/warranty-cases/${selectedCase.id}`, { status: newStatus.status });
      await axios.post(`/warranty-cases/${selectedCase.id}/repair-history`, {
        status: newStatus.status,
        comment: newStatus.comment,
      });
      setShowStatusDialog(false);
      setSelectedCase({ ...selectedCase, status: newStatus.status });
      fetchRepairHistory(selectedCase.id);
      fetchWarrantyCases();
      setNewStatus({ status: '', comment: '' });
    } catch (error) {
      setError('Ошибка при изменении статуса: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPart = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`/warranty-cases/${selectedCase.id}/repair-parts`, newPart);
      setShowAddPartDialog(false);
      fetchRepairHistory(selectedCase.id);
      setNewPart({ spare_part_id: '', quantity: '' });
    } catch (error) {
      setError('Ошибка при добавлении запчасти: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Устройство", "Клиент", "Проблема", "Статус", "Дата", "Магазин"];
    const csvRows = warrantyCases.map((warrantyCase) => [
      warrantyCase.id,
      warrantyCase.Device?.model || "Не указано",
      warrantyCase.Customer?.name || "Не указан",
      warrantyCase.issue_description,
      warrantyCase.status,
      warrantyCase.createdAt ? new Date(warrantyCase.createdAt).toLocaleDateString() : "-",
      warrantyCase.Store?.name || "Не указан",
    ]);

    const csvString =
        [headers.join(";"), ...csvRows.map((row) => row.join(";"))].join("\n");

    // 🔹 Преобразование строки в UTF-16LE
    const bom = new Uint8Array([0xFF, 0xFE]);
    const utf16Array = new Uint16Array([...csvString].map((char) => char.charCodeAt(0)));
    const csvBuffer = new Blob([bom, utf16Array], { type: "text/csv;charset=utf-16le;" });

    saveAs(csvBuffer, "warranty_cases.csv");
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(new Blob([buffer]));
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1]; // Убираем префикс data:...
        resolve(base64String);
      };
    });
  };

  const exportPDF = async () => {
    const doc = new jsPDF();

    try {
      // 🔹 Загружаем шрифт как ArrayBuffer и конвертируем в Base64
      const fontBuffer = await fetch("/fonts/DejaVuSans.ttf").then((res) => res.arrayBuffer());
      const fontBase64 = await arrayBufferToBase64(fontBuffer);

      // 🔹 Добавляем шрифт в jsPDF и устанавливаем его
      doc.addFileToVFS("DejaVuSans.ttf", fontBase64);
      doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
      doc.setFont("DejaVuSans");

      // 🔹 Добавляем заголовок
      doc.text("Отчёт по гарантийным случаям", 14, 10);

      // 🔹 Создаём таблицу
      autoTable(doc, {
        startY: 20,
        head: [["ID", "Устройство", "Клиент", "Проблема", "Статус", "Дата", "Магазин"]],
        body: warrantyCases.map((warrantyCase) => [
          warrantyCase.id,
          warrantyCase.Device?.model || "Не указано",
          warrantyCase.Customer?.name || "Не указан",
          warrantyCase.issue_description,
          warrantyCase.status,
          warrantyCase.createdAt ? new Date(warrantyCase.createdAt).toLocaleDateString() : "-",
          warrantyCase.Store?.name || "Не указан",
        ]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133] }, // Цвет заголовков
      });

      // 🔹 Сохраняем PDF
      doc.save("warranty_cases.pdf");
    } catch (error) {
      console.error("Ошибка при генерации PDF:", error);
    }
  };


  const handleCancelWarranty = async () => {
    try {
      setLoading(true);
      await axios.delete(`/warranty-cases/${selectedCase.id}`);
      setShowDetailDialog(false);
      fetchWarrantyCases();
    } catch (error) {
      setError('Ошибка при отмене гарантии: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <Layout>
        <div className="space-y-6">
          {error && <div className="text-red-500 p-2 bg-red-100 rounded">{error}</div>}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Гарантийные случаи</h1>
              <p className="text-muted-foreground mt-1">Управление гарантийными случаями и ремонтами</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" /> Создать
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="w-full sm:w-auto flex-1">
              <SearchInput
                  placeholder="Поиск по ID, клиенту, устройству или проблеме..."
                  onSearch={handleSearch}
                  className="w-full"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4"/>
                  <SelectValue/>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {repairStatuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Кнопка экспорта отчёта */}
            <Select onValueChange={(format) => format === "csv" ? exportCSV() : exportPDF()}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4"/>
                  <SelectValue placeholder="Экспорт"/>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">Экспорт в CSV</SelectItem>
                <SelectItem value="pdf">Экспорт в PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Список гарантийных случаев</CardTitle>
              <CardDescription>Всего найдено: {warrantyCases.length} гарантийных случаев</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                  <div className="text-center">Загрузка...</div>
              ) : (
                  <>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">
                              <div className="flex items-center">ID <ArrowUpDown className="ml-1 h-3 w-3" /></div>
                            </TableHead>
                            <TableHead>Устройство</TableHead>
                            <TableHead>Клиент</TableHead>
                            <TableHead>Проблема</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Дата</TableHead>
                            <TableHead>Магазин</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {warrantyCases.map((warrantyCase) => (
                              <TableRow key={warrantyCase.id}>
                                <TableCell className="font-medium">{warrantyCase.id}</TableCell>
                                <TableCell>
                                  <div>
                                    <div>{warrantyCase.Device?.model || 'Не указано'}</div>
                                    <div className="text-xs text-muted-foreground">{warrantyCase.Device?.imei || '-'}</div>
                                  </div>
                                </TableCell>
                                <TableCell>{warrantyCase.Customer?.name || 'Не указан'}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{warrantyCase.issue_description}</TableCell>
                                <TableCell>{warrantyCase.status}</TableCell>
                                <TableCell>
                                  {warrantyCase.createdAt ? new Date(warrantyCase.createdAt).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell>{warrantyCase.Store?.name || 'Не указан'}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" onClick={() => handleViewDetails(warrantyCase)}>
                                    Подробнее
                                  </Button>
                                </TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious href="#" onClick={() => page > 1 && setPage(page - 1)} />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink href="#" isActive={page === i + 1} onClick={() => setPage(i + 1)}>
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext href="#" onClick={() => page < totalPages && setPage(page + 1)} />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Диалог создания нового гарантийного случая */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Создание гарантийного случая</DialogTitle>
              <DialogDescription>Заполните информацию о новом гарантийном случае</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCase} className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Клиент</Label>
                  <Select name="customer">
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Выберите клиента" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device">Устройство</Label>
                  <Select name="device">
                    <SelectTrigger id="device">
                      <SelectValue placeholder="Выберите устройство" />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.map((device) => (
                          <SelectItem key={device.id} value={device.id.toString()}>
                            {device.model} ({device.imei})
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store">Магазин</Label>
                  <Select name="store">
                    <SelectTrigger id="store">
                      <SelectValue placeholder="Выберите магазин" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                          <SelectItem key={store.id} value={store.id.toString()}>
                            {store.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="technician">Ответственный сотрудник</Label>
                  <Select name="technician">
                    <SelectTrigger id="technician">
                      <SelectValue placeholder="Выберите сотрудника" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            {employee.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue">Описание проблемы</Label>
                <Textarea
                    id="issue"
                    name="issue"
                    placeholder="Опишите проблему с устройством..."
                    rows={3}
                    required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initial-status">Начальный статус</Label>
                <Select name="initial-status" defaultValue="Принято">
                  <SelectTrigger id="initial-status">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    {repairStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowCreateDialog(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Создание...' : 'Создать'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Диалог просмотра деталей */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="sm:max-w-[800px]">
            {selectedCase && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" /> Гарантийный случай {selectedCase.id}
                    </DialogTitle>
                    <DialogDescription>Подробная информация о гарантийном случае</DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="details">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">Информация</TabsTrigger>
                      <TabsTrigger value="history">История статусов</TabsTrigger>
                      <TabsTrigger value="parts">Запчасти</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Устройство</h3>
                          <p className="text-base font-medium">{selectedCase.Device?.model || 'Не указано'}</p>
                          <p className="text-sm text-muted-foreground">{selectedCase.Device?.imei || '-'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Клиент</h3>
                          <p className="text-base font-medium">{selectedCase.Customer?.name || 'Не указан'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Статус</h3>
                          <p className="text-base mt-1">{selectedCase.status}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Дата создания</h3>
                          <p className="text-base">
                            {selectedCase.createdAt ? new Date(selectedCase.createdAt).toLocaleDateString() : '-'}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Магазин</h3>
                          <p className="text-base">{selectedCase.Store?.name || 'Не указан'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Ответственный</h3>
                          <p className="text-base">{selectedCase.Employee?.name || 'Не указан'}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Описание проблемы</h3>
                        <p className="text-base mt-1">{selectedCase.issue_description}</p>
                      </div>
                      <div className="flex justify-between mt-6">
                        <Button variant="outline" onClick={() => setShowStatusDialog(true)} disabled={loading}>
                          <Clock className="mr-2 h-4 w-4" /> Изменить статус
                        </Button>
                        <Button variant="outline" onClick={handleCancelWarranty} disabled={loading}>
                          <ShieldAlert className="mr-2 h-4 w-4" /> Отменить гарантию
                        </Button>
                        <Button onClick={() => setShowEditDialog(true)} disabled={loading}>
                          Редактировать
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="history" className="mt-4">
                      <div className="space-y-4">
                        {repairHistory.length > 0 ? (
                            repairHistory.map((historyItem) => (
                                <div key={historyItem.id} className="bg-muted/50 p-4 rounded-lg border border-border">
                                  <div className="flex justify-between items-start">
                                    <div className="font-medium">{historyItem.status}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {historyItem.updated_at ? new Date(historyItem.updated_at).toLocaleString() : '-'}
                                    </div>
                                  </div>
                                  <div className="text-sm mt-2">{historyItem.comment || 'Комментарий отсутствует'}</div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground">История статусов отсутствует</p>
                        )}
                        <div className="flex justify-end mt-4">
                          <Button onClick={() => setShowStatusDialog(true)} disabled={loading}>
                            Добавить новый статус
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="parts" className="mt-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Название</TableHead>
                              <TableHead>Производитель</TableHead>
                              <TableHead>Количество</TableHead>
                              <TableHead>Стоимость</TableHead>
                              <TableHead>Статус</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {repairHistory.flatMap((historyItem) =>
                                historyItem.RepairParts?.map((part) => (
                                    <TableRow key={part.id}>
                                      <TableCell>{part.SparePart?.name || 'Не указано'}</TableCell>
                                      <TableCell>{part.SparePart?.manufacturer || 'Не указано'}</TableCell>
                                      <TableCell>{part.quantity}</TableCell>
                                      <TableCell>{part.SparePart?.cost || '0'}</TableCell>
                                      <TableCell>{part.SparePart?.status || 'Не указано'}</TableCell>
                                    </TableRow>
                                ))
                            ).length > 0 ? (
                                repairHistory.flatMap((historyItem) =>
                                    historyItem.RepairParts?.map((part) => (
                                        <TableRow key={part.id}>
                                          <TableCell>{part.SparePart?.name || 'Не указано'}</TableCell>
                                          <TableCell>{part.SparePart?.manufacturer || 'Не указано'}</TableCell>
                                          <TableCell>{part.quantity}</TableCell>
                                          <TableCell>{part.SparePart?.cost || '0'}</TableCell>
                                          <TableCell>{part.SparePart?.status || 'Не указано'}</TableCell>
                                        </TableRow>
                                    ))
                                )
                            ) : (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center">
                                    Нет данных о запчастях
                                  </TableCell>
                                </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button onClick={() => setShowAddPartDialog(true)} disabled={loading}>
                          <Plus className="mr-2 h-4 w-4" /> Добавить запчасть
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
            )}
          </DialogContent>
        </Dialog>

        {/* Диалог редактирования гарантийного случая */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Редактирование гарантийного случая</DialogTitle>
              <DialogDescription>Обновите информацию о гарантийном случае</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditCase} className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Клиент</Label>
                  <Select name="customer" defaultValue={selectedCase?.customer_id?.toString()}>
                    <SelectTrigger id="customer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device">Устройство</Label>
                  <Select name="device" defaultValue={selectedCase?.device_id?.toString()}>
                    <SelectTrigger id="device">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.map((device) => (
                          <SelectItem key={device.id} value={device.id.toString()}>
                            {device.model} ({device.imei})
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store">Магазин</Label>
                  <Select name="store" defaultValue={selectedCase?.store_id?.toString()}>
                    <SelectTrigger id="store">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                          <SelectItem key={store.id} value={store.id.toString()}>
                            {store.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="technician">Ответственный сотрудник</Label>
                  <Select name="technician" defaultValue={selectedCase?.employee_id?.toString()}>
                    <SelectTrigger id="technician">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            {employee.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue">Описание проблемы</Label>
                <Textarea
                    id="issue"
                    name="issue"
                    defaultValue={selectedCase?.issue_description}
                    rows={3}
                    required
                />
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowEditDialog(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Диалог изменения статуса */}
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Изменение статуса</DialogTitle>
              <DialogDescription>Выберите новый статус и добавьте комментарий</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleChangeStatus} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">Новый статус</Label>
                <Select
                    name="status"
                    onValueChange={(value) => setNewStatus({ ...newStatus, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    {repairStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Комментарий</Label>
                <Textarea
                    id="comment"
                    name="comment"
                    placeholder="Добавьте комментарий к изменению статуса..."
                    rows={3}
                    onChange={(e) => setNewStatus({ ...newStatus, comment: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowStatusDialog(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Диалог добавления запчасти */}
        <Dialog open={showAddPartDialog} onOpenChange={setShowAddPartDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Добавление запчасти</DialogTitle>
              <DialogDescription>Выберите запчасть и укажите количество</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPart} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="spare_part">Запчасть</Label>
                <Select
                    name="spare_part_id"
                    onValueChange={(value) => setNewPart({ ...newPart, spare_part_id: value })}
                >
                  <SelectTrigger id="spare_part">
                    <SelectValue placeholder="Выберите запчасть" />
                  </SelectTrigger>
                  <SelectContent>
                    {spareParts.map((part) => (
                        <SelectItem key={part.id} value={part.id.toString()}>
                          {part.name} ({part.manufacturer})
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Количество</Label>
                <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={newPart.quantity}
                    onChange={(e) => setNewPart({ ...newPart, quantity: e.target.value })}
                    placeholder="Введите количество"
                    required
                />
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowAddPartDialog(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Добавление...' : 'Добавить'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Layout>
  );
}