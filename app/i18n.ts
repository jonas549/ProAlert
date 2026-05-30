const i18n = {
  nav: {
    inicio: "Inicio",
    avisos: "Avisos",
    analiticas: "Analíticas",
    soporte: "Soporte",
  },
  inicio: {
    titulo: "Panel de control",
    bienvenida: "Bienvenido a ProAlert",
    sinDatos: "Todavía no hay datos disponibles.",
    totalAvisos: "Total de avisos",
    avisosActivos: "Avisos activos",
    vistasHoy: "Vistas hoy",
    confirmaciones: "Confirmaciones",
  },
  avisos: {
    titulo: "Avisos",
    descripcion:
      "Configura los avisos que se muestran cuando un cliente agrega un producto al carrito.",
    sinAvisos: "Aún no tienes avisos creados.",
    crearAviso: "Crear aviso",
    editarAviso: "Editar aviso",
    eliminarAviso: "Eliminar aviso",
  },
  analiticas: {
    titulo: "Analíticas",
    descripcion: "Métricas de rendimiento de tus avisos.",
    proximamente: "Próximamente disponible.",
  },
  soporte: {
    titulo: "Soporte",
    descripcion: "¿Necesitas ayuda? Contáctanos.",
    emailEtiqueta: "Correo de soporte",
    email: "contacto@appsdeveloperspro.com",
    mensajeCuerpo:
      "Para consultas técnicas o dudas sobre la app, escríbenos a:",
  },
  landing: {
    heroTitulo: "ProAlert — Product Warnings",
    heroTagline:
      "Muestra avisos configurables en todas las superficies de tu tienda Shopify. Protege a tus clientes y reduce devoluciones.",
    feature1Titulo: "Cobertura total del carrito",
    feature1Desc:
      "El aviso se activa en páginas de producto, colecciones y quick-add. Ninguna superficie se queda sin cubrir.",
    feature2Titulo: "Flexibilidad total",
    feature2Desc:
      "Asigna avisos por producto, variante o colección. Personaliza el mensaje para cada caso.",
    feature3Titulo: "Modo confirmación o bloqueo",
    feature3Desc:
      "Elige si el cliente solo confirma el aviso o si se bloquea el checkout hasta que acepte.",
    ctaInstalar: "Instalar en mi tienda",
    footerSoporte: "Soporte:",
    footerDerechos: "© 2026 ProAlert. Todos los derechos reservados.",
  },
  errores: {
    noAutenticado: "No autenticado.",
    errorGenerico: "Ocurrió un error inesperado.",
  },
} as const;

export default i18n;
