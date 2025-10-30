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
import {Plus, User, Phone, Mail, MapPin, Edit, Trash2, Smartphone, FileSpreadsheet, FileText} from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from 'file-saver';

axios.defaults.baseURL = 'http://localhost:5000';

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDeviceDialog, setShowAddDeviceDialog] = useState(false);
  const [showCreateWarrantyDialog, setShowCreateWarrantyDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customerDevices, setCustomerDevices] = useState([]); // Devices for the selected customer
  const [allDevices, setAllDevices] = useState([]); // All devices for counting
  const [stores, setStores] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '', notes: '' });
  const [newDevice, setNewDevice] = useState({ imei: '', model: '', manufacturer: '', purchase_date: '', store_id: '' });
  const [newWarranty, setNewWarranty] = useState({ device_id: '', issue_description: '', store_id: '', employee_id: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers();
    fetchStoresAndEmployees();
    fetchAllDevices(); // Fetch all devices on mount
  }, [page, searchQuery]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/customers?page=${page}&search=${searchQuery}`);
      setCustomers(response.data.customers || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      setError('Ошибка при загрузке клиентов: ' + error.message);
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoresAndEmployees = async () => {
    try {
      const [storesRes, employeesRes] = await Promise.all([
        axios.get('/stores'),
        axios.get('/employees'),
      ]);
      setStores(storesRes.data.stores || storesRes.data || []);
      setEmployees(employeesRes.data.employees || employeesRes.data || []);
    } catch (error) {
      setError('Ошибка при загрузке магазинов и сотрудников: ' + error.message);
      console.error('Error fetching stores and employees:', error);
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "ФИО", "Телефон", "Email", "Адрес"];
    const csvRows = customers.map((customer) => [
      customer.id,
      customer.name,
      customer.phone,
      customer.email || "Не указан",
      customer.address || "Не указан",
    ]);

    // Добавляем BOM (Byte Order Mark) для корректного отображения кириллицы
    const csvContent =
        "\uFEFF" + [headers.join(";"), ...csvRows.map(row => row.join(";"))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "customers_report.csv");
  };

  // 🔹 Функция для экспорта данных в PDF
  const exportPDF = async () => {
    const doc = new jsPDF();

    try {
      // Загружаем шрифт DejaVuSans (UTF-8 поддержка для русского языка)
      const fontResponse = await fetch("/fonts/DejaVuSans.ttf");
      if (!fontResponse.ok) {
        throw new Error("Ошибка загрузки шрифта");
      }

      const fontBuffer = await fontResponse.arrayBuffer();
      const fontBase64 = await arrayBufferToBase64(fontBuffer);

      doc.addFileToVFS("DejaVuSans.ttf", fontBase64);
      doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
      doc.setFont("DejaVuSans");

      doc.text("Отчёт по клиентам", 14, 10);

      autoTable(doc, {
        startY: 20,
        head: [["ID", "ФИО", "Телефон", "Email", "Адрес"]],
        body: customers.map((customer) => [
          customer.id,
          customer.name,
          customer.phone,
          customer.email || "Не указан",
          customer.address || "Не указан",
        ]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133] }, // Цвет заголовков
      });

      doc.save("customers_report.pdf");
    } catch (error) {
      console.error("Ошибка при генерации PDF:", error);
    }
  };

  // 🔹 Функция для конвертации ArrayBuffer в Base64
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

  const fetchAllDevices = async () => {
    try {
      const response = await axios.get('/devices'); // Fetch all devices without customer filter
      console.log('All devices:', response.data); // Debug
      setAllDevices(response.data || []);
    } catch (error) {
      setError('Ошибка при загрузке всех устройств: ' + error.message);
      console.error('Error fetching all devices:', error);
    }
  };

  const fetchCustomerDevices = async (customerId) => {
    try {
      const response = await axios.get(`/devices?customer_id=${customerId}`);
      console.log('Customer devices:', response.data); // Debug
      setCustomerDevices(response.data || []);
    } catch (error) {
      setError('Ошибка при загрузке устройств клиента: ' + error.message);
      console.error('Error fetching customer devices:', error);
    }
  };

  // Calculate the number of devices for a given customer
  const getDeviceCount = (customerId) => {
    return allDevices.filter((device) => device.customer_id === customerId).length;
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    fetchCustomerDevices(customer.id);
    setShowDetailDialog(true);
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/customers', newCustomer);
      setShowCreateDialog(false);
      setNewCustomer({ name: '', phone: '', email: '', address: '', notes: '' });
      fetchCustomers();
    } catch (error) {
      setError('Ошибка при создании клиента: ' + error.message);
      console.error('Error creating customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`/customers/${selectedCustomer.id}`, newCustomer);
      setShowEditDialog(false);
      setSelectedCustomer({ ...selectedCustomer, ...newCustomer });
      fetchCustomers();
    } catch (error) {
      setError('Ошибка при обновлении клиента: ' + error.message);
      console.error('Error updating customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      setLoading(true);
      await axios.delete(`/customers/${customerId}`);
      setShowDetailDialog(false);
      fetchCustomers();
      fetchAllDevices(); // Refresh all devices since some may be deleted
    } catch (error) {
      setError('Ошибка при удалении клиента: ' + error.message);
      console.error('Error deleting customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const deviceData = { ...newDevice, customer_id: selectedCustomer.id };
      if (newDevice.id) {
        await axios.put(`/devices/${newDevice.id}`, deviceData);
      } else {
        await axios.post('/devices', deviceData);
      }
      setShowAddDeviceDialog(false);
      setNewDevice({ imei: '', model: '', manufacturer: '', purchase_date: '', store_id: '' });
      fetchCustomerDevices(selectedCustomer.id);
      fetchAllDevices(); // Refresh all devices to update counts
    } catch (error) {
      setError('Ошибка при добавлении/обновлении устройства: ' + error.message);
      console.error('Error adding/updating device:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWarranty = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/warranty-cases', { ...newWarranty, customer_id: selectedCustomer.id });
      setShowCreateWarrantyDialog(false);
      setNewWarranty({ device_id: '', issue_description: '', store_id: '', employee_id: '' });
      fetchCustomers(); // Refresh if activeCases is affected
    } catch (error) {
      setError('Ошибка при создании гарантийного случая: ' + error.message);
      console.error('Error creating warranty case:', error);
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
              <h1 className="text-3xl font-bold tracking-tight">Клиенты</h1>
              <p className="text-muted-foreground mt-1">Управление клиентами и их устройствами</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="sm:self-start" disabled={loading}>
              <Plus className="mr-2 h-4 w-4"/> Добавить клиента
            </Button>
          </div>

          <div className="w-full">
            <SearchInput
                placeholder="Поиск по имени, телефону или email..."
                onSearch={handleSearch}
                className="w-full"
            />

          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV}>
              <FileSpreadsheet className="mr-2 h-4 w-4"/> Экспорт в CSV
            </Button>
            <Button variant="outline" onClick={exportPDF}>
              <FileText className="mr-2 h-4 w-4"/> Экспорт в PDF
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Список клиентов</CardTitle>
              <CardDescription>Всего найдено: {customers.length} клиентов</CardDescription>
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
                            <TableHead>ФИО</TableHead>
                            <TableHead>Телефон</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Устройства</TableHead>
                            <TableHead>Активные гарантии</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customers.length > 0 ? (
                              customers.map((customer) => (
                                  <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>{customer.phone}</TableCell>
                                    <TableCell>{customer.email || '-'}</TableCell>
                                    <TableCell>{getDeviceCount(customer.id)}</TableCell>
                                    <TableCell>
                                      {customer.activeCases > 0 ? (
                                          <span
                                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/15 text-accent">
                                  {customer.activeCases}
                                </span>
                                      ) : (
                                          <span className="text-muted-foreground">Нет</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(customer)}>
                                        Подробнее
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                              ))
                          ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                  Клиенты не найдены
                                </TableCell>
                              </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious href="#" onClick={() => page > 1 && setPage(page - 1)}/>
                          </PaginationItem>
                          {Array.from({length: totalPages}, (_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink
                                    href="#"
                                    isActive={page === i + 1}
                                    onClick={() => setPage(i + 1)}
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext href="#" onClick={() => page < totalPages && setPage(page + 1)}/>
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Диалог создания нового клиента */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Добавление нового клиента</DialogTitle>
              <DialogDescription>Введите информацию о новом клиенте</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCustomer} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">ФИО</Label>
                <Input
                    id="full-name"
                    name="name"
                    placeholder="Введите полное имя клиента"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                      id="phone"
                      name="phone"
                      placeholder="+7 (___) ___-__-__"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                      id="email"
                      name="email"
                      placeholder="example@mail.com"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Адрес</Label>
                <Textarea
                    id="address"
                    name="address"
                    placeholder="Введите полный адрес клиента"
                    rows={2}
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Примечания</Label>
                <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Дополнительная информация о клиенте"
                    rows={2}
                    value={newCustomer.notes}
                    onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowCreateDialog(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Добавление...' : 'Добавить'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Диалог редактирования клиента */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Редактирование клиента</DialogTitle>
              <DialogDescription>Обновите информацию о клиенте</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditCustomer} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">ФИО</Label>
                <Input
                    id="full-name"
                    name="name"
                    placeholder="Введите полное имя клиента"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                      id="phone"
                      name="phone"
                      placeholder="+7 (___) ___-__-__"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                      id="email"
                      name="email"
                      placeholder="example@mail.com"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Адрес</Label>
                <Textarea
                    id="address"
                    name="address"
                    placeholder="Введите полный адрес клиента"
                    rows={2}
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Примечания</Label>
                <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Дополнительная информация о клиенте"
                    rows={2}
                    value={newCustomer.notes}
                    onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
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

        {/* Диалог просмотра деталей клиента */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="sm:max-w-[800px]">
            {selectedCustomer && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      {selectedCustomer.name}
                    </DialogTitle>
                    <DialogDescription>Подробная информация о клиенте</DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="info">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="info">Информация</TabsTrigger>
                      <TabsTrigger value="devices">Устройства ({customerDevices.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Контактная информация</h3>
                            <div className="mt-2 space-y-2">
                              <div className="flex items-start">
                                <Phone className="h-4 w-4 text-muted-foreground mt-1 mr-2" />
                                <div>
                                  <p className="text-sm font-medium">Телефон</p>
                                  <p className="text-sm">{selectedCustomer.phone}</p>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <Mail className="h-4 w-4 text-muted-foreground mt-1 mr-2" />
                                <div>
                                  <p className="text-sm font-medium">Email</p>
                                  <p className="text-sm">{selectedCustomer.email || '-'}</p>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-1 mr-2" />
                                <div>
                                  <p className="text-sm font-medium">Адрес</p>
                                  <p className="text-sm">{selectedCustomer.address || '-'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Информация об активности</h3>
                            <div className="mt-2 space-y-2">
                              <div className="flex items-start">
                                <div>
                                  <p className="text-sm font-medium">Последний визит</p>
                                  <p className="text-sm">
                                    {selectedCustomer.lastVisit
                                        ? new Date(selectedCustomer.lastVisit).toLocaleDateString()
                                        : '-'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <div>
                                  <p className="text-sm font-medium">Активные гарантийные случаи</p>
                                  <p className="text-sm">
                                    {selectedCustomer.activeCases > 0
                                        ? `${selectedCustomer.activeCases} активных случаев`
                                        : 'Нет активных случаев'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Примечания</h3>
                            <p className="text-sm mt-2">{selectedCustomer.notes || 'Нет примечаний'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between mt-6 space-x-2">
                        <div className="space-x-2">
                          <Button
                              variant="outline"
                              onClick={() => {
                                setNewCustomer(selectedCustomer);
                                setShowEditDialog(true);
                              }}
                              disabled={loading}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Редактировать
                          </Button>
                          <Button
                              variant="destructive"
                              onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                              disabled={loading}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                          </Button>
                        </div>
                        <Button onClick={() => setShowCreateWarrantyDialog(true)} disabled={loading}>
                          <Plus className="mr-2 h-4 w-4" />
                          Новый гарантийный случай
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="devices" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex justify-end">
                          <Button onClick={() => setShowAddDeviceDialog(true)} disabled={loading}>
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить устройство
                          </Button>
                        </div>
                        {customerDevices.length > 0 ? (
                            customerDevices.map((device) => (
                                <div
                                    key={device.id}
                                    className="bg-card p-4 rounded-lg border border-border flex flex-col md:flex-row justify-between"
                                >
                                  <div className="flex items-start gap-3">
                                    <Smartphone className="h-10 w-10 text-muted-foreground bg-muted/50 p-2 rounded" />
                                    <div>
                                      <h4 className="font-medium">{device.model}</h4>
                                      <p className="text-sm text-muted-foreground">{device.manufacturer}</p>
                                      <div className="mt-2 text-sm">
                                        <p>IMEI/SN: {device.imei}</p>
                                        <p>Дата покупки: {new Date(device.purchase_date).toLocaleDateString()}</p>
                                        <p>Магазин: {stores.find((s) => s.id === device.store_id)?.name || '-'}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0 md:items-start">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setNewDevice(device);
                                          setShowAddDeviceDialog(true);
                                        }}
                                        disabled={loading}
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Изменить
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => {
                                          setNewWarranty({ ...newWarranty, device_id: device.id });
                                          setShowCreateWarrantyDialog(true);
                                        }}
                                        disabled={loading}
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Ремонт
                                    </Button>
                                  </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground">Устройства не найдены</p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
            )}
          </DialogContent>
        </Dialog>

        {/* Диалог добавления/редактирования устройства */}
        <Dialog open={showAddDeviceDialog} onOpenChange={setShowAddDeviceDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{newDevice.id ? 'Редактирование устройства' : 'Добавление устройства'}</DialogTitle>
              <DialogDescription>Введите информацию об устройстве</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDevice} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="imei">IMEI/SN</Label>
                <Input
                    id="imei"
                    name="imei"
                    placeholder="Введите IMEI или серийный номер"
                    value={newDevice.imei}
                    onChange={(e) => setNewDevice({ ...newDevice, imei: e.target.value })}
                    required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Модель</Label>
                  <Input
                      id="model"
                      name="model"
                      placeholder="Введите модель устройства"
                      value={newDevice.model}
                      onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                      required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Производитель</Label>
                  <Input
                      id="manufacturer"
                      name="manufacturer"
                      placeholder="Введите производителя"
                      value={newDevice.manufacturer}
                      onChange={(e) => setNewDevice({ ...newDevice, manufacturer: e.target.value })}
                      required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_date">Дата покупки</Label>
                <Input
                    id="purchase_date"
                    name="purchase_date"
                    type="date"
                    value={newDevice.purchase_date}
                    onChange={(e) => setNewDevice({ ...newDevice, purchase_date: e.target.value })}
                    required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_id">Магазин</Label>
                <Select
                    name="store_id"
                    onValueChange={(value) => setNewDevice({ ...newDevice, store_id: value })}
                    value={newDevice.store_id}
                >
                  <SelectTrigger id="store_id">
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
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowAddDeviceDialog(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Сохранение...' : newDevice.id ? 'Сохранить' : 'Добавить'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Диалог создания гарантийного случая */}
        <Dialog open={showCreateWarrantyDialog} onOpenChange={setShowCreateWarrantyDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Создание гарантийного случая</DialogTitle>
              <DialogDescription>Введите информацию о новом гарантийном случае</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateWarranty} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="device_id">Устройство</Label>
                <Select
                    name="device_id"
                    onValueChange={(value) => setNewWarranty({ ...newWarranty, device_id: value })}
                    value={newWarranty.device_id}
                >
                  <SelectTrigger id="device_id">
                    <SelectValue placeholder="Выберите устройство" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerDevices.map((device) => (
                        <SelectItem key={device.id} value={device.id.toString()}>
                          {device.model} ({device.imei})
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue_description">Описание проблемы</Label>
                <Textarea
                    id="issue_description"
                    name="issue_description"
                    placeholder="Опишите проблему с устройством..."
                    rows={3}
                    value={newWarranty.issue_description}
                    onChange={(e) => setNewWarranty({ ...newWarranty, issue_description: e.target.value })}
                    required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store_id">Магазин</Label>
                  <Select
                      name="store_id"
                      onValueChange={(value) => setNewWarranty({ ...newWarranty, store_id: value })}
                      value={newWarranty.store_id}
                  >
                    <SelectTrigger id="store_id">
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
                  <Label htmlFor="employee_id">Ответственный сотрудник</Label>
                  <Select
                      name="employee_id"
                      onValueChange={(value) => setNewWarranty({ ...newWarranty, employee_id: value })}
                      value={newWarranty.employee_id}
                  >
                    <SelectTrigger id="employee_id">
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
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowCreateWarrantyDialog(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Создание...' : 'Создать'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Layout>
  );
}