
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Shield, User, Bell, Globe, Database, Key, Lock, Paintbrush } from "lucide-react";

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [theme, setTheme] = useState("system");
  
  const handleSaveGeneral = () => {
    // Сохранение общих настроек
    console.log("Сохранение общих настроек");
  };
  
  const handleSaveNotifications = () => {
    // Сохранение настроек уведомлений
    console.log("Сохранение настроек уведомлений");
  };
  
  const handleSaveAppearance = () => {
    // Сохранение настроек внешнего вида
    console.log("Сохранение настроек внешнего вида");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
          <p className="text-muted-foreground mt-1">
            Управление настройками системы
          </p>
        </div>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit">
            <TabsTrigger value="general">Общие</TabsTrigger>
            <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            <TabsTrigger value="appearance">Внешний вид</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Основные настройки
                </CardTitle>
                <CardDescription>
                  Настройка основных параметров системы гарантийного обслуживания
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Название компании</Label>
                    <Input id="company-name" defaultValue="Tele2 Warranty" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Контактный email</Label>
                    <Input id="contact-email" defaultValue="support@tele2warranty.ru" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-phone">Телефон поддержки</Label>
                    <Input id="support-phone" defaultValue="+7 (800) 123-45-67" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-language">Язык системы по умолчанию</Label>
                    <Select defaultValue="ru">
                      <SelectTrigger id="default-language">
                        <SelectValue placeholder="Выберите язык" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ru">Русский</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Настройки гарантийных случаев</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="warranty-period">Стандартный гарантийный период (дней)</Label>
                      <Input id="warranty-period" type="number" defaultValue="365" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="repair-deadline">Срок выполнения ремонта (дней)</Label>
                      <Input id="repair-deadline" type="number" defaultValue="14" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveGeneral}>Сохранить изменения</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Подключение к базе данных
                </CardTitle>
                <CardDescription>
                  Настройки соединения с базой данных warranty_service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="db-host">Хост</Label>
                    <Input id="db-host" defaultValue="localhost" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="db-port">Порт</Label>
                    <Input id="db-port" defaultValue="3306" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="db-name">Название базы данных</Label>
                    <Input id="db-name" defaultValue="warranty_service" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="db-user">Пользователь</Label>
                    <Input id="db-user" defaultValue="admin" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="db-password">Пароль</Label>
                    <Input id="db-password" type="password" value="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="db-connection-limit">Лимит соединений</Label>
                    <Input id="db-connection-limit" type="number" defaultValue="10" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Проверить соединение</Button>
                <Button>Сохранить изменения</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Профиль пользователя
                </CardTitle>
                <CardDescription>
                  Управление данными вашего профиля
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">Имя пользователя</Label>
                    <Input id="username" defaultValue="admin" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Полное имя</Label>
                    <Input id="full-name" defaultValue="Администратор Системы" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue="admin@tele2warranty.ru" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input id="phone" defaultValue="+7 (999) 123-45-67" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Сохранить изменения</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Безопасность
                </CardTitle>
                <CardDescription>
                  Настройка параметров безопасности вашей учетной записи
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Изменение пароля</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Текущий пароль</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Новый пароль</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Подтверждение пароля</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Двухфакторная аутентификация</h3>
                  <div className="flex items-center space-x-2">
                    <Switch id="2fa" />
                    <Label htmlFor="2fa">Включить двухфакторную аутентификацию</Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Сохранить изменения</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Настройки уведомлений
                </CardTitle>
                <CardDescription>
                  Управление уведомлениями в системе
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="notifications-enabled"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                  <Label htmlFor="notifications-enabled">Включить уведомления</Label>
                </div>
                
                {notificationsEnabled && (
                  <>
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Каналы уведомлений</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="email-notifications"
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                          />
                          <Label htmlFor="email-notifications">Email уведомления</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="sms-notifications"
                            checked={smsNotifications}
                            onCheckedChange={setSmsNotifications}
                          />
                          <Label htmlFor="sms-notifications">SMS уведомления</Label>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Типы уведомлений</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Switch id="new-case-notifications" defaultChecked />
                          <Label htmlFor="new-case-notifications">Новые гарантийные случаи</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="status-update-notifications" defaultChecked />
                          <Label htmlFor="status-update-notifications">Обновление статуса ремонта</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="parts-low-stock-notifications" defaultChecked />
                          <Label htmlFor="parts-low-stock-notifications">Низкий запас запчастей</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="customer-notifications" defaultChecked />
                          <Label htmlFor="customer-notifications">Уведомления клиентов</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="assignment-notifications" defaultChecked />
                          <Label htmlFor="assignment-notifications">Назначение задач</Label>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveNotifications}>Сохранить изменения</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paintbrush className="h-5 w-5" />
                  Внешний вид
                </CardTitle>
                <CardDescription>
                  Настройка внешнего вида интерфейса
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Тема</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Button 
                      variant={theme === "light" ? "default" : "outline"} 
                      className="w-full justify-start"
                      onClick={() => setTheme("light")}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
                        <circle cx="12" cy="12" r="5" fill="currentColor" />
                      </svg>
                      Светлая
                    </Button>
                    <Button 
                      variant={theme === "dark" ? "default" : "outline"} 
                      className="w-full justify-start"
                      onClick={() => setTheme("dark")}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="currentColor" />
                        <circle cx="12" cy="12" r="5" fill="white" />
                      </svg>
                      Темная
                    </Button>
                    <Button 
                      variant={theme === "system" ? "default" : "outline"} 
                      className="w-full justify-start"
                      onClick={() => setTheme("system")}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" strokeWidth="2" />
                        <path d="M12 2V6" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 18V22" stroke="currentColor" strokeWidth="2" />
                        <path d="M2 12H6" stroke="currentColor" strokeWidth="2" />
                        <path d="M18 12H22" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      Системная
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Элементы интерфейса</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch id="sidebar-compact" />
                      <Label htmlFor="sidebar-compact">Компактная боковая панель по умолчанию</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="animations-enabled" defaultChecked />
                      <Label htmlFor="animations-enabled">Включить анимации</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="show-tooltips" defaultChecked />
                      <Label htmlFor="show-tooltips">Показывать подсказки</Label>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Таблицы и списки</h3>
                  <div className="space-y-2">
                    <Label htmlFor="items-per-page">Элементов на странице</Label>
                    <Select defaultValue="10">
                      <SelectTrigger id="items-per-page">
                        <SelectValue placeholder="Выберите количество" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveAppearance}>Сохранить изменения</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
