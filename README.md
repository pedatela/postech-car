# Postech Car

Projeto Node.js simples configurado com TypeScript.

## Requisitos

- Node.js 18+
- npm 10+

## Instalação

```bash
npm install
```

## Scripts

- `npm run dev`: executa o projeto em modo desenvolvimento usando `ts-node-dev`.
- `npm run lint`: roda o TypeScript em modo `noEmit`, útil como verificação estática simples.
- `npm test`: executa o build (placeholder até adicionarmos testes formais).
- `npm run build`: compila os arquivos TypeScript para `dist/`.
- `npm start`: executa o JavaScript gerado após a compilação.

## Estrutura

```
postech-car/
├─ src/
│  ├─ app/
│  │  ├─ http/routes/
│  │  │  ├─ index.ts
│  │  │  └─ vehicles.ts
│  │  ├─ http/controllers/vehicles.controller.ts
│  │  └─ services/vehicles.service.ts
│  ├─ domain/vehicles/
│  │  ├─ entities/vehicle.ts
│  │  └─ repositories/vehicles-repository.ts
│  ├─ infra/repositories/in-memory/in-memory-vehicles.repository.ts
│  └─ server.ts
├─ dist/
├─ tsconfig.json
└─ package.json
```

O ponto de entrada `src/server.ts` sobe um servidor [Express](https://expressjs.com/) que responde a `GET /` com um JSON básico e expõe as rotas da API em `/api`. O servidor usa a porta definida em `PORT` (padrão 3000).

## Domínio (DDD)

A aplicação segue uma separação simples em camadas:

- **Domain**: contém a entidade `Vehicle` e o contrato `VehiclesRepository`. O veículo possui os atributos `brand`, `model`, `year`, `color`, `price`, `isSold` e o `buyerId` (quando vendido).
- **Application**: `VehiclesService` orquestra os casos de uso utilizando o repositório.
- **Infra**: `InMemoryVehiclesRepository` implementa o repositório usando armazenamento em memória, ideal para prototipação.
- **HTTP**: controllers e rotas expõem os casos de uso via Express e validam o payload com [Zod](https://zod.dev).

## Infraestrutura (Terraform + ECS)

A infraestrutura oficial (VPC, ECR, ECS, RDS/Keycloak etc.) vive em um repositório dedicado: `postech-car-infra`. Lá estão todos os manifests Terraform, pipeline de plan/apply e o estado remoto compartilhado. Este repositório contém apenas o código da aplicação; não há mais arquivos Terraform locais.

Para alterar ou aplicar infraestrutura:

1. Trabalhe no repositório `postech-car-infra` (branch/PR).
2. Use o workflow de Terraform daquele projeto ou rode `terraform plan/apply` por lá.
3. Volte para este repo apenas para evoluir o código da API e publicar novas imagens Docker.

## GitHub Actions

O workflow `.github/workflows/deploy.yml` roda automaticamente para `push`, `pull_request` e `workflow_dispatch`:

1. Instala dependências, executa `npm run lint` e `npm test`.
2. Constrói a imagem Docker, publica em `$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/postech-car` com as tags `SHA` e `latest`.
3. Força um novo deploy no serviço ECS existente (cluster/serviço informados via variáveis do repositório), aguardando estabilização.

Como a infraestrutura agora vive no repositório `postech-car-infra`, nenhum passo de Terraform é executado aqui. Ajustes em VPC/ECS/Keycloak devem ser realizados lá; este pipeline apenas entrega novas imagens para o serviço já provisionado.

### Secrets e variáveis necessários

- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`: credenciais com permissão para ECR e ECS (a conta deve coincidir com a que rodou o Terraform da infra).
- `AWS_ACCOUNT_ID`: usado para montar a URL do ECR.
- `ECS_CLUSTER_NAME` (variável de repositório): nome do cluster criado pelo Terraform (ex. `postech-car-app-cluster`).
- `ECS_SERVICE_NAME` (variável de repositório): serviço ECS da aplicação (ex. `postech-car-app-svc`).

Se quiser alterar o nome do repositório ECR ou região padrão, edite `env.ECR_REPOSITORY`/`env.AWS_REGION` no workflow.

### Rotas de veículos

- `GET /api/vehicles` lista todos os veículos cadastrados. Aceita o query param `status=available|sold` para filtrar e ordenar (por preço ascendente) apenas os veículos à venda ou vendidos.
- `GET /api/vehicles/:id` busca um veículo específico.
- `POST /api/vehicles` cadastra um novo veículo (`brand`, `model`, `year`, `color`, `price`, `isSold` - padrão `false`).
- `PUT /api/vehicles/:id` atualiza dados de um veículo existente.
- `POST /api/vehicles/:id/purchase` realiza a compra de um veículo. Exige token JWT emitido pelo Keycloak com a role `buyer`.
- `DELETE /api/vehicles/:id` remove um veículo.

Os dados ficam em memória durante a execução para fins de demonstração.

## Autenticação com Keycloak (desenvolvimento local)

Para desenvolver o fluxo de compra/autorização localmente, foi adicionado um `docker-compose.yml` com uma instância do Keycloak:

```bash
docker compose up keycloak -d
```

As credenciais padrão são `admin/admin`. Depois que o container estiver no ar:

1. Acesse `http://localhost:8080`.
2. Crie um realm chamado `postech-car`.
3. Crie o client `postech-car-api` (confidential ou public), habilite o fluxo desejado e copie o `Client ID` para usar como audiência (`KEYCLOAK_AUDIENCE`).
4. Crie a role `buyer` e associe aos usuários que podem efetuar compras.

### Variáveis de ambiente da API

Defina um `.env` (ou exporte no shell) com:

```env
KEYCLOAK_ISSUER=http://localhost:8080/realms/postech-car
KEYCLOAK_AUDIENCE=postech-car-api
KEYCLOAK_REQUIRED_ROLE=buyer
```

Em produção, esses valores devem apontar para o Keycloak hospedado em outro stack/conta. O middleware `authenticate` valida o JWT, popula `req.user` e o endpoint `POST /api/vehicles/:id/purchase` verifica a role antes de efetivar a compra (marcando o veículo como `isSold=true` e amarrando o `buyerId`).
