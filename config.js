/* ============================================================
   CONFIGURACIÓN · Restaurante Rafa
   ------------------------------------------------------------
   1) Crea un proyecto gratuito en https://supabase.com
   2) Ejecuta el SQL del README (tabla `menu_diario` + políticas)
   3) Pega aquí la URL y la anon key (Ajustes → API)
   4) Crea el usuario del dueño en Authentication → Users

   Mientras estos campos estén vacíos, la web funciona en
   MODO DEMO con el menú de ejemplo de más abajo.
   ============================================================ */

window.RAFA_CONFIG = {
  SUPABASE_URL: "https://emriujsoaarsdigomvxl.supabase.co",        // ej: "https://abcd1234.supabase.co"
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtcml1anNvYWFyc2RpZ29tdnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjQ1MTgsImV4cCI6MjA5OTAwMDUxOH0.AbRnfRMSp7wYrifvLHYGoDuuUzbI2jQvLSJn6PYLGEs",   // clave "anon public" (es segura de publicar: las políticas RLS protegen la escritura)
  FORMSPREE_ID: "https://formspree.io/f/xojobljq"         // ej: "mqkvwxyz" → formulario de contacto (https://formspree.io)
};

/* Datos fijos del negocio (un solo sitio para cambiarlos) */
window.RAFA_NEGOCIO = {
  telefono: "971431058",
  telefonoBonito: "971 43 10 58",
  direccion: "Gran Via Asima, 26 · Polígono Son Castelló · 07009 Palma",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Restaurante+Rafa+Gran+Via+Asima+26+Palma"
};

/* Menú de ejemplo (el de la minuta original del cliente).
   Se muestra cuando Supabase aún no está configurado. */
window.MENU_DEMO = {
  dia: "LUNES",
  primeros: [
    "Cazuela de lentejas a la castellana",
    "Boquerones en vinagre",
    "Gazpacho andaluz",
    "Ensalada capresse"
  ],
  segundos: [
    "Pierna asada en salsa de naranja y setas",
    "Pollo al ast / al romero",
    "Canelones gratinados con bechamel",
    "Bacalao vizcaína"
  ],
  sugerencia: "HAY SORBETE ALMENDRAS",
  actualizado: null
};
