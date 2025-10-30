import { useState, useEffect } from "react";
import axios from "axios";
import { Layout } from "@/components/Layout";
import { SearchInput } from "@/components/SearchInput";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit } from "lucide-react";

axios.defaults.baseURL = "http://localhost:5000";

export default function Users() {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [users, setUsers] = useState([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newUser, setNewUser] = useState({ login: "", password: "", role: "Менеджер" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, searchQuery]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/users", {
                params: { role: roleFilter !== "all" ? roleFilter : undefined },
            });
            setUsers(response.data.users || []);
        } catch (error) {
            setError("Ошибка при загрузке пользователей: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearchQuery(value);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await axios.post("/users", newUser);
            setShowCreateDialog(false);
            setNewUser({ login: "", password: "", role: "Менеджер" });
            fetchUsers();
        } catch (error) {
            setError("Ошибка при создании пользователя: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await axios.put(`/users/${selectedUser.id}`, { login: newUser.login, role: newUser.role });
            setShowEditDialog(false);
            fetchUsers();
        } catch (error) {
            setError("Ошибка при обновлении пользователя: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            setLoading(true);
            await axios.delete(`/users/${userId}`);
            fetchUsers();
        } catch (error) {
            setError("Ошибка при удалении пользователя: " + error.message);
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
                        <h1 className="text-3xl font-bold tracking-tight">Пользователи</h1>
                        <p className="text-muted-foreground mt-1">Управление учетными записями</p>
                    </div>
                    <Button onClick={() => setShowCreateDialog(true)} disabled={loading}>
                        <Plus className="mr-2 h-4 w-4" /> Добавить пользователя
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="w-full sm:w-auto flex-1">
                        <SearchInput placeholder="Поиск по логину..." onSearch={handleSearch} className="w-full" />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Фильтр по роли" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все роли</SelectItem>
                            <SelectItem value="Менеджер">Менеджер</SelectItem>
                            <SelectItem value="Администратор">Администратор</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Список пользователей</CardTitle>
                        <CardDescription>Всего пользователей: {users.length}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center">Загрузка...</div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Логин</TableHead>
                                            <TableHead>Роль</TableHead>
                                            <TableHead>Дата создания</TableHead>
                                            <TableHead className="text-right">Действия</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.login}</TableCell>
                                                <TableCell>{user.role}</TableCell>
                                                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setShowEditDialog(true); }}>
                                                        <Edit className="mr-2 h-4 w-4" /> Редактировать
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Удалить
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Диалог создания пользователя */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Создание пользователя</DialogTitle>
                        <DialogDescription>Введите данные нового пользователя</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser}>
                        <Label>Логин</Label>
                        <Input type="text" required value={newUser.login} onChange={(e) => setNewUser({ ...newUser, login: e.target.value })} />
                        <Label>Пароль</Label>
                        <Input type="password" required value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                        <DialogFooter>
                            <Button type="submit">Создать</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}
