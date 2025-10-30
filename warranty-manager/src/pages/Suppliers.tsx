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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  MapPin,
  Phone,
  Plus,
  Users,
  User,
  Pencil,
  Trash2,
  Store as StoreIcon,
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

export default function Suppliers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    contact_person: '',
  });
  const [editSupplier, setEditSupplier] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, [page, searchQuery]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/suppliers', {
        params: {
          page,
          search: searchQuery,
        },
      });
      setSuppliers(response.data.suppliers || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      setError('Ошибка при загрузке поставщиков: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleOpenDetail = (supplier) => {
    setSelectedSupplier(supplier);
    setEditSupplier({ ...supplier });
    setShowDetailDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSupplier((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditSupplier((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/suppliers', newSupplier);
      setShowCreateDialog(false);
      setNewSupplier({ name: '', address: '', phone: '', email: '', contact_person: '' });
      fetchSuppliers();
    } catch (error) {
      setError('Ошибка при создании поставщика: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSupplier = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`/suppliers/${selectedSupplier.id}`, editSupplier);
      setSelectedSupplier(editSupplier);
      setShowDetailDialog(false);
      fetchSuppliers();
    } catch (error) {
      setError('Ошибка при обновлении поставщика: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async () => {
    try {
      setLoading(true);
      await axios.delete(`/suppliers/${selectedSupplier.id}`);
      setShowDetailDialog(false);
      fetchSuppliers();
    } catch (error) {
      setError('Ошибка при удалении поставщика: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Поставщики</h1>
            <p className="text-muted-foreground mt-1">Управление поставщиками и их информацией</p>
          </div>

          {error && <div className="text-red-500 p-2 bg-red-100 rounded">{error}</div>}

          <div className="flex justify-between items-center">
            <SearchInput
                placeholder="Поиск поставщиков..."
                onSearch={handleSearch}
                className="w-[300px]"
            />
            <Button onClick={() => setShowCreateDialog(true)} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить поставщика
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Список поставщиков</CardTitle>
              <CardDescription>Всего поставщиков: {suppliers.length}</CardDescription>
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
                          <TableHead>Контактное лицо</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {suppliers.map((supplier) => (
                            <TableRow key={supplier.id}>
                              <TableCell className="font-medium">{supplier.id}</TableCell>
                              <TableCell>{supplier.name}</TableCell>
                              <TableCell>{supplier.address || '-'}</TableCell>
                              <TableCell>{supplier.phone || '-'}</TableCell>
                              <TableCell>{supplier.contact_person || '-'}</TableCell>
                              <TableCell>{supplier.email || '-'}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleOpenDetail(supplier)}>
                                  Подробнее
                                </Button>
                              </TableCell>
                            </TableRow>
                        ))}
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

        {/* Диалог создания нового поставщика */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Добавить нового поставщика</DialogTitle>
              <DialogDescription>Заполните информацию о новом поставщике</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSupplier} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Название
                </Label>
                <Input
                    id="name"
                    name="name"
                    value={newSupplier.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Адрес
                </Label>
                <Input
                    id="address"
                    name="address"
                    value={newSupplier.address}
                    onChange={handleInputChange}
                    className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Телефон
                </Label>
                <Input
                    id="phone"
                    name="phone"
                    value={newSupplier.phone}
                    onChange={handleInputChange}
                    className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact_person" className="text-right">
                  Контактное лицо
                </Label>
                <Input
                    id="contact_person"
                    name="contact_person"
                    value={newSupplier.contact_person}
                    onChange={handleInputChange}
                    className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newSupplier.email}
                    onChange={handleInputChange}
                    className="col-span-3"
                />
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

        {/* Диалог просмотра и редактирования деталей поставщика */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="sm:max-w-[800px]">
            {selectedSupplier && editSupplier && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <StoreIcon className="mr-2 h-5 w-5" />
                      {selectedSupplier.name}
                    </DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="details">
                    <TabsList className="grid w-full grid-cols-1">
                      <TabsTrigger value="details">Информация</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="space-y-4 mt-4">
                      <form onSubmit={handleUpdateSupplier} className="space-y-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Информация о поставщике</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    name="address"
                                    value={editSupplier.address || ''}
                                    onChange={handleEditInputChange}
                                    placeholder="Адрес"
                                    className="flex-1"
                                />
                              </div>
                              <div className="flex items-center space-x-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    name="phone"
                                    value={editSupplier.phone || ''}
                                    onChange={handleEditInputChange}
                                    placeholder="Телефон"
                                    className="flex-1"
                                />
                              </div>
                              <div className="flex items-center space-x-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    name="contact_person"
                                    value={editSupplier.contact_person || ''}
                                    onChange={handleEditInputChange}
                                    placeholder="Контактное лицо"
                                    className="flex-1"
                                />
                              </div>
                              <div className="flex items-center space-x-3">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    name="email"
                                    type="email"
                                    value={editSupplier.email || ''}
                                    onChange={handleEditInputChange}
                                    placeholder="Email"
                                    className="flex-1"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" type="submit" disabled={loading}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {loading ? 'Сохранение...' : 'Сохранить изменения'}
                          </Button>
                          <Button
                              variant="destructive"
                              type="button"
                              onClick={handleDeleteSupplier}
                              disabled={loading}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                          </Button>
                        </div>
                      </form>
                    </TabsContent>
                  </Tabs>
                </>
            )}
          </DialogContent>
        </Dialog>
      </Layout>
  );
}