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

// Barra superior tipo menú principal (similar a la captura de Odoo)
function DashboardTopBar({ user, onLogout, activeSection, onChangeSection }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo">
          <span className="topbar-logo-text">FA</span>
        </div>
      </div>

      <nav className="topbar-center">
        <button
          type="button"
          className={
            activeSection === 'aplicaciones'
              ? 'topbar-link topbar-link-active'
              : 'topbar-link'
          }
          onClick={() => onChangeSection('aplicaciones')}
        >
          Aplicaciones
        </button>
        <button
          type="button"
          className={
            activeSection === 'industrias'
              ? 'topbar-link topbar-link-active'
              : 'topbar-link'
          }
          onClick={() => onChangeSection('industrias')}
        >
          Industrias
        </button>
        <button
          type="button"
          className={
            activeSection === 'empresas'
              ? 'topbar-link topbar-link-active'
              : 'topbar-link'
          }
          onClick={() => onChangeSection('empresas')}
        >
          Empresas
        </button>
        <button
          type="button"
          className={
            activeSection === 'precios'
              ? 'topbar-link topbar-link-active'
              : 'topbar-link'
          }
          onClick={() => onChangeSection('precios')}
        >
          Precios
        </button>
        <button
          type="button"
          className={
            activeSection === 'ayuda'
              ? 'topbar-link topbar-link-active'
              : 'topbar-link'
          }
          onClick={() => onChangeSection('ayuda')}
        >
          Ayuda
        </button>
      </nav>

      <div className="topbar-right">
        <span className="topbar-user-label">
          {user?.name || user?.email || 'Usuario'}
        </span>
        <button type="button" className="topbar-cta" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}

function Dashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('aplicaciones')

  const sections = {
    aplicaciones: {
      title: 'Panel principal',
      description:
        'Aquí verás un resumen general de tus módulos de finanzas, contabilidad y otros componentes clave del sistema.',
    },
    industrias: {
      title: 'Industrias',
      description:
        'Sección pensada para configurar verticales de negocio, plantillas y buenas prácticas por industria.',
    },
    empresas: {
      title: 'Empresas',
      description:
        'Aquí podrás administrar las distintas empresas o razones sociales con las que trabajas dentro del sistema.',
    },
    precios: {
      title: 'Precios y planes',
      description:
        'Aquí podrás definir planes de facturación, versiones del sistema y límites por tipo de suscripción.',
    },
    ayuda: {
      title: 'Centro de ayuda',
      description:
        'Documentación, preguntas frecuentes y guías rápidas para los usuarios de tu sistema contable.',
    },
  }

  const current = sections[activeSection]

  return (
    <>
      <DashboardTopBar
        user={user}
        onLogout={onLogout}
        activeSection={activeSection}
        onChangeSection={setActiveSection}
      />

      <div className="dashboard">
        <main className="dashboard-main">
          <section className="dashboard-card">
            <h2>{current.title}</h2>
            <p>{current.description}</p>
          </section>
        </main>
      </div>
    </>
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

  const rootClassName = user ? 'app-root app-root-dashboard' : 'app-root'

  return (
    <div className={rootClassName}>
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
