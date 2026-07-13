/* ============================================================
   PANEL DEL DUEÑO · admin.html
   Flujo real (Supabase configurado):
     1. Inicio de sesión con email + contraseña
     2. Carga el menú actual en el formulario
     3. "Publicar menú del día" → UPDATE de la fila única
   Flujo demo (sin configurar):
     El formulario actualiza solo la vista previa y avisa de
     que falta conectar Supabase para publicar de verdad.
   ============================================================ */

(function () {
  const cliente = rafaSupabase();
  const enDemo = !cliente;

  // --- Referencias del DOM ---
  const vistaAcceso = document.getElementById("vista-acceso");
  const vistaPanel = document.getElementById("vista-panel");
  const formAcceso = document.getElementById("form-acceso");
  const formMenu = document.getElementById("form-menu");
  const chipsDia = Array.from(document.querySelectorAll(".chip-dia"));
  const inputsPrimeros = Array.from(document.querySelectorAll("[data-primero]"));
  const inputsSegundos = Array.from(document.querySelectorAll("[data-segundo]"));
  const inputSugerencia = document.getElementById("sugerencia");
  const vistaPrevia = document.getElementById("vista-previa");
  const botonPublicar = document.getElementById("boton-publicar");
  const botonSalir = document.getElementById("boton-salir");
  const emailSesion = document.getElementById("email-sesion");
  const avisoDemo = document.getElementById("aviso-demo");

  let diaElegido = diaDeHoy() === "DOMINGO" ? "LUNES" : diaDeHoy();

  /* ---------- Día de la semana (chips) ---------- */
  function pintarChips() {
    chipsDia.forEach((chip) => {
      chip.setAttribute("aria-pressed", chip.dataset.dia === diaElegido ? "true" : "false");
    });
  }

  chipsDia.forEach((chip) =>
    chip.addEventListener("click", () => {
      diaElegido = chip.dataset.dia;
      pintarChips();
      actualizarVistaPrevia();
    })
  );

  /* ---------- Estado del formulario → objeto de menú ---------- */
  function leerFormulario() {
    return {
      id: 1,
      dia: diaElegido,
      primeros: inputsPrimeros.map((i) => i.value.trim()).filter(Boolean),
      segundos: inputsSegundos.map((i) => i.value.trim()).filter(Boolean),
      sugerencia: inputSugerencia.value.trim(),
      actualizado: new Date().toISOString()
    };
  }

  function volcarEnFormulario(fila) {
    if (!fila) return;
    diaElegido = fila.dia || diaElegido;
    (fila.primeros || []).forEach((p, i) => { if (inputsPrimeros[i]) inputsPrimeros[i].value = p; });
    (fila.segundos || []).forEach((s, i) => { if (inputsSegundos[i]) inputsSegundos[i].value = s; });
    inputSugerencia.value = fila.sugerencia || "";
    pintarChips();
    actualizarVistaPrevia();
  }

  function actualizarVistaPrevia() {
    const datos = leerFormulario();
    datos.actualizado = null; // en la previa no mostramos hora
    renderMinuta(datos, vistaPrevia);
  }

  [...inputsPrimeros, ...inputsSegundos, inputSugerencia].forEach((input) =>
    input.addEventListener("input", actualizarVistaPrevia)
  );

  /* ---------- Publicar ---------- */
  formMenu.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const datos = leerFormulario();

    if (!datos.primeros.length || !datos.segundos.length) {
      mostrarToast("Escribe al menos un primero y un segundo", true);
      return;
    }

    if (enDemo) {
      actualizarVistaPrevia();
      mostrarToast("Vista previa actualizada (demo). Conecta Supabase para publicar en la web.");
      return;
    }

    botonPublicar.disabled = true;
    botonPublicar.textContent = "Publicando…";

    const { error } = await cliente.from("menu_diario").update({
      dia: datos.dia,
      primeros: datos.primeros,
      segundos: datos.segundos,
      sugerencia: datos.sugerencia,
      actualizado: datos.actualizado
    }).eq("id", 1);

    botonPublicar.disabled = false;
    botonPublicar.textContent = "Publicar menú del día";

    if (error) {
      mostrarToast("No se pudo publicar: " + error.message, true);
      return;
    }

    actualizarVistaPrevia();
    const hora = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    mostrarToast(`Menú publicado ✓ ${hora}`);
  });

  /* ---------- Sesión ---------- */
  async function mostrarPanel(email) {
    vistaAcceso.classList.add("oculto");
    vistaPanel.classList.remove("oculto");
    if (email && emailSesion) emailSesion.textContent = email;

    if (!enDemo) {
      const { data } = await cliente.from("menu_diario").select("*").eq("id", 1).maybeSingle();
      if (data) volcarEnFormulario(data);
      else actualizarVistaPrevia();
    } else {
      volcarEnFormulario(window.MENU_DEMO);
    }
  }

  if (enDemo) {
    // Sin backend no hay sesión real: se muestra el panel con aviso claro.
    avisoDemo.classList.remove("oculto");
    document.getElementById("fila-sesion").classList.add("oculto");
    mostrarPanel(null);
  } else {
    avisoDemo.classList.add("oculto");

    // ¿Hay sesión abierta de otro día?
    cliente.auth.getSession().then(({ data }) => {
      if (data.session) mostrarPanel(data.session.user.email);
    });

    formAcceso.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      const email = document.getElementById("acceso-email").value.trim();
      const clave = document.getElementById("acceso-clave").value;
      const botonEntrar = document.getElementById("boton-entrar");

      botonEntrar.disabled = true;
      botonEntrar.textContent = "Entrando…";

      const { data, error } = await cliente.auth.signInWithPassword({ email, password: clave });

      botonEntrar.disabled = false;
      botonEntrar.textContent = "Entrar";

      if (error) {
        mostrarToast("Email o contraseña incorrectos", true);
        return;
      }
      mostrarPanel(data.user.email);
    });

    botonSalir.addEventListener("click", async () => {
      await cliente.auth.signOut();
      vistaPanel.classList.add("oculto");
      vistaAcceso.classList.remove("oculto");
    });
  }

  pintarChips();
})();
