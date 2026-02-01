# Project Report: SkillSwap

## 🎯 Objetivo
Desarrollar una plataforma integral de "economía de trueque" (Time-Banking) para profesionales. El objetivo era crear un ciclo completo: Descubrimiento -> Negociación -> Servicio -> Reputación.

## 💡 Desafíos Técnicos Superados

### 1. Sistema de Chat en Tiempo Real y Estado
Implementar una comunicación fluida fue crítico.
- **Reto:** Sincronizar la UI con la base de datos sin recargas.
- **Solución:** Utilicé suscripciones a canales de `Supabase Realtime` para escuchar `INSERT` en la tabla `messages`.
- **UX:** Implementé scroll automático y estados de carga optimistas para una sensación nativa.

### 2. Ciclo de Vida del Swap y "Feedback Loop"
Gestionar la máquina de estados de un intercambio complejo.
- **Flujo:** `Pending` → `Accepted` → `Completed` → `Rated`.
- **Implementación:** Creé Server Actions atómicas que validan la propiedad del usuario antes de cambiar estados.
- **Reviews:** Diseñé un sistema de calificación (1-5 estrellas) que solo se activa cuando el trabajo está finalizado, cerrando el ciclo de confianza.

### 3. Algoritmo de Descubrimiento (Strict Mode)
Evitar que el usuario vea repetidamente perfiles con los que ya interactuó.
- **Lógica:** Implementé un filtrado en el Dashboard que cruza los IDs de la tabla `profiles` contra un array de exclusión generado dinámicamente desde `swaps` (historial de interacciones). Esto garantiza que el usuario siempre vea "caras nuevas".

### 4. Seguridad Avanzada (RLS)
Garantizar la privacidad en una plataforma social.
- **Blindaje:** No confié solo en el frontend. Implementé políticas **Row Level Security (RLS)** en PostgreSQL.
- **Resultado:** Un usuario no puede, bajo ninguna circunstancia (incluso atacando la API), leer mensajes o reviews de intercambios en los que no participa.

## 🚀 Conclusión
SkillSwap ha pasado de ser un prototipo visual a un MVP (Producto Mínimo Viable) robusto y seguro. La arquitectura basada en **Next.js Server Components** asegura rendimiento, mientras que la integración profunda con PostgreSQL permite lógicas de negocio complejas como la reputación y el filtrado estricto. La aplicación está lista para despliegue y uso real.