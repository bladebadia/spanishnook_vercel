# Configuraciones Docker para Spanishnook

Este proyecto usa Dev Container para desarrollo con VS Code.

## Desarrollo con VS Code Dev Container

Esta configuración permite desarrollo completo con VS Code, extensiones, y hot reload.

### Archivos:
- `.devcontainer/devcontainer.json`
- `.devcontainer/docker-compose.yml`
- `.devcontainer/Dockerfile`

### Uso:
1. Abre VS Code
2. Ejecuta "Dev Containers: Reopen in Container"
3. **Para iniciar la aplicación automáticamente:**
   ```bash
   ./auto-start.sh
   ```
4. **Para detener la aplicación:**
   ```bash
   ./stop-app.sh
   ```

## Comandos útiles

### Inicio y parada automática:
```bash
# Iniciar la aplicación en background
./auto-start.sh

# Ver logs en tiempo real
tail -f /tmp/quasar-auto.log

# Detener la aplicación
./stop-app.sh
```

### Para el Dev Container:
```bash
# Reconstruir el contenedor
docker-compose -f .devcontainer/docker-compose.yml build --no-cache

# Ver logs
docker-compose -f .devcontainer/docker-compose.yml logs -f
```

### Manual (si prefieres control directo):
```bash
cd Spanishnook
npm run dev
```

## Acceso a la aplicación

La aplicación estará disponible en:
- http://localhost:9000
- http://127.0.0.1:9000

## Hot Reload

El hot reload está activado para desarrollo completo con VS Code.
