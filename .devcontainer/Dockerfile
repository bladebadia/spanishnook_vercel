
# Use Node.js 20 LTS
FROM node:20-bullseye

# Install additional tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    nano \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages for Quasar development (as root)
# Note: yarn is already included in node:20-bullseye
# Update npm to latest version first
RUN npm install -g npm@latest

# Install Quasar and Vue CLI tools
RUN npm install -g @quasar/cli@latest @vue/cli@latest

# Update yarn to latest version (force overwrite)
RUN npm install -g yarn@latest --force

# Add node user to sudo group and configure npm global directory
RUN usermod -aG sudo node \
    && echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers \
    && mkdir -p /home/node/.npm-global \
    && chown -R node:node /home/node/.npm-global

# Set working directory and create with proper permisos
WORKDIR /workspaces
RUN chown -R node:node /workspaces

# Copiar el script y crear symlink como root (antes de USER node)
#COPY --chown=node:node auto-start.sh /home/node/auto-start.sh
#RUN chmod +x /home/node/auto-start.sh \
#    && ln -sf /home/node/auto-start.sh /usr/local/bin/auto-start.sh

# Cambiar a usuario node
USER node

# Configurar npm para usar el directorio global del usuario
RUN npm config set prefix '/home/node/.npm-global'
ENV PATH="/home/node/.npm-global/bin:$PATH"

# Exponer puertos (9000 para Quasar dev server, 3000 para otros servicios)
EXPOSE 3000 9000

# Comando por defecto para mantener el contenedor en ejecución
CMD ["sleep", "infinity"]