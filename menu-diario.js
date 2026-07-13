/* ============================================================
   MENÚ DIARIO · Carga el menú publicado por el dueño
   - Con Supabase configurado: lee la fila única y se suscribe
     a cambios en tiempo real (si el dueño publica mientras
     alguien mira la web, la minuta se actualiza sola).
   - Sin configurar: muestra el menú de ejemplo (MODO DEMO).
   ============================================================ */

(async function () {
  const contenedor = document.getElementById("minuta");
  if (!contenedor) return;

  const cliente = rafaSupabase();

  // --- Modo demo (Supabase sin configurar) ---
  if (!cliente) {
    renderMinuta(window.MENU_DEMO, contenedor);
    return;
  }

  // --- Lectura inicial ---
  const pintar = (fila) => {
    if (fila) renderMinuta(fila, contenedor);
  };

  const { data, error } = await cliente
    .from("menu_diario")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    // Si algo falla, no dejamos la página vacía
    renderMinuta(window.MENU_DEMO, contenedor);
    console.warn("No se pudo leer el menú de Supabase:", error);
  } else {
    pintar(data);
  }

  // --- Actualización en tiempo real ---
  try {
    cliente
      .channel("menu-diario-publico")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "menu_diario", filter: "id=eq.1" },
        (cambio) => pintar(cambio.new)
      )
      .subscribe();
  } catch (e) {
    /* la suscripción es opcional; la carga inicial ya funciona */
  }
})();
