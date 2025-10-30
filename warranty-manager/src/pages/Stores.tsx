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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  Phone,
  Plus,
  Users,
  Pencil,
  Trash2,
  Store as StoreIcon,
  User,
} from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

axios.defaults.baseURL = 'http://localhost:5000';

export default function Stores() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [stores, setStores] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newStore, setNewStore] = useState({
    name: '',
    location: '',
    phone: '',
    manager_id: null, // Use null instead of empty string
  });
  const [editStore, setEditStore] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStores();
    fetchEmployees();
  }, [page, searchQuery]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/stores', {
        params: {
          page,
          search: searchQuery,
        },
      });
      setStores(response.data.stores || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      setError('Ошибка при загрузке магазинов: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/employees');
      setEmployees(response.data || []);
      console.log('Employees fetched:', response.data);
    } catch (error) {
      setError('Ошибка при загрузке сотрудников: ' + error.message);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleOpenDetail = (store) => {
    setSelectedStore(store);
    setEditStore({ ...store });
    setShowDetailDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStore((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditStore((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const storeData = {
        ...newStore,
        manager_id: newStore.manager_id === 'none' ? null : newStore.manager_id,
      };
      await axios.post('/stores', storeData);
      setShowCreateDialog(false);
      setNewStore({ name: '', location: '', phone: '', manager_id: null });
      fetchStores();
    } catch (error) {
      setError('Ошибка при создании магазина: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStore = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const storeData = {
        ...editStore,
        manager_id: editStore.manager_id === 'none' ? null : editStore.manager_id,
      };
      await axios.put(`/stores/${selectedStore.id}`, storeData);
      setSelectedStore(editStore);
      setShowDetailDialog(false);
      fetchStores();
    } catch (error) {
      setError('Ошибка при обновлении магазина: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStore = async () => {
    try {
      setLoading(true);
      await axios.delete(`/stores/${selectedStore.id}`);
      setShowDetailDialog(false);
      fetchStores();
    } catch (error) {
      setError('Ошибка при удалении магазина: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStoreEmployees = (storeId) => {
    return employees.filter((employee) => employee.store_id === storeId);
  };

  return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Магазины</h1>
            <p className="text-muted-foreground mt-1">Управление магазинами и их сотрудниками</p>
          </div>

          {error && <div className="text-red-500 p-2 bg-red-100 rounded">{error}</div>}

          <div className="flex justify-between items-center">
            <SearchInput
                placeholder="Поиск магазинов..."
                onSearch={handleSearch}
                className="w-[300px]"
            />
            <Button onClick={() => setShowCreateDialog(true)} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить магазин
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Список магазинов</CardTitle>
              <CardDescription>Всего магазинов: {stores.length}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                  <div className="text-center">Загрузка...</div>
              ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Название</TableHead>
                          <TableHead>Адрес</TableHead>
                          <TableHead>Телефон</TableHead>
                          <TableHead>Управляющий</TableHead>
                          <TableHead>Сотрудников</TableHead>
                          <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stores.length > 0 ? (
                            stores.map((store) => (
                                <TableRow key={store.id}>
                                  <TableCell className="font-medium">{store.id}</TableCell>
                                  <TableCell>{store.name}</TableCell>
                                  <TableCell>{store.location}</TableCell>
                                  <TableCell>{store.phone}</TableCell>
                                  <TableCell>{store.manager ? store.manager.name : '-'}</TableCell>
                                  <TableCell>{getStoreEmployees(store.id).length}</TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenDetail(store)}>
                                      Подробнее
                                    </Button>
                                  </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center">
                                Данные не найдены
                              </TableCell>
                            </TableRow>
                        )}
                      </TableBody>
                    </Table>
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

        {/* Диалог создания нового магазина */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Добавить новый магазин</DialogTitle>
              <DialogDescription>Заполните информацию о новом магазине</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateStore} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Название
                </Label>
                <Input
                    id="name"
                    name="name"
                    value={newStore.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Адрес
                </Label>
                <Input
                    id="location"
                    name="location"
                    value={newStore.location}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Телефон
                </Label>
                <Input
                    id="phone"
                    name="phone"
                    value={newStore.phone}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="manager_id" className="text-right">
                  Управляющий
                </Label>
                <Select
                    value={newStore.manager_id || 'none'}
                    onValueChange={(value) => setNewStore((prev) => ({ ...prev, manager_id: value === 'none' ? null : value }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Выберите управляющего" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без управляющего</SelectItem>
                    {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name}
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

        {/* Диалог просмотра и редактирования деталей магазина */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="sm:max-w-[800px]">
            {selectedStore && editStore && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <StoreIcon className="mr-2 h-5 w-5" />
                      {selectedStore.name}
                    </DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="details">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="details">Информация</TabsTrigger>
                      <TabsTrigger value="employees">Сотрудники</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4 mt-4">
                      <form onSubmit={handleUpdateStore} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">Основная информация</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <Input
                                      name="location"
                                      value={editStore.location}
                                      onChange={handleEditInputChange}
                                      placeholder="Адрес"
                                      className="flex-1"
                                      required
                                  />
                                </div>
                                <div className="flex items-center space-x-3">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <Input
                                      name="phone"
                                      value={editStore.phone}
                                      onChange={handleEditInputChange}
                                      placeholder="Телефон"
                                      className="flex-1"
                                      required
                                  />
                                </div>
                                <div className="flex items-center space-x-3">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <Select
                                      value={editStore.manager_id ? editStore.manager_id.toString() : 'none'}
                                      onValueChange={(value) =>
                                          setEditStore((prev) => ({ ...prev, manager_id: value === 'none' ? null : value }))
                                      }
                                  >
                                    <SelectTrigger className="flex-1">
                                      <SelectValue placeholder="Выберите управляющего" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">Без управляющего</SelectItem>
                                      {employees.map((employee) => (
                                          <SelectItem key={employee.id} value={employee.id.toString()}>
                                            {employee.name}
                                          </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>Сотрудников: {getStoreEmployees(selectedStore.id).length}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">Статистика</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Гарантийные случаи (открытые):</span>
                                  <span className="font-medium">{selectedStore.openCases || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Гарантийные случаи (закрытые):</span>
                                  <span className="font-medium">{selectedStore.closedCases || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Продано устройств (30 дней):</span>
                                  <span className="font-medium">{selectedStore.devicesSold || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Запчастей в наличии:</span>
                                  <span className="font-medium">{selectedStore.spareParts || 0}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        <Separator />
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" type="submit" disabled={loading}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {loading ? 'Сохранение...' : 'Сохранить изменения'}
                          </Button>
                          <Button variant="destructive" type="button" onClick={handleDeleteStore} disabled={loading}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                          </Button>
                        </div>
                      </form>
                    </TabsContent>

                    <TabsContent value="employees" className="space-y-4 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Сотрудники магазина</h3>
                        <Button disabled={loading}>
                          <Plus className="mr-2 h-4 w-4" />
                          Добавить сотрудника
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>ФИО</TableHead>
                            <TableHead>Должность</TableHead>
                            <TableHead>Телефон</TableHead>
                            <TableHead>Email</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getStoreEmployees(selectedStore.id).map((employee) => (
                              <TableRow key={employee.id}>
                                <TableCell className="font-medium">{employee.id}</TableCell>
                                <TableCell>{employee.name}</TableCell>
                                <TableCell>{employee.position || '-'}</TableCell>
                                <TableCell>{employee.phone || '-'}</TableCell>
                                <TableCell>{employee.email || '-'}</TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  </Tabs>
                </>
            )}
          </DialogContent>
        </Dialog>
      </Layout>
  );
}