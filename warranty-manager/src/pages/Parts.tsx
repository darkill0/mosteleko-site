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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Package,
  Pencil,
  Trash2,
  Truck,
} from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const API_URL = 'http://localhost:5000/spare-parts';

// Производители для фильтра
const manufacturers = ['Samsung', 'Apple', 'Xiaomi', 'Huawei', 'Honor', 'Nokia', 'Sony'];

export default function Parts() {
  const [parts, setParts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [newPart, setNewPart] = useState({
    name: '',
    manufacturer: '',
    price: '',
    stock_quantity: '',
  });
  const [editPart, setEditPart] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchParts();
  }, [page, searchQuery, manufacturerFilter, stockFilter]);

  const fetchParts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL, {
        params: {
          page,
          search: searchQuery,
          manufacturer: manufacturerFilter !== 'all' ? manufacturerFilter : undefined,
          stock: stockFilter !== 'all' ? stockFilter : undefined,
        },
      });
      setParts(response.data.spareParts || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      setError('Ошибка при загрузке запчастей: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleOpenDetail = (part) => {
    setSelectedPart(part);
    setEditPart({ ...part });
    setShowDetailDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPart((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditPart((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatePart = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const partData = {
        name: newPart.name,
        manufacturer: newPart.manufacturer,
        price: parseFloat(newPart.price),
        stock_quantity: parseInt(newPart.stock_quantity),
      };
      await axios.post(API_URL, partData);
      setShowCreateDialog(false);
      setNewPart({ name: '', manufacturer: '', price: '', stock_quantity: '' });
      fetchParts();
    } catch (error) {
      setError('Ошибка при создании запчасти: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePart = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const updatedPart = {
        name: editPart.name,
        manufacturer: editPart.manufacturer,
        price: parseFloat(editPart.price),
        stock_quantity: parseInt(editPart.stock_quantity),
      };
      await axios.put(`${API_URL}/${selectedPart.id}`, updatedPart);
      setSelectedPart(editPart);
      setShowDetailDialog(false);
      fetchParts();
    } catch (error) {
      setError('Ошибка при обновлении запчасти: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePart = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`${API_URL}/${selectedPart.id}`);
      setShowDetailDialog(false);
      fetchParts();
    } catch (error) {
      setError('Ошибка при удалении запчасти: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderPart = () => {
    // Здесь можно добавить логику заказа (например, открытие другого диалога)
    alert(`Заказ запчасти: ${selectedPart.name}`);
  };

  const getStockStatus = (part) => {
    if (part.stock_quantity === 0) {
      return <Badge variant="destructive" className="px-2 py-1">Нет в наличии</Badge>;
    } else if (part.stock_quantity <= 5) {
      return (
          <Badge variant="outline" className="px-2 py-1 border-orange-400 text-orange-500">
            Мало
          </Badge>
      );
    } else {
      return (
          <Badge variant="outline" className="px-2 py-1 border-green-400 text-green-500">
            В наличии
          </Badge>
      );
    }
  };

  return (
      <Layout>
        <div className="space-y-6">
          {error && <div className="text-red-500 p-2 bg-red-100 rounded">{error}</div>}

          <div>
            <h1 className="text-3xl font-bold tracking-tight">Запчасти</h1>
            <p className="text-muted-foreground mt-1">Управление запчастями и их наличием</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-2 items-center">
              <SearchInput
                  placeholder="Поиск запчастей..."
                  onSearch={handleSearch}
                  className="w-[300px]"
              />
              <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Производитель" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все производители</SelectItem>
                  {manufacturers.map((manufacturer) => (
                      <SelectItem key={manufacturer} value={manufacturer}>
                        {manufacturer}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Наличие" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все товары</SelectItem>
                  <SelectItem value="normal">В наличии</SelectItem>
                  <SelectItem value="low">Мало на складе</SelectItem>
                  <SelectItem value="out">Нет в наличии</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить запчасть
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Список запчастей</CardTitle>
              <CardDescription>Всего запчастей: {parts.length}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                  <div className="text-center">Загрузка...</div>
              ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Наименование</TableHead>
                          <TableHead>Производитель</TableHead>
                          <TableHead>Цена (₽)</TableHead>
                          <TableHead>Наличие</TableHead>
                          <TableHead>Кол-во</TableHead>
                          <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parts.map((part) => (
                            <TableRow key={part.id}>
                              <TableCell className="font-medium">{part.id}</TableCell>
                              <TableCell>{part.name}</TableCell>
                              <TableCell>{part.manufacturer}</TableCell>
                              <TableCell>{Number(part.price).toLocaleString()} ₽</TableCell>
                              <TableCell>{getStockStatus(part)}</TableCell>
                              <TableCell>{part.stock_quantity}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleOpenDetail(part)}>
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

        {/* Диалог добавления новой запчасти */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Добавить новую запчасть</DialogTitle>
              <DialogDescription>Заполните информацию о новой запчасти</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePart} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Наименование
                </Label>
                <Input
                    id="name"
                    name="name"
                    value={newPart.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="manufacturer" className="text-right">
                  Производитель
                </Label>
                <Select
                    value={newPart.manufacturer}
                    onValueChange={(value) => setNewPart((prev) => ({ ...prev, manufacturer: value }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Выберите производителя" />
                  </SelectTrigger>
                  <SelectContent>
                    {manufacturers.map((manufacturer) => (
                        <SelectItem key={manufacturer} value={manufacturer}>
                          {manufacturer}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Цена (₽)
                </Label>
                <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={newPart.price}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock_quantity" className="text-right">
                  Количество
                </Label>
                <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    value={newPart.stock_quantity}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                />
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowCreateDialog(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Создание...' : 'Создать'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Диалог просмотра и редактирования деталей запчасти */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="sm:max-w-[800px]">
            {selectedPart && editPart && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Package className="mr-2 h-5 w-5" />
                      {selectedPart.name}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpdatePart} className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Основная информация</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">ID:</span>
                              <span className="font-medium">{selectedPart.id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Наименование:</span>
                              <Input
                                  name="name"
                                  value={editPart.name}
                                  onChange={handleEditInputChange}
                                  className="w-2/3"
                                  required
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Производитель:</span>
                              <Select
                                  value={editPart.manufacturer}
                                  onValueChange={(value) =>
                                      setEditPart((prev) => ({ ...prev, manufacturer: value }))
                                  }
                              >
                                <SelectTrigger className="w-2/3">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {manufacturers.map((manufacturer) => (
                                      <SelectItem key={manufacturer} value={manufacturer}>
                                        {manufacturer}
                                      </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Цена (₽):</span>
                              <Input
                                  name="price"
                                  type="number"
                                  step="0.01"
                                  value={editPart.price}
                                  onChange={handleEditInputChange}
                                  className="w-2/3"
                                  required
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Наличие на складе</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Статус:</span>
                              <span>{getStockStatus(editPart)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Количество:</span>
                              <Input
                                  name="stock_quantity"
                                  type="number"
                                  value={editPart.stock_quantity}
                                  onChange={handleEditInputChange}
                                  className="w-2/3"
                                  required
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" type="submit" disabled={isLoading}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                      </Button>
                      <Button
                          variant={editPart.stock_quantity < 5 ? 'default' : 'outline'}
                          type="button"
                          onClick={handleOrderPart}
                          disabled={isLoading}
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Заказать
                      </Button>
                      <Button
                          variant="destructive"
                          type="button"
                          onClick={handleDeletePart}
                          disabled={isLoading}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Удалить
                      </Button>
                    </div>
                  </form>
                </>
            )}
          </DialogContent>
        </Dialog>
      </Layout>
  );
}