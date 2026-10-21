import { useEffect, useState, type FormEvent } from 'react';
import { organizationApi, type OrganizationSettings } from '../../api/organization.api';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Button, Input } from '../../components/ui';

export function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    organizationApi.getCurrent().then(setSettings).catch(() => setError('No fue posible cargar los datos del taller.')).finally(() => setLoading(false));
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const form = new FormData(event.currentTarget);
      const updated = await organizationApi.updateCurrent({
        name: String(form.get('name') ?? ''), taxId: String(form.get('taxId') ?? '') || null,
        email: String(form.get('email') ?? '') || null, phone: String(form.get('phone') ?? '') || null,
        address: String(form.get('address') ?? '') || null, city: String(form.get('city') ?? '') || null,
        country: String(form.get('country') ?? 'CL'),
      });
      setSettings(updated); setMessage('Datos del taller guardados.');
    } catch {
      setError('No se pudieron guardar los cambios. Revisa los datos e inténtalo de nuevo.');
    } finally { setSaving(false); }
  }

  async function logoutOtherSessions() {
    setMessage(''); setError('');
    try {
      await apiRequest<{ revoked: number }>('/auth/sessions/revoke-others', { method: 'POST' });
      setMessage('Se cerraron las demás sesiones de tu cuenta.');
    } catch { setError('No se pudieron cerrar las demás sesiones.'); }
  }

  if (loading) return <div className="rounded-xl border bg-white p-6 text-sm text-slate-500">Cargando configuración…</div>;
  if (!settings) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>;

  return <div className="max-w-3xl space-y-6">
    <div><h1 className="text-2xl font-bold text-slate-950">Configuración</h1><p className="mt-1 text-sm text-slate-500">Administra la información de contacto y el acceso del taller.</p></div>
    {message && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}
    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
    <form onSubmit={save} className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
      <div><h2 className="font-semibold text-slate-900">Datos del taller</h2><p className="mt-1 text-sm text-slate-500">Estos datos identifican el negocio en sus documentos y comunicaciones.</p></div>
      <Input id="name" name="name" label="Nombre del taller" required maxLength={150} defaultValue={settings.name} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="taxId" name="taxId" label="RUT / identificación tributaria" maxLength={30} defaultValue={settings.taxId ?? ''} />
        <Input id="email" name="email" type="email" label="Correo del taller" maxLength={254} defaultValue={settings.email ?? ''} />
        <Input id="phone" name="phone" label="Teléfono" maxLength={40} defaultValue={settings.phone ?? ''} />
        <Input id="city" name="city" label="Comuna / ciudad" maxLength={100} defaultValue={settings.city ?? ''} />
      </div>
      <Input id="address" name="address" label="Dirección" maxLength={200} defaultValue={settings.address ?? ''} />
      <Input id="country" name="country" label="Código de país" maxLength={2} defaultValue={settings.country} />
      <p className="text-xs text-slate-500">Identificador interno: {settings.slug}</p>
      <Button type="submit" disabled={saving || !['OWNER', 'ADMIN'].includes(user?.role ?? '')}>{saving ? 'Guardando…' : 'Guardar cambios'}</Button>
      {!['OWNER', 'ADMIN'].includes(user?.role ?? '') && <p className="text-sm text-slate-500">Solo un propietario o administrador puede cambiar estos datos.</p>}
    </form>
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-slate-900">Seguridad de la cuenta</h2><p className="mt-1 text-sm text-slate-500">Cierra las sesiones activas en otros dispositivos. Esta sesión seguirá abierta.</p>
      <Button className="mt-4" variant="secondary" onClick={logoutOtherSessions}>Cerrar otras sesiones</Button>
    </section>
  </div>;
}
