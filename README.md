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
- `npm test`: executa a suíte de testes unitários com [Vitest](https://vitest.dev/) no modo CI.
- `npm run test:watch`: executa os testes em modo interativo/watch.
- `npm run test:coverage`: roda os testes e gera o relatório de cobertura (salvo em `coverage/`).
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

A infraestrutura oficial (VPC, ECR, ECS, bancos e integrações auxiliares como Cognito) vive em um repositório dedicado: `postech-car-infra`. Lá estão todos os manifests Terraform, pipeline de plan/apply e o estado remoto compartilhado. Este repositório contém apenas o código da aplicação; não há mais arquivos Terraform locais.

Para alterar ou aplicar infraestrutura:

1. Trabalhe no repositório `postech-car-infra` (branch/PR).
2. Use o workflow de Terraform daquele projeto ou rode `terraform plan/apply` por lá.
3. Volte para este repo apenas para evoluir o código da API e publicar novas imagens Docker.

## GitHub Actions

O workflow `.github/workflows/deploy.yml` roda automaticamente para `push`, `pull_request` e `workflow_dispatch`:

1. Instala dependências, executa `npm run lint` e `npm run test:coverage`.
2. Constrói a imagem Docker, publica em `$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${ECR_REPOSITORY}` com as tags `SHA` e `latest`.
3. Força um novo deploy no serviço ECS existente (cluster/serviço informados via variáveis do repositório), aguardando estabilização.

Como a infraestrutura agora vive no repositório `postech-car-infra`, nenhum passo de Terraform é executado aqui. Ajustes em VPC/ECS/Cognito devem ser realizados lá; este pipeline apenas entrega novas imagens para o serviço já provisionado.

### Secrets e variáveis necessários

- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`: credenciais com permissão para ECR e ECS (a conta deve coincidir com a que rodou o Terraform da infra).
- `AWS_ACCOUNT_ID`: usado para montar a URL do ECR.
- `ECS_CLUSTER_NAME` (variável de repositório): nome do cluster criado pelo Terraform (ex. `postech-car-app-cluster`).
- `ECS_SERVICE_NAME` (variável de repositório): serviço ECS da aplicação (ex. `postech-car-app-svc`).

Se quiser alterar o nome do repositório ECR ou região padrão, edite `env.ECR_REPOSITORY`/`env.AWS_REGION` no workflow.

### Rotas de veículos

- `GET /api/vehicles` lista todos os veículos cadastrados. Aceita o query param `status=available|sold` para filtrar e ordenar (por preço ascendente) apenas os veículos à venda ou vendidos.
- `GET /api/vehicles/:id` busca um veículo específico.
- `POST /api/vehicles` cadastra um ou mais veículos (`brand`, `model`, `year`, `color`, `price`, `isSold` - padrão `false`). É possível enviar um único objeto ou um array de objetos para criação em lote. **Requer autenticação** e que o usuário pertença ao grupo/role definido em `AUTH_SELLER_ROLE` (padrão `seller`).
- `PUT /api/vehicles/:id` atualiza dados de um veículo existente. **Requer role de seller.**
- `POST /api/vehicles/:id/purchase` realiza a compra de um veículo. Exige token JWT emitido pelo Amazon Cognito com o grupo/role `buyer` e retorna os dados do comprador (nome/e-mail) junto ao veículo atualizado.
- `DELETE /api/vehicles/:id` remove um veículo. **Requer role de seller.**

### Exemplo de payload em lote

```json
[
  { "brand": "Tesla", "model": "Model 3", "year": 2024, "color": "Azul", "price": 289000, "isSold": false },
  { "brand": "Ford", "model": "Mustang Mach-E", "year": 2023, "color": "Vermelho", "price": 315000, "isSold": false },
  { "brand": "Chevrolet", "model": "Bolt EUV", "year": 2022, "color": "Branco", "price": 198000, "isSold": false },
  { "brand": "Volkswagen", "model": "ID.4", "year": 2024, "color": "Preto", "price": 255000, "isSold": false },
  { "brand": "BMW", "model": "i4 eDrive40", "year": 2023, "color": "Cinza", "price": 379000, "isSold": false },
  { "brand": "Audi", "model": "Q4 e-tron", "year": 2024, "color": "Azul Marinho", "price": 365000, "isSold": false },
  { "brand": "Volvo", "model": "C40 Recharge", "year": 2023, "color": "Branco Gelo", "price": 342000, "isSold": false },
  { "brand": "Hyundai", "model": "Ioniq 5", "year": 2024, "color": "Prata", "price": 268000, "isSold": false },
  { "brand": "Kia", "model": "EV6 GT-Line", "year": 2023, "color": "Verde Escuro", "price": 295000, "isSold": false },
  { "brand": "Porsche", "model": "Taycan 4S", "year": 2024, "color": "Preto Carbon", "price": 695000, "isSold": false }
]
```

Os dados ficam em memória durante a execução para fins de demonstração.

## Autenticação com AWS Cognito

A API valida tokens emitidos por um User Pool do Amazon Cognito. Fluxo sugerido:

1. No console da AWS, crie um User Pool (ex.: `postech-car`) com o Hosted UI habilitado ou utilize o CLI para autenticação.
2. Crie um App Client sem `client secret` (ex.: `postech-car-api`) e habilite o fluxo `USER_PASSWORD_AUTH` ou o Hosted UI.
3. Crie grupos chamados `buyer` (para compradores) e `seller` (para quem pode cadastrar/editar veículos) e associe os usuários apropriados.
4. Gere tokens de acesso/ID via Hosted UI ou pelo comando `aws cognito-idp initiate-auth`, utilizando o usuário cadastrado.

### Variáveis de ambiente da API

Configure um `.env` com os dados do User Pool:

```env
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_abc123DEF
COGNITO_CLIENT_ID=4h1exampleappclient
AUTH_REQUIRED_ROLE=buyer
AUTH_SELLER_ROLE=seller
# Opcional: sobrescreve o issuer, caso prefira informar diretamente
# COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_abc123DEF
```

O middleware `authenticate` usa essas informações para buscar as chaves públicas (`/.well-known/jwks.json`), validar o JWT e carregar `req.user`. O endpoint `POST /api/vehicles/:id/purchase` exige que o token traga o grupo `buyer` em `cognito:groups` antes de marcar o veículo como vendido.
