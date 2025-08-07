import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Building, Mail, Lock, Phone, MapPin, Loader2 } from 'lucide-react';
import { empleadoSchema, type EmpleadoFormData } from '@/lib/validations/empleado';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function FormCreateEmpleado2() {
    const [loading, setLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const form = useForm<EmpleadoFormData>({
        resolver: zodResolver(empleadoSchema),
        defaultValues: {
            tipoEmpleado: 'RECLUTADOR',
            esNuevaEmpresa: false,
            nombre: '',
            apellido: '',
            telefono: '',
            direccion: '',
            email: '',
            password: '',
            confirmPassword: '',
            cargo: '',
            empresaId: '',
            nombreEmpresa: '',
            descripcionEmpresa: '',
            ubicacionEmpresa: '',
        },
        mode: 'onChange'
    });

    // Observar valores del formulario
    const tipoEmpleado = form.watch('tipoEmpleado');
    const esNuevaEmpresa = form.watch('esNuevaEmpresa');

    const onSubmit = async (data: EmpleadoFormData) => {
        setLoading(true);
        setSubmitMessage(null);

        try {
            const response = await fetch('/api/empleados/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                setSubmitMessage({
                    type: 'success',
                    message: 'Empleado registrado exitosamente'
                });
                form.reset();
            } else {
                setSubmitMessage({
                    type: 'error',
                    message: result.message || 'Error al registrar empleado'
                });
            }
        } catch (error) {
            setSubmitMessage({
                type: 'error',
                message: 'Error de conexión. Intenta nuevamente.'
            });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
                    <div className="max-w-4xl mx-auto">
                        <Card className="shadow-xl border-0">
                            <CardHeader className="text-center pb-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                                <CardTitle className="text-3xl font-bold">Registro de Empleado</CardTitle>
                                <CardDescription className="text-blue-100 text-lg">
                                    Crear cuenta para reclutador o administrador del sistema
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-8">
                                {submitMessage && (
                                    <Alert className={`mb-6 ${submitMessage.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                        <AlertDescription className={submitMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                                            {submitMessage.message}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <Form {...form}>
                                    <div className="space-y-8">

                                        {/* Datos Personales */}
                                        <Card className="border-l-4 border-l-blue-500">
                                            <CardHeader className="pb-4">
                                                <CardTitle className="flex items-center text-xl">
                                                    <User className="mr-2 text-blue-600" size={24} />
                                                    Datos Personales
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="nombre"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-medium">Nombre *</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Juan"
                                                                        className="h-11"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="apellido"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-medium">Apellido *</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Pérez"
                                                                        className="h-11"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="telefono"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center text-base font-medium">
                                                                    <Phone className="mr-1" size={16} />
                                                                    Teléfono
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="+504 9999-9999"
                                                                        className="h-11"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="direccion"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center text-base font-medium">
                                                                    <MapPin className="mr-1" size={16} />
                                                                    Dirección
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Col. Palmira, Tegucigalpa"
                                                                        className="h-11"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Datos de Cuenta */}
                                        <Card className="border-l-4 border-l-green-500">
                                            <CardHeader className="pb-4">
                                                <CardTitle className="flex items-center text-xl">
                                                    <Mail className="mr-2 text-green-600" size={24} />
                                                    Datos de Cuenta
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base font-medium">Email *</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="email"
                                                                    placeholder="juan@empresa.com"
                                                                    className="h-11"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="password"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center text-base font-medium">
                                                                    <Lock className="mr-1" size={16} />
                                                                    Contraseña *
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="password"
                                                                        placeholder="Mínimo 6 caracteres"
                                                                        className="h-11"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="confirmPassword"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center text-base font-medium">
                                                                    <Lock className="mr-1" size={16} />
                                                                    Confirmar Contraseña *
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="password"
                                                                        placeholder="Repetir contraseña"
                                                                        className="h-11"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Datos del Empleado */}
                                        <Card className="border-l-4 border-l-purple-500">
                                            <CardHeader className="pb-4">
                                                <CardTitle className="flex items-center text-xl">
                                                    <Building className="mr-2 text-purple-600" size={24} />
                                                    Datos del Empleado
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="cargo"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-medium">Cargo *</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Gerente de RRHH"
                                                                        className="h-11"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="tipoEmpleado"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-medium">Tipo de Empleado *</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-11">
                                                                            <SelectValue placeholder="Seleccionar tipo" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="RECLUTADOR">
                                                                            <div className="flex items-center">
                                                                                <User className="mr-2" size={16} />
                                                                                Reclutador
                                                                            </div>
                                                                        </SelectItem>
                                                                        <SelectItem value="ADMIN_EMPRESA">
                                                                            <div className="flex items-center">
                                                                                <Building className="mr-2" size={16} />
                                                                                Admin de Empresa
                                                                            </div>
                                                                        </SelectItem>
                                                                        <SelectItem value="ADMIN_SISTEMA">
                                                                            <div className="flex items-center">
                                                                                <Lock className="mr-2" size={16} />
                                                                                Admin del Sistema
                                                                            </div>
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                {/* Sección de Empresa */}
                                                {tipoEmpleado !== 'ADMIN_SISTEMA' && (
                                                    <Card className="bg-slate-50 border-dashed">
                                                        <CardHeader className="pb-4">
                                                            <CardTitle className="text-lg">Información de la Empresa</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <FormField
                                                                control={form.control}
                                                                name="esNuevaEmpresa"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <RadioGroup
                                                                                onValueChange={(value) => field.onChange(value === 'true')}
                                                                                value={field.value ? 'true' : 'false'}
                                                                                className="flex items-center space-x-6"
                                                                            >
                                                                                <div className="flex items-center space-x-2">
                                                                                    <RadioGroupItem value="false" id="empresa-existente" />
                                                                                    <FormLabel htmlFor="empresa-existente" className="cursor-pointer">
                                                                                        Empresa Existente
                                                                                    </FormLabel>
                                                                                </div>
                                                                                <div className="flex items-center space-x-2">
                                                                                    <RadioGroupItem value="true" id="empresa-nueva" />
                                                                                    <FormLabel htmlFor="empresa-nueva" className="cursor-pointer">
                                                                                        Nueva Empresa
                                                                                    </FormLabel>
                                                                                </div>
                                                                            </RadioGroup>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            {esNuevaEmpresa ? (
                                                                <div className="space-y-4">
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="nombreEmpresa"
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className="text-base font-medium">Nombre de la Empresa *</FormLabel>
                                                                                <FormControl>
                                                                                    <Input
                                                                                        placeholder="Tech Solutions SA"
                                                                                        className="h-11"
                                                                                        {...field}
                                                                                    />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />

                                                                    <FormField
                                                                        control={form.control}
                                                                        name="descripcionEmpresa"
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className="text-base font-medium">Descripción de la Empresa</FormLabel>
                                                                                <FormControl>
                                                                                    <Textarea
                                                                                        placeholder="Empresa dedicada a..."
                                                                                        className="min-h-[100px]"
                                                                                        {...field}
                                                                                    />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />

                                                                    <FormField
                                                                        control={form.control}
                                                                        name="ubicacionEmpresa"
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className="text-base font-medium">Ubicación de la Empresa</FormLabel>
                                                                                <FormControl>
                                                                                    <Input
                                                                                        placeholder="Tegucigalpa, Honduras"
                                                                                        className="h-11"
                                                                                        {...field}
                                                                                    />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <FormField
                                                                    control={form.control}
                                                                    name="empresaId"
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel className="text-base font-medium">Seleccionar Empresa *</FormLabel>
                                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                                <FormControl>
                                                                                    <SelectTrigger className="h-11">
                                                                                        <SelectValue placeholder="Seleccionar empresa..." />
                                                                                    </SelectTrigger>
                                                                                </FormControl>
                                                                                <SelectContent>
                                                                                    <SelectItem value="empresa1">Tech Solutions SA</SelectItem>
                                                                                    <SelectItem value="empresa2">Comercial López</SelectItem>
                                                                                    <SelectItem value="empresa3">Banco del País</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Botón Submit */}
                                        <div className="flex justify-center pt-6">
                                            <Button
                                                onClick={form.handleSubmit(onSubmit)}
                                                disabled={loading || !form.formState.isValid}
                                                size="lg"
                                                className="w-full md:w-auto min-w-[200px] h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        Registrando...
                                                    </>
                                                ) : (
                                                    'Registrar Empleado'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>

    );
};