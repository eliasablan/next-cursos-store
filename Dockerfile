# Establece la imagen base de Node.js en la plataforma linux/amd64
FROM --platform=linux/amd64 node:20-alpine AS base

# DEPENDENCIAS
FROM base AS deps
# Instala las dependencias necesarias para construir módulos nativos
RUN apk add --no-cache libc6-compat openssl python3 make g++
# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de lock de dependencias
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml\* ./

# Instala las dependencias según el gestor de paquetes disponible
RUN \
 if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
 elif [ -f package-lock.json ]; then npm ci; \
 elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
 else echo "Lockfile not found." && exit 1; \
 fi

# CONSTRUCCIÓN
FROM base AS builder
# Define la variable de entorno para la URL de la base de datos
ARG DATABASE_URL
# Establece el directorio de trabajo
WORKDIR /app
# Copia los módulos de node desde la fase de dependencias
COPY --from=deps /app/node_modules ./node_modules
# Copia todos los archivos del proyecto
COPY . .

# Recompila específicamente el módulo bcrypt
RUN apk add --no-cache make gcc g++ python3
RUN npm rebuild bcrypt --build-from-source

# Desactiva la telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Construye la aplicación según el gestor de paquetes disponible
RUN \
 if [ -f yarn.lock ]; then SKIP_ENV_VALIDATION=1 yarn build; \
 elif [ -f package-lock.json ]; then SKIP_ENV_VALIDATION=1 npm run build; \
 elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && SKIP_ENV_VALIDATION=1 pnpm run build; \
 else echo "Lockfile not found." && exit 1; \
 fi

# EJECUCIÓN
FROM base AS runner
# Establece el directorio de trabajo
WORKDIR /app

# Instala las dependencias necesarias para la ejecución
RUN npm install drizzle-orm postgres

# Establece el entorno de producción
ENV NODE_ENV=production

# Desactiva la telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Crea un grupo y usuario para ejecutar la aplicación de manera segura
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia los archivos públicos desde la fase de construcción
COPY --from=builder /app/public ./public

# Copia los archivos necesarios para la ejecución de la aplicación
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

# Cambia al usuario creado para ejecutar la aplicación
USER nextjs
# Expone el puerto 3000 para la aplicación
EXPOSE 3000
# Establece la variable de entorno para el puerto
ENV PORT=3000

# Comando para iniciar la aplicación
CMD ["sh", "-c", "npm run db:migrateprod && node server.js"]