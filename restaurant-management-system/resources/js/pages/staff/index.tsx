
import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    roles: string[];
    created_at: string;
}

interface Props {
    users: User[];
    availableRoles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Staff Management', href: '/staff' },
];

export default function StaffIndex({ users, availableRoles }: Props) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const addForm = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: '',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/staff', {
            onSuccess: () => {
                setIsAddOpen(false);
                addForm.reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        editForm.put(`/staff/${editingUser.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                editForm.reset();
                setEditingUser(null);
            },
        });
    };

    const handleDelete = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            router.delete(`/staff/${userToDelete.id}`, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setUserToDelete(null);
                }
            });
        }
    };

    const openEdit = (user: User) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            password: '',
            role: user.roles[0] || '',
        });
        editForm.clearErrors();
        setIsEditOpen(true);
    };

    const openAdd = () => {
        addForm.reset();
        addForm.clearErrors();
        setIsAddOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Management" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Staff Management</h2>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openAdd}>
                                <Plus className="mr-2 h-4 w-4" /> Add Staff
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Staff Member</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={addForm.data.name}
                                        onChange={(e) => addForm.setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={addForm.errors.name} />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={addForm.data.email}
                                        onChange={(e) => addForm.setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={addForm.errors.email} />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={addForm.data.phone}
                                        onChange={(e) => addForm.setData('phone', e.target.value)}
                                    />
                                    <InputError message={addForm.errors.phone} />
                                </div>
                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={addForm.data.password}
                                        onChange={(e) => addForm.setData('password', e.target.value)}
                                        required
                                    />
                                    <InputError message={addForm.errors.password} />
                                </div>
                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={addForm.data.role}
                                        onValueChange={(value) => addForm.setData('role', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableRoles.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={addForm.errors.role} />
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={addForm.processing}>
                                        Create Staff
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {users.map((user) => (
                        <Card key={user.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {user.name}
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(user)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold mb-2">
                                    {user.roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {user.email}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {user.phone || 'No phone'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Joined: {user.created_at}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Staff Member</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={editForm.errors.name} />
                            </div>
                            <div>
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    required
                                />
                                <InputError message={editForm.errors.email} />
                            </div>
                            <div>
                                <Label htmlFor="edit-phone">Phone</Label>
                                <Input
                                    id="edit-phone"
                                    value={editForm.data.phone}
                                    onChange={(e) => editForm.setData('phone', e.target.value)}
                                />
                                <InputError message={editForm.errors.phone} />
                            </div>
                            <div>
                                <Label htmlFor="edit-password">Password (Leave blank to keep current)</Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    value={editForm.data.password}
                                    onChange={(e) => editForm.setData('password', e.target.value)}
                                />
                                <InputError message={editForm.errors.password} />
                            </div>
                            <div>
                                <Label htmlFor="edit-role">Role</Label>
                                <Select
                                    value={editForm.data.role}
                                    onValueChange={(value) => editForm.setData('role', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRoles.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={editForm.errors.role} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    Update Staff
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Staff Member</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
