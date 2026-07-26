"use client";

import { useEffect, useMemo, useState } from "react";

type Agreement = {
  id: string;
  text: string;
  confirmed: boolean;
};

type Settings = {
  hourlyRate: number;
  weeklyHours: number;
  sprintWeeks: number;
  marciaFee: string;
  marciaInMultiProject: boolean;
};

const defaultSettings: Settings = {
  hourlyRate: 1,
  weeklyHours: 44,
  sprintWeeks: 4,
  marciaFee: "",
  marciaInMultiProject: true,
};

const defaultAgreements: Agreement[] = [
  {
    id: "cap",
    text: "¿El tope aplica por proyecto y por sprint de cuatro semanas?",
    confirmed: false,
  },
  {
    id: "second-project",
    text: "¿Un segundo proyecto habilita un segundo tope y un equipo adicional?",
    confirmed: false,
  },
  {
    id: "marcia-separate",
    text: "¿Marcia se paga como un fijo mensual separado del tope de los proyectos?",
    confirmed: false,
  },
  {
    id: "marcia-includes",
    text: "¿Qué incluye ese fijo: remuneración, cargas, administración, riesgo y margen?",
    confirmed: false,
  },
  {
    id: "leadership",
    text: "¿Cómo se reconoce el liderazgo transversal cuando existan dos proyectos simultáneos?",
    confirmed: false,
  },
  {
    id: "backlog",
    text: "¿Cuántos proyectos y qué entregables cubrirá el backlog de Marcia?",
    confirmed: false,
  },
];

const formatUF = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 2,
  }).format(value);

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(Math.max(Number.isFinite(value) ? value : min, min), max);

export default function Home() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [agreements, setAgreements] = useState<Agreement[]>(defaultAgreements);
  const [showSettings, setShowSettings] = useState(true);
  const [newAgreement, setNewAgreement] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = window.localStorage.getItem("serviu-model-settings");
      const storedAgreements = window.localStorage.getItem("serviu-model-agreements");
      if (storedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) });
      }
      if (storedAgreements) {
        setAgreements(JSON.parse(storedAgreements));
      }
    } catch {
      // The presentation remains usable if local storage is unavailable.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("serviu-model-settings", JSON.stringify(settings));
    window.localStorage.setItem("serviu-model-agreements", JSON.stringify(agreements));
  }, [settings, agreements, hydrated]);

  const projectCap = useMemo(
    () => settings.hourlyRate * settings.weeklyHours * settings.sprintWeeks,
    [settings],
  );
  const marciaFee = Number(settings.marciaFee);
  const hasMarciaFee =
    settings.marciaFee.trim() !== "" && Number.isFinite(marciaFee) && marciaFee >= 0;
  const oneProjectWithMarcia = hasMarciaFee ? projectCap + marciaFee : null;
  const twoProjectsBase = projectCap * 2;
  const twoProjectsTotal =
    hasMarciaFee && settings.marciaInMultiProject
      ? twoProjectsBase + marciaFee
      : twoProjectsBase;

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const toggleAgreement = (id: string) => {
    setAgreements((items) =>
      items.map((item) =>
        item.id === id ? { ...item, confirmed: !item.confirmed } : item,
      ),
    );
  };

  const updateAgreement = (id: string, text: string) => {
    setAgreements((items) =>
      items.map((item) => (item.id === id ? { ...item, text } : item)),
    );
  };

  const addAgreement = () => {
    const text = newAgreement.trim();
    if (!text) return;
    setAgreements((items) => [
      ...items,
      { id: `agreement-${Date.now()}`, text, confirmed: false },
    ]);
    setNewAgreement("");
  };

  const resetAll = () => {
    setSettings(defaultSettings);
    setAgreements(defaultAgreements);
  };

  const requestFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  };

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Ir al inicio">
          <span className="brand-mark" aria-hidden="true">MC</span>
          <span>
            <strong>Modelo de colaboración</strong>
            <small>Propuesta para conversar</small>
          </span>
        </a>
        <nav className="top-actions" aria-label="Controles de presentación">
          <button className="button button-ghost" onClick={() => setShowSettings((value) => !value)}>
            {showSettings ? "Ocultar configuración" : "Configurar"}
          </button>
          <button className="button button-ghost desktop-action" onClick={requestFullscreen}>
            Pantalla completa
          </button>
          <button className="button button-primary" onClick={() => window.print()}>
            Imprimir / PDF
          </button>
        </nav>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <span className="eyebrow">BORRADOR PARA VALIDAR CON SERVIU</span>
          <h1>Capacidad clara para cada proyecto. Equipos que pueden escalar.</h1>
          <p>
            Una propuesta para acordar cómo se valorizan el trabajo actual, la incorporación
            de Marcia y la apertura de nuevos proyectos.
          </p>
        </div>
        <div className="hero-summary" aria-label="Resumen del modelo">
          <span>Base del modelo</span>
          <strong>{formatUF(projectCap)} UF</strong>
          <small>tope por proyecto / sprint</small>
          <div className="hero-rule" />
          <p>El tope representa capacidad disponible; no es un cobro automático.</p>
        </div>
      </section>

      {showSettings && (
        <section className="settings-panel" aria-labelledby="settings-title">
          <div className="settings-heading">
            <div>
              <span className="section-kicker">CONFIGURACIÓN</span>
              <h2 id="settings-title">Prepara la conversación</h2>
            </div>
            <button className="text-button" onClick={resetAll}>Restablecer valores</button>
          </div>
          <div className="settings-grid">
            <label>
              <span>Valor hora</span>
              <div className="input-unit">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={settings.hourlyRate}
                  onChange={(event) =>
                    updateSetting("hourlyRate", clampNumber(event.target.valueAsNumber, 0, 999))
                  }
                />
                <b>UF / hora</b>
              </div>
            </label>
            <label>
              <span>Horas semanales</span>
              <div className="input-unit">
                <input
                  type="number"
                  min="1"
                  max="168"
                  step="1"
                  value={settings.weeklyHours}
                  onChange={(event) =>
                    updateSetting("weeklyHours", clampNumber(event.target.valueAsNumber, 1, 168))
                  }
                />
                <b>horas</b>
              </div>
            </label>
            <label>
              <span>Semanas por sprint</span>
              <div className="input-unit">
                <input
                  type="number"
                  min="1"
                  max="8"
                  step="1"
                  value={settings.sprintWeeks}
                  onChange={(event) =>
                    updateSetting("sprintWeeks", clampNumber(event.target.valueAsNumber, 1, 8))
                  }
                />
                <b>semanas</b>
              </div>
            </label>
            <label>
              <span>Valor fijo de Marcia</span>
              <div className="input-unit">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Por definir"
                  value={settings.marciaFee}
                  onChange={(event) => updateSetting("marciaFee", event.target.value)}
                />
                <b>UF / mes</b>
              </div>
            </label>
          </div>
          <label className="switch-row">
            <input
              type="checkbox"
              checked={settings.marciaInMultiProject}
              onChange={(event) => updateSetting("marciaInMultiProject", event.target.checked)}
            />
            <span className="switch" aria-hidden="true"><span /></span>
            <span>
              <strong>Incluir a Marcia en el escenario de dos proyectos</strong>
              <small>Su valor seguirá apareciendo como una línea mensual separada.</small>
            </span>
          </label>

          <details className="agreements-editor">
            <summary>Editar acuerdos de la conversación</summary>
            <div className="editor-list">
              {agreements.map((agreement, index) => (
                <div className="editor-row" key={agreement.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <input
                    aria-label={`Texto del acuerdo ${index + 1}`}
                    value={agreement.text}
                    onChange={(event) => updateAgreement(agreement.id, event.target.value)}
                  />
                  <button
                    className="icon-button"
                    aria-label={`Eliminar acuerdo ${index + 1}`}
                    onClick={() =>
                      setAgreements((items) => items.filter((item) => item.id !== agreement.id))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="editor-row add-row">
                <span>+</span>
                <input
                  placeholder="Agregar otro acuerdo o pregunta"
                  value={newAgreement}
                  onChange={(event) => setNewAgreement(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addAgreement();
                  }}
                />
                <button className="button button-small" onClick={addAgreement}>Agregar</button>
              </div>
            </div>
          </details>
        </section>
      )}

      <section className="content-section" id="tope">
        <div className="section-heading">
          <span className="section-number">01</span>
          <div>
            <span className="section-kicker">CAPACIDAD</span>
            <h2>Tope por proyecto</h2>
            <p>La unidad base se calcula por un sprint de {settings.sprintWeeks} semanas.</p>
          </div>
        </div>

        <div
          className="weeks-track"
          style={{ gridTemplateColumns: `repeat(${settings.sprintWeeks}, minmax(0, 1fr))` }}
          aria-label={`${settings.sprintWeeks} semanas de ${settings.weeklyHours} horas`}
        >
          {Array.from({ length: settings.sprintWeeks }, (_, index) => (
            <div className="week-cell" key={index}>
              <span>Semana {index + 1}</span>
              <strong>{formatUF(settings.weeklyHours)} h</strong>
            </div>
          ))}
        </div>

        <div className="calculation-strip">
          <div><small>Horas / semana</small><strong>{formatUF(settings.weeklyHours)} h</strong></div>
          <span>×</span>
          <div><small>Duración</small><strong>{settings.sprintWeeks} semanas</strong></div>
          <span>×</span>
          <div><small>Valor hora</small><strong>{formatUF(settings.hourlyRate)} UF</strong></div>
          <span>=</span>
          <div className="result"><small>Tope por proyecto</small><strong>{formatUF(projectCap)} UF</strong></div>
        </div>
      </section>

      <section className="content-section scenarios-section" id="escenarios">
        <div className="section-heading">
          <span className="section-number">02</span>
          <div>
            <span className="section-kicker">ESTRUCTURA COMERCIAL</span>
            <h2>Escenarios de cobro</h2>
            <p>Tres figuras para separar capacidad de proyecto y contratación adicional.</p>
          </div>
        </div>

        <div className="scenario-list">
          <article className="scenario-card">
            <div className="scenario-label">
              <span>ESCENARIO A</span>
              <h3>Proyecto actual</h3>
              <p>Un proyecto, un equipo y un tope por sprint.</p>
            </div>
            <div className="formula-pieces">
              <div className="formula-piece project-piece">
                <small>Proyecto 1</small>
                <strong>hasta {formatUF(projectCap)} UF</strong>
              </div>
            </div>
            <div className="scenario-total">
              <small>Tope del sprint</small>
              <strong>{formatUF(projectCap)} UF</strong>
            </div>
          </article>

          <article className="scenario-card">
            <div className="scenario-label">
              <span>ESCENARIO B</span>
              <h3>Proyecto + Marcia</h3>
              <p>Capacidad del proyecto más una línea fija mensual.</p>
            </div>
            <div className="formula-pieces">
              <div className="formula-piece project-piece">
                <small>Proyecto 1</small>
                <strong>hasta {formatUF(projectCap)} UF</strong>
              </div>
              <b>+</b>
              <div className="formula-piece marcia-piece">
                <small>Marcia</small>
                <strong>{hasMarciaFee ? `${formatUF(marciaFee)} UF fijo` : "M fijo"}</strong>
              </div>
            </div>
            <div className="scenario-total">
              <small>Tope + fijo</small>
              <strong>
                {oneProjectWithMarcia !== null
                  ? `${formatUF(oneProjectWithMarcia)} UF`
                  : `${formatUF(projectCap)} UF + M`}
              </strong>
            </div>
          </article>

          <article className="scenario-card featured-scenario">
            <div className="scenario-label">
              <span>ESCENARIO C</span>
              <h3>Dos proyectos</h3>
              <p>Un segundo tope financia capacidad y equipo separados.</p>
            </div>
            <div className="formula-pieces">
              <div className="formula-piece project-piece">
                <small>Proyecto 1</small>
                <strong>{formatUF(projectCap)} UF</strong>
              </div>
              <b>+</b>
              <div className="formula-piece project-piece">
                <small>Proyecto 2</small>
                <strong>{formatUF(projectCap)} UF</strong>
              </div>
              {settings.marciaInMultiProject && (
                <>
                  <b>+</b>
                  <div className="formula-piece marcia-piece">
                    <small>Marcia</small>
                    <strong>{hasMarciaFee ? `${formatUF(marciaFee)} UF` : "M fijo"}</strong>
                  </div>
                </>
              )}
            </div>
            <div className="scenario-total">
              <small>{settings.marciaInMultiProject ? "Dos topes + fijo" : "Dos topes"}</small>
              <strong>
                {settings.marciaInMultiProject && !hasMarciaFee
                  ? `${formatUF(twoProjectsBase)} UF + M`
                  : `${formatUF(twoProjectsTotal)} UF`}
              </strong>
            </div>
          </article>
        </div>
      </section>

      <section className="content-section" id="equipos">
        <div className="section-heading">
          <span className="section-number">03</span>
          <div>
            <span className="section-kicker">FORMA DE TRABAJO</span>
            <h2>Cómo se organiza el equipo</h2>
            <p>Separamos personas, roles y líneas de responsabilidad.</p>
          </div>
        </div>

        <div className="teams-grid">
          <article className="team-column">
            <div className="team-title">
              <span className="team-icon">01</span>
              <div><small>PROYECTO 1</small><h3>Equipo actual</h3></div>
            </div>
            <div className="team-node lead-node">
              <strong>Tú</strong>
              <span>Liderazgo técnico + desarrollo</span>
              <em>2 roles</em>
            </div>
            <div className="connector" />
            <div className="team-node">
              <strong>Desarrollador backend</strong>
              <span>Ejecución técnica</span>
              <em>1 rol</em>
            </div>
            <p className="team-summary"><strong>3 roles</strong> cubiertos por <strong>2 personas</strong>.</p>
          </article>

          <article className="team-column">
            <div className="team-title">
              <span className="team-icon">02</span>
              <div><small>PROYECTO 2</small><h3>Equipo adicional</h3></div>
            </div>
            <div className="team-node lead-node">
              <strong>Tú</strong>
              <span>Cara visible + liderazgo técnico</span>
              <em>Transversal</em>
            </div>
            <div className="connector" />
            <div className="team-node">
              <strong>Nuevo equipo</strong>
              <span>Dos personas para la ejecución</span>
              <em>Capacidad separada</em>
            </div>
            <p className="team-summary">El segundo tope sostiene un <strong>equipo propio</strong>.</p>
          </article>

          <article className="team-column marcia-column">
            <div className="team-title">
              <span className="team-icon">M</span>
              <div><small>LÍNEA TRANSVERSAL</small><h3>Marcia</h3></div>
            </div>
            <div className="team-node marcia-node">
              <strong>Contrato vía tu empresa</strong>
              <span>Monto fijo mensual adicional</span>
              <em>Fuera del tope*</em>
            </div>
            <div className="connector" />
            <div className="team-node marcia-node">
              <strong>Backlog de X proyectos</strong>
              <span>Alcance y dedicación por definir</span>
              <em>Servicio transversal</em>
            </div>
            <p className="team-summary">*Siempre que esta separación quede <strong>acordada</strong>.</p>
          </article>
        </div>
      </section>

      <section className="content-section agreements-section" id="acuerdos">
        <div className="section-heading">
          <span className="section-number">04</span>
          <div>
            <span className="section-kicker">CIERRE DE LA CONVERSACIÓN</span>
            <h2>Acuerdos que conviene validar</h2>
            <p>Marca cada punto a medida que quede resuelto con la contraparte.</p>
          </div>
        </div>

        <div className="agreement-grid">
          {agreements.map((agreement, index) => (
            <button
              className={`agreement-card ${agreement.confirmed ? "confirmed" : ""}`}
              key={agreement.id}
              onClick={() => toggleAgreement(agreement.id)}
              aria-pressed={agreement.confirmed}
            >
              <span className="agreement-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="agreement-text">{agreement.text}</span>
              <span className="agreement-status">
                <i aria-hidden="true">{agreement.confirmed ? "✓" : "○"}</i>
                {agreement.confirmed ? "Validado" : "Por validar"}
              </span>
            </button>
          ))}
        </div>
      </section>

      <footer>
        <div>
          <strong>Modelo de colaboración y capacidad</strong>
          <span>Documento de conversación · Valores expresados en UF</span>
        </div>
        <p>El objetivo de esta propuesta es validar la figura comercial antes de formalizarla.</p>
      </footer>
    </main>
  );
}
