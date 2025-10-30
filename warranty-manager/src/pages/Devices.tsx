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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Filter, ArrowUpDown, Smartphone, User, Store, File } from 'lucide-react';

axios.defaults.baseURL = 'http://localhost:5000';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showWarrantyDialog, setShowWarrantyDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [newDevice, setNewDevice] = useState({
    imei: '',
    model: '',
    manufacturer: '',
    purchase_date: '',
    store_id: '',
    customer_id: '',
  });
  const [newWarranty, setNewWarranty] = useState({
    issue_description: '',
    store_id: '',
    employee_id: '',
  });
  const [customers, setCustomers] = useState([]);
  const [stores, setStores] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDevices();
    fetchDropdownData();
  }, [page, searchQuery, manufacturerFilter]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/devices', {
        params: {
          page,
          search: searchQuery,
          manufacturer: manufacturerFilter !== 'all' ? manufacturerFilter : undefined,
        },
      });
      setDevices(response.data.devices || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      setError('Ошибка при загрузке устройств: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [customersRes, storesRes, employeesRes] = await Promise.all([
        axios.get('/customers'),
        axios.get('/stores'),
        axios.get('/employees'),
      ]);
      setCustomers(customersRes.data.customers || customersRes.data || []);
      console.log(storesRes.data);
      setStores(storesRes.data.stores || []);
      setEmployees(employeesRes.data || []);
    } catch (error) {
      setError('Ошибка при загрузке данных: ' + error.message);
    }
  };

  const fetchDeviceDetails = async (id) => {
    try {
      const response = await axios.get(`/devices/${id}`);
      setSelectedDevice(response.data);
    } catch (error) {
      setError('Ошибка при загрузке деталей устройства: ' + error.message);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleViewDetails = (device) => {
    fetchDeviceDetails(device.id);
    setShowDetailDialog(true);
  };

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('/devices', newDevice);
      setDevices([...devices, response.data]);
      setShowCreateDialog(false);
      setNewDevice({ imei: '', model: '', manufacturer: '', purchase_date: '', store_id: '', customer_id: '' });
      fetchDevices();
    } catch (error) {
      setError('Ошибка при создании устройства: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDevice = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`/devices/${selectedDevice.id}`, newDevice);
      setShowEditDialog(false);
      fetchDeviceDetails(selectedDevice.id);
      fetchDevices();
    } catch (error) {
      setError('Ошибка при обновлении устройства: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/devices/${id}`);
      setShowDetailDialog(false);
      fetchDevices();
    } catch (error) {
      setError('Ошибка при удалении устройства: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWarranty = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`/devices/${selectedDevice.id}/warranty-cases`, newWarranty);
      setShowWarrantyDialog(false);
      setNewWarranty({ issue_description: '', store_id: '', employee_id: '' });
      fetchDeviceDetails(selectedDevice.id);
    } catch (error) {
      setError('Ошибка при создании гарантийного случая: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getManufacturers = () => {
    const manufacturers = [...new Set(devices.map((device) => device.manufacturer))];
    return ['all', ...manufacturers];
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Открыто':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Открыто</Badge>;
      case 'В обработке':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">В обработке</Badge>;
      case 'Закрыто':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Закрыто</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Неизвестно</Badge>;
    }
  };

  return (
      <Layout>
        <div className="space-y-6">
          {error && <div className="text-red-500 p-2 bg-red-100 rounded">{error}</div>}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Устройства</h1>
              <p className="text-muted-foreground mt-1">Управление устройствами и их статусами</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="sm:self-start" disabled={loading}>
              <Plus className="mr-2 h-4 w-4" /> Добавить устройство
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-auto flex-1">
              <SearchInput
                  placeholder="Поиск по IMEI или модели..."
                  onSearch={handleSearch}
                  className="w-full"
              />
            </div>
            <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Производитель" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {getManufacturers().map((manufacturer) => (
                    <SelectItem key={manufacturer} value={manufacturer}>
                      {manufacturer === 'all' ? 'Все производители' : manufacturer}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Список устройств</CardTitle>
              <CardDescription>Всего найдено: {devices.length} устройств</CardDescription>
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
                            <TableHead className="w-[150px]">
                              <div className="flex items-center">
                                IMEI/SN <ArrowUpDown className="ml-1 h-3 w-3" />
                              </div>
                            </TableHead>
                            <TableHead>
                              <div className="flex items-center">
                                Устройство <ArrowUpDown className="ml-1 h-3 w-3" />
                              </div>
                            </TableHead>
                            <TableHead>Клиент</TableHead>
                            <TableHead>Дата покупки</TableHead>
                            <TableHead>Магазин</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {devices.map((device) => (
                              <TableRow key={device.id}>
                                <TableCell className="font-medium">{device.imei}</TableCell>
                                <TableCell>
                                  <div>
                                    <div>{device.model}</div>
                                    <div className="text-xs text-muted-foreground">{device.manufacturer}</div>
                                  </div>
                                </TableCell>
                                <TableCell>{device.Customer?.name || 'Не указан'}</TableCell>
                                <TableCell>
                                  {device.purchase_date
                                      ? new Date(device.purchase_date).toLocaleDateString()
                                      : '-'}
                                </TableCell>
                                <TableCell>{device.Store?.name || 'Не указан'}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" onClick={() => handleViewDetails(device)}>
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

        {/* Диалог создания устройства */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Добавление нового устройства</DialogTitle>
              <DialogDescription>Введите информацию о новом устройстве</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDevice} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="imei">IMEI/Серийный номер</Label>
                <Input
                    id="imei"
                    value={newDevice.imei}
                    onChange={(e) => setNewDevice({ ...newDevice, imei: e.target.value })}
                    placeholder="Введите IMEI или SN"
                    required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Модель</Label>
                  <Input
                      id="model"
                      value={newDevice.model}
                      onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                      placeholder="Введите модель устройства"
                      required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Производитель</Label>
                  <Input
                      id="manufacturer"
                      value={newDevice.manufacturer}
                      onChange={(e) => setNewDevice({ ...newDevice, manufacturer: e.target.value })}
                      placeholder="Введите производителя"
                      required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_date">Дата покупки</Label>
                <Input
                    id="purchase_date"
                    type="date"
                    value={newDevice.purchase_date}
                    onChange={(e) => setNewDevice({ ...newDevice, purchase_date: e.target.value })}
                    required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_id">Клиент</Label>
                  <Select
                      value={newDevice.customer_id}
                      onValueChange={(value) => setNewDevice({ ...newDevice, customer_id: value })}
                  >
                    <SelectTrigger id="customer_id">
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
                  <Label htmlFor="store_id">Магазин</Label>
                  <Select
                      value={newDevice.store_id}
                      onValueChange={(value) => setNewDevice({ ...newDevice, store_id: value })}
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

        {/* Диалог редактирования устройства */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Редактирование устройства</DialogTitle>
              <DialogDescription>Обновите информацию об устройстве</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditDevice} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="imei">IMEI/Серийный номер</Label>
                <Input
                    id="imei"
                    value={newDevice.imei}
                    onChange={(e) => setNewDevice({ ...newDevice, imei: e.target.value })}
                    placeholder="Введите IMEI или SN"
                    required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Модель</Label>
                  <Input
                      id="model"
                      value={newDevice.model}
                      onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                      placeholder="Введите модель устройства"
                      required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Производитель</Label>
                  <Input
                      id="manufacturer"
                      value={newDevice.manufacturer}
                      onChange={(e) => setNewDevice({ ...newDevice, manufacturer: e.target.value })}
                      placeholder="Введите производителя"
                      required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_date">Дата покупки</Label>
                <Input
                    id="purchase_date"
                    type="date"
                    value={newDevice.purchase_date}
                    onChange={(e) => setNewDevice({ ...newDevice, purchase_date: e.target.value })}
                    required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_id">Клиент</Label>
                  <Select
                      value={newDevice.customer_id}
                      onValueChange={(value) => setNewDevice({ ...newDevice, customer_id: value })}
                  >
                    <SelectTrigger id="customer_id">
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
                  <Label htmlFor="store_id">Магазин</Label>
                  <Select
                      value={newDevice.store_id}
                      onValueChange={(value) => setNewDevice({ ...newDevice, store_id: value })}
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

        {/* Диалог просмотра деталей устройства */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="sm:max-w-[800px]">
            {selectedDevice && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Smartphone className="mr-2 h-5 w-5" />
                      {selectedDevice.model}
                    </DialogTitle>
                    <DialogDescription>Подробная информация об устройстве</DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="info">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="info">Информация</TabsTrigger>
                      <TabsTrigger value="warranty">Гарантийные случаи</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">IMEI/SN</h3>
                          <p className="text-base">{selectedDevice.imei}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Производитель</h3>
                          <p className="text-base">{selectedDevice.manufacturer}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Дата покупки</h3>
                          <p className="text-base">
                            {selectedDevice.purchase_date
                                ? new Date(selectedDevice.purchase_date).toLocaleDateString()
                                : '-'}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Магазин</h3>
                          <p className="text-base">{selectedDevice.Store?.name || 'Не указан'}</p>
                        </div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <h3 className="text-sm font-medium">Информация о клиенте</h3>
                        </div>
                        <p className="text-base font-medium">{selectedDevice.Customer?.name || 'Не указан'}</p>
                        <p className="text-sm">{selectedDevice.Customer?.phone || '-'}</p>
                      </div>
                      <div className="flex justify-between mt-6 space-x-2">
                        <div className="space-x-2">
                          <Button
                              variant="outline"
                              onClick={() => {
                                setNewDevice(selectedDevice);
                                setShowEditDialog(true);
                              }}
                              disabled={loading}
                          >
                            Редактировать
                          </Button>
                          <Button
                              variant="destructive"
                              onClick={() => handleDeleteDevice(selectedDevice.id)}
                              disabled={loading}
                          >
                            Удалить
                          </Button>
                        </div>
                        <Button onClick={() => setShowWarrantyDialog(true)} disabled={loading}>
                          <Plus className="mr-2 h-4 w-4" />
                          Создать гарантийный случай
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="warranty" className="mt-4">
                      <div className="space-y-4">
                        {selectedDevice.WarrantyCases && selectedDevice.WarrantyCases.length > 0 ? (
                            selectedDevice.WarrantyCases.map((warrantyCase) => (
                                <div key={warrantyCase.id} className="bg-card p-4 rounded-lg border border-border">
                                  <div className="flex justify-between">
                                    <div className="font-medium">Случай #{warrantyCase.id}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {getStatusBadge(warrantyCase.status)}
                                    </div>
                                  </div>
                                  <p className="text-sm mt-2">{warrantyCase.issue_description}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                              <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="text-lg font-medium">Нет гарантийных случаев</h3>
                              <p className="text-muted-foreground mt-1">
                                Для этого устройства не зарегистрировано гарантийных случаев
                              </p>
                              <Button className="mt-4" onClick={() => setShowWarrantyDialog(true)} disabled={loading}>
                                <Plus className="mr-2 h-4 w-4" />
                                Создать гарантийный случай
                              </Button>
                            </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
            )}
          </DialogContent>
        </Dialog>

        {/* Диалог создания гарантийного случая */}
        <Dialog open={showWarrantyDialog} onOpenChange={setShowWarrantyDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Создание гарантийного случая</DialogTitle>
              <DialogDescription>Введите информацию о новом гарантийном случае</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateWarranty} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="issue_description">Описание проблемы</Label>
                <Textarea
                    id="issue_description"
                    value={newWarranty.issue_description}
                    onChange={(e) => setNewWarranty({ ...newWarranty, issue_description: e.target.value })}
                    placeholder="Опишите проблему с устройством..."
                    rows={3}
                    required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store_id">Магазин</Label>
                  <Select
                      value={newWarranty.store_id || selectedDevice?.store_id}
                      onValueChange={(value) => setNewWarranty({ ...newWarranty, store_id: value })}
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
                      value={newWarranty.employee_id}
                      onValueChange={(value) => setNewWarranty({ ...newWarranty, employee_id: value })}
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
                <Button variant="outline" type="button" onClick={() => setShowWarrantyDialog(false)}>
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