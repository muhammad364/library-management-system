FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=2 \
  CMD node -e "fetch('http://localhost:5000/health').then(r=>{if(!r.ok)throw new Error('unhealthy');}).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
