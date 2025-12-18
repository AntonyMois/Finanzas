import './App.css'
import { useEffect, useState } from 'react'

function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [mode, setMode] = useState('login') // 'login' | 'register'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'

      const body =
        mode === 'login'
          ? { email, password }
          : { email, password, name }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // enviar/recibir cookies
        body: JSON.stringify(body),
      })

      let data
      try {
        data = await res.json()
      } catch {
        throw new Error(
          'No se pudo leer la respuesta del servidor. Verifica que el backend esté encendido y accesible.',
        )
      }

      if (!res.ok) {
        throw new Error(data.message || 'Error al iniciar sesión')
      }

      onLoginSuccess(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Bienvenido a tus finanzas awebo</h1>
      <p className="subtitle">
        {mode === 'login'
          ? 'Inicia sesión para continuar'
          : 'Crea tu usuario para empezar a trabajar'}
      </p>
      <form onSubmit={handleSubmit} className="auth-form">
        {mode === 'register' && (
          <label>
            Nombre
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
            />
          </label>
        )}
        <label>
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tucorreo@empresa.com"
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </label>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading
            ? mode === 'login'
              ? 'Ingresando...'
              : 'Creando usuario...'
            : mode === 'login'
              ? 'Iniciar sesión'
              : 'Crear cuenta'}
        </button>
      </form>
      <div className="auth-footer">
        {mode === 'login' ? (
          <span>
            ¿No tienes usuario?{' '}
            <button
              type="button"
              className="auth-link"
              onClick={() => {
                setMode('register')
                setError('')
              }}
            >
              Crear cuenta
            </button>
          </span>
        ) : (
          <span>
            ¿Ya tienes usuario?{' '}
            <button
              type="button"
              className="auth-link"
              onClick={() => {
                setMode('login')
                setError('')
              }}
            >
              Inicia sesión
            </button>
          </span>
        )}
      </div>
    </div>
  )
}

function Dashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('finanzas')

  const sections = {
    perfil: {
      title: 'Perfil del usuario',
      description:
        'Aquí podrás ver y editar los datos básicos del usuario, cambiar contraseña y configurar la autenticación en dos pasos.',
    },
    finanzas: {
      title: 'Módulo de finanzas',
      description:
        'Espacio pensado para el flujo de caja, bancos, cuentas por cobrar y pagar, y reportes financieros de alto nivel.',
    },
    contabilidad: {
      title: 'Módulo de contabilidad',
      description:
        'Aquí se centralizarán las pólizas contables, catálogo de cuentas, auxiliares y conciliaciones contables de producción.',
    },
    otros: {
      title: 'Otros módulos',
      description:
        'Zona para integraciones futuras: inventario avanzado, producción, costos estándar, indicadores y más.',
    },
  }

  const current = sections[activeSection]

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="dashboard-logo">
            <span className="dashboard-logo-initials">FA</span>
          </div>
          <div>
            <h1>Panel principal</h1>
            <p>
              Bienvenido, <strong>{user?.name || user?.email}</strong>
            </p>
          </div>
        </div>

        <div className="dashboard-header-right">
          <nav className="dashboard-nav">
            <button
              type="button"
              className={
                activeSection === 'perfil'
                  ? 'dashboard-nav-item dashboard-nav-item-active'
                  : 'dashboard-nav-item'
              }
              onClick={() => setActiveSection('perfil')}
            >
              Perfil
            </button>
            <button
              type="button"
              className={
                activeSection === 'finanzas'
                  ? 'dashboard-nav-item dashboard-nav-item-active'
                  : 'dashboard-nav-item'
              }
              onClick={() => setActiveSection('finanzas')}
            >
              Finanzas
            </button>
            <button
              type="button"
              className={
                activeSection === 'contabilidad'
                  ? 'dashboard-nav-item dashboard-nav-item-active'
                  : 'dashboard-nav-item'
              }
              onClick={() => setActiveSection('contabilidad')}
            >
              Contabilidad
            </button>
            <button
              type="button"
              className={
                activeSection === 'otros'
                  ? 'dashboard-nav-item dashboard-nav-item-active'
                  : 'dashboard-nav-item'
              }
              onClick={() => setActiveSection('otros')}
            >
              Otros
            </button>
          </nav>

          <button className="logout" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-card">
          <h2>{current.title}</h2>
          <p>{current.description}</p>
        </section>
      </main>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)

  // Comprobar si ya hay sesión iniciada (cookie HTTP-only)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (err) {
        console.error('Error comprobando sesión:', err)
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.error('Error en logout:', err)
    } finally {
      setUser(null)
    }
  }

  return (
    <div className="app-root">
      {checkingSession ? (
        <div className="loading">Verificando sesión...</div>
      ) : user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <LoginForm onLoginSuccess={setUser} />
      )}
    </div>
  )
}

export default App
