/* ============================================================
   COMÚN · Restaurante Rafa
   Navegación móvil · cliente Supabase · renderizador de minuta
   ============================================================ */

/* ---------- Navegación móvil ---------- */
(function () {
  const boton = document.querySelector(".nav-boton");
  const cabecera = document.querySelector(".cabecera");
  if (!boton || !cabecera) return;

  boton.addEventListener("click", () => {
    const abierta = cabecera.classList.toggle("nav-abierta");
    boton.setAttribute("aria-expanded", abierta ? "true" : "false");
  });

  // Cierra el menú al elegir un enlace
  cabecera.querySelectorAll(".nav-principal a").forEach((a) =>
    a.addEventListener("click", () => {
      cabecera.classList.remove("nav-abierta");
      boton.setAttribute("aria-expanded", "false");
    })
  );
})();

/* ---------- Año del pie ---------- */
document.querySelectorAll("[data-anio]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

/* ---------- Cliente Supabase (si está configurado) ---------- */
function rafaSupabase() {
  const cfg = window.RAFA_CONFIG || {};
  const configurado = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase;
  if (!configurado) return null;
  if (!window.__rafaClient) {
    window.__rafaClient = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  }
  return window.__rafaClient;
}

/* ---------- Utilidades de fecha ---------- */
const DIAS_SEMANA = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];

function diaDeHoy() {
  return DIAS_SEMANA[new Date().getDay()];
}

function horaBonita(iso) {
  if (!iso) return null;
  const f = new Date(iso);
  if (isNaN(f)) return null;
  const hoy = new Date();
  const esHoy = f.toDateString() === hoy.toDateString();
  const hora = f.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  const fecha = f.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
  return esHoy ? `hoy a las ${hora}` : `el ${fecha} a las ${hora}`;
}

/* ---------- Renderizador de la minuta ----------
   Lo usan la página pública (menu-diario.html) y la vista
   previa del panel de administración: el dueño ve EXACTAMENTE
   lo mismo que verán los clientes. */
function renderMinuta(datos, contenedor) {
  if (!contenedor) return;

  const primeros = (datos.primeros || []).filter((p) => p && p.trim());
  const segundos = (datos.segundos || []).filter((p) => p && p.trim());
  const sugerencia = (datos.sugerencia || "").trim();
  const actualizado = horaBonita(datos.actualizado);

  const lista = (platos) =>
    platos.length
      ? platos.map((p) => `<li>${escaparHtml(p)}</li>`).join("")
      : `<li><em>Pendiente de publicar</em></li>`;

  contenedor.innerHTML = `
    <header class="minuta__cabecera">
      <img class="minuta__marca" src="assets/logo-rafa.svg" alt="" aria-hidden="true">
      <p class="minuta__dia">${escaparHtml(datos.dia || diaDeHoy())}</p>
      <p class="minuta__fecha">Menú del día</p>
    </header>

    <section class="minuta__seccion" aria-labelledby="minuta-primeros">
      <h3 class="minuta__titulo-seccion" id="minuta-primeros">Primeros</h3>
      <ul class="minuta__platos">${lista(primeros)}</ul>
    </section>

    <section class="minuta__seccion" aria-labelledby="minuta-segundos">
      <h3 class="minuta__titulo-seccion" id="minuta-segundos">Segundos a elegir</h3>
      <ul class="minuta__platos">${lista(segundos)}</ul>
    </section>

    <div class="minuta__clausulas">
      <p>Entra agua, vino tinto, pan, alioli y postre</p>
      <p class="resaltado">No entra gaseosa, refrescos, cerveza, e.t.c.</p>
      <p>Dos platos de segundo 18 € solo en restaurante</p>
    </div>

    <div class="minuta__postres">
      <span class="sello sello--animado">100% postres caseros</span>
      <p>Flan, puding, natillas, sandwich de nata y fruta</p>
    </div>

    ${sugerencia ? `<p class="minuta__sugerencia">¡${escaparHtml(sugerencia)}!</p>` : ""}

    <p class="minuta__pie">No se comparten menú</p>
    ${actualizado ? `<p class="minuta__actualizado">Actualizado ${actualizado}</p>` : ""}
  `;
}

function escaparHtml(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/* ---------- Aviso emergente (toast) ---------- */
function mostrarToast(mensaje, esError = false) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.classList.toggle("toast--error", esError);
  toast.classList.add("visible");
  clearTimeout(toast.__temporizador);
  toast.__temporizador = setTimeout(() => toast.classList.remove("visible"), 3500);
}
