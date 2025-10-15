# 🎮 Space Arcane Game

Un juego de arcade espacial desarrollado con **Phaser.js** y **React** que combina acción clásica con mecánicas modernas.

## ✨ Características

### 🎯 Sistema de Juego
- **Progresión de oleadas**: 3, 4, 5, 6, 7, 8... enemigos por oleada
- **Sistema de poder especial**: Doble daño por 5 segundos cada 15 segundos (tecla C)
- **Colisiones realistas**: Los enemigos rebotan entre sí en lugar de desaparecer
- **Hitbox optimizada**: Mejor detección de colisiones para el personaje
- **Balas dinámicas**: Tamaño y color cambian con el poder especial

### 🎮 Controles
- **Movimiento**: Flechas direccionales o WASD
- **Disparo**: Barra espaciadora
- **Poder especial**: Tecla C (cooldown de 15 segundos)
- **Pausa**: P o ESC

### 🏆 Sistema de Puntuación
- Puntos por enemigos derrotados
- 100 puntos bonus por derrotar al jefe
- Leaderboard con validación de nombres únicos
- Persistencia de datos en localStorage

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Jojans/Juego-retro-software2.git
   cd Juego-retro-software2
   ```

2. **Instalar dependencias**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend (opcional)
   cd ../backend
   npm install
   ```

3. **Ejecutar el juego**
   ```bash
   # Solo frontend (modo desarrollo)
   cd frontend
   npm start
   
   # Con backend (modo completo)
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

4. **Abrir en el navegador**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Phaser.js 3.90** - Motor de juegos
- **Tailwind CSS** - Estilos
- **React Router** - Navegación

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **Socket.io** - Comunicación en tiempo real

## 📁 Estructura del Proyecto

```
juego_software-main/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── game/            # Lógica del juego (Phaser)
│   │   │   ├── entities/    # Entidades del juego
│   │   │   ├── managers/    # Gestores de sistemas
│   │   │   ├── scenes/      # Escenas del juego
│   │   │   └── ui/          # Interfaz de usuario
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── contexts/        # Contextos de React
│   │   └── services/        # Servicios de datos
│   └── public/              # Assets estáticos
├── backend/                 # API del servidor
│   ├── src/
│   │   ├── routes/          # Rutas de la API
│   │   ├── models/          # Modelos de datos
│   │   ├── services/        # Lógica de negocio
│   │   └── middleware/      # Middleware personalizado
│   └── scripts/             # Scripts de base de datos
└── Proyecto/               # Versión original del juego
```

## 🎮 Mecánicas del Juego

### Sistema de Oleadas
- **Oleada 1**: 3 enemigos
- **Oleada 2**: 4 enemigos
- **Oleada 3**: 5 enemigos
- Y así sucesivamente...

### Tipos de Enemigos
- **Enemigos básicos**: Movimiento en zigzag, espiral o recto
- **Jefe**: Aparece cada 5 oleadas con mayor resistencia

### Poder Especial
- **Activación**: Tecla C o clic en el botón
- **Efecto**: Doble daño por 5 segundos
- **Cooldown**: 15 segundos
- **Visual**: Balas más grandes y verdes

## 🔧 Scripts Disponibles

### Frontend
```bash
npm start          # Servidor de desarrollo
npm run build      # Construcción para producción
npm test           # Ejecutar pruebas
npm run eject      # Eyectar configuración (irreversible)
```

### Backend
```bash
npm run dev        # Servidor de desarrollo
npm run build      # Construcción para producción
npm start          # Servidor de producción
```

## 🐛 Solución de Problemas

### Error de archivos grandes
Si encuentras errores relacionados con archivos grandes en Git:
```bash
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch -r node_modules/" --prune-empty --tag-name-filter cat -- --all
git push --force origin main
```

### Problemas de dependencias
```bash
# Limpiar caché
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Desarrollador

**Jojans** - [GitHub](https://github.com/Jojans)

## 🎯 Roadmap

- [ ] Modo multijugador
- [ ] Nuevos tipos de enemigos
- [ ] Sistema de power-ups
- [ ] Efectos de sonido mejorados
- [ ] Modo de dificultad personalizable
- [ ] Logros y medallas

---

¡Disfruta jugando! 🚀✨
