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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Phone, Plus, Mail, Pencil, User } from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

axios.defaults.baseURL = 'http://localhost:5000';

export default function Employees() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [stores, setStores] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        position: '',
        phone: '',
        email: '',
        store_id: '',
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEmployees();
        fetchStores();
    }, [page, searchQuery]);

    // Получение списка сотрудников
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/employees', {
                params: {
                    page,
                    search: searchQuery,
                },
            });
            // Assuming the response is { employees: [], totalPages: 1 }
            setEmployees(response.data || []);
            console.log(response.data);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            setError('Ошибка при загрузке сотрудников: ' + error.message);
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    // Получение списка магазинов
    const fetchStores = async () => {
        try {
            const response = await axios.get('/stores', {
                params: { page: 1 }, // Fetch first page; adjust if pagination differs
            });
            // Assuming the response is { stores: [], totalPages: 1 }
            setStores(response.data.stores || response.data || []);
            console.log(response.data)
        } catch (error) {
            setError('Ошибка при загрузке магазинов: ' + error.message);
            console.error('Error fetching stores:', error);
        }
    };

    // Обработчик поиска
    const handleSearch = (value) => {
        setSearchQuery(value);
        setPage(1);
    };

    // Изменение данных нового сотрудника
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee((prev) => ({ ...prev, [name]: value }));
    };

    // Изменение магазина в селекте
    const handleStoreChange = (value) => {
        setNewEmployee((prev) => ({ ...prev, store_id: value === 'none' ? null : value }));
    };

    // Создание нового сотрудника
    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const employeeData = {
                ...newEmployee,
                store_id: newEmployee.store_id || null, // Ensure null if no store selected
            };
            await axios.post('/employees', employeeData);
            setShowCreateDialog(false);
            setNewEmployee({ name: '', position: '', phone: '', email: '', store_id: '' });
            fetchEmployees();
        } catch (error) {
            setError('Ошибка при создании сотрудника: ' + error.message);
            console.error('Error creating employee:', error);
        } finally {
            setLoading(false);
        }
    };

    // Открытие диалога редактирования
    const handleEditEmployee = (employee) => {
        setSelectedEmployee(employee);
        setNewEmployee({
            name: employee.name,
            position: employee.position,
            phone: employee.phone || '',
            email: employee.email || '',
            store_id: employee.store_id ? employee.store_id.toString() : '',
        });
        setShowEditDialog(true);
    };

    // Обновление сотрудника
    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const employeeData = {
                ...newEmployee,
                store_id: newEmployee.store_id || null, // Ensure null if no store selected
            };
            await axios.put(`/employees/${selectedEmployee.id}`, employeeData);
            setShowEditDialog(false);
            fetchEmployees();
        } catch (error) {
            setError('Ошибка при обновлении сотрудника: ' + error.message);
            console.error('Error updating employee:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Сотрудники</h1>
                    <p className="text-muted-foreground mt-1">Управление сотрудниками компании</p>
                </div>

                {error && <div className="text-red-500 p-2 bg-red-100 rounded">{error}</div>}

                <div className="flex justify-between items-center">
                    <SearchInput
                        placeholder="Поиск сотрудников..."
                        onSearch={handleSearch}
                        className="w-[300px]"
                    />
                    <Button onClick={() => setShowCreateDialog(true)} disabled={loading}>
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить сотрудника
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Список сотрудников</CardTitle>
                        <CardDescription>Всего сотрудников: {employees.length}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div>Загрузка...</div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>ФИО</TableHead>
                                            <TableHead>Должность</TableHead>
                                            <TableHead>Телефон</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Магазин</TableHead>
                                            <TableHead>Действия</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employees.length > 0 ? (
                                            employees.map((employee) => (
                                                <TableRow key={employee.id}>
                                                    <TableCell className="font-medium">{employee.id}</TableCell>
                                                    <TableCell>{employee.name}</TableCell>
                                                    <TableCell>{employee.position}</TableCell>
                                                    <TableCell>{employee.phone || '-'}</TableCell>
                                                    <TableCell>{employee.email || '-'}</TableCell>
                                                    <TableCell>
                                                        {stores.length > 0 && employee.store_id
                                                            ? stores.find((store) => store.id === employee.store_id)?.name || '-'
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditEmployee(employee)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center">
                                                    Сотрудники не найдены
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

            {/* Диалог создания нового сотрудника */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Добавить нового сотрудника</DialogTitle>
                        <DialogDescription>Заполните информацию о новом сотруднике</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateEmployee} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                ФИО
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={newEmployee.name}
                                onChange={handleInputChange}
                                className="col-span-3"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="position" className="text-right">
                                Должность
                            </Label>
                            <Input
                                id="position"
                                name="position"
                                value={newEmployee.position}
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
                                value={newEmployee.phone}
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
                                value={newEmployee.email}
                                onChange={handleInputChange}
                                className="col-span-3"
                                type="email"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="store_id" className="text-right">
                                Магазин
                            </Label>
                            <Select onValueChange={handleStoreChange} value={newEmployee.store_id || 'none'}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Выберите магазин" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Без магазина</SelectItem>
                                    {stores.map((store) => (
                                        <SelectItem key={store.id} value={store.id.toString()}>
                                            {store.name}
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

            {/* Диалог редактирования сотрудника */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Редактировать сотрудника</DialogTitle>
                        <DialogDescription>Обновите информацию о сотруднике</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdateEmployee} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                ФИО
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={newEmployee.name}
                                onChange={handleInputChange}
                                className="col-span-3"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="position" className="text-right">
                                Должность
                            </Label>
                            <Input
                                id="position"
                                name="position"
                                value={newEmployee.position}
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
                                value={newEmployee.phone}
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
                                value={newEmployee.email}
                                onChange={handleInputChange}
                                className="col-span-3"
                                type="email"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="store_id" className="text-right">
                                Магазин
                            </Label>
                            <Select onValueChange={handleStoreChange} value={newEmployee.store_id || 'none'}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Выберите магазин" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Без магазина</SelectItem>
                                    {stores.map((store) => (
                                        <SelectItem key={store.id} value={store.id.toString()}>
                                            {store.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
        </Layout>
    );
}