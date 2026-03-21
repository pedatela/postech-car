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

- **Domain**: contém a entidade `Vehicle` e o contrato `VehiclesRepository`. O veículo possui os atributos `brand`, `model`, `year`, `color`, `price` e `isSold`.
- **Application**: `VehiclesService` orquestra os casos de uso utilizando o repositório.
- **Infra**: `InMemoryVehiclesRepository` implementa o repositório usando armazenamento em memória, ideal para prototipação.
- **HTTP**: controllers e rotas expõem os casos de uso via Express e validam o payload com [Zod](https://zod.dev).

## Infraestrutura (Terraform + ECS)

O diretório `terraform/` contém os manifestos necessários para levantar a infraestrutura em AWS:

- VPC pública simples com duas subnets, Internet Gateway e regramento mínimo.
- Repositório ECR para armazenar as imagens do serviço.
- Cluster ECS Fargate com uma service/Task Definition (`256 CPU / 512 MB`), apontando para o container exposto na porta 3000.
- Log Group do CloudWatch e Load Balancer (ALB) servindo o tráfego HTTP público.

### Pré-requisitos

- AWS CLI autenticado.
- Terraform >= 1.5.
- Conta AWS preparada para criar os recursos (VPC, ECS, IAM, etc.).

### Comandos úteis

```bash
cd terraform
terraform init \
  -backend-config="bucket=<nome-do-bucket>" \
  -backend-config="key=<prefixo>/terraform.tfstate" \
  -backend-config="region=<aws-region>" \
  -backend-config="dynamodb_table=<tabela-lock>"
terraform plan -var container_image=<aws_account>.dkr.ecr.<region>.amazonaws.com/postech-car:<tag>
terraform apply -var container_image=<...>
```

A configuração do backend (`terraform/providers.tf`) espera um bucket S3 e uma tabela DynamoDB para controlar o state/lock; defina-os via `-backend-config` ou crie um arquivo `.tfbackend`.

A variável `container_image` deve apontar para a imagem armazenada no ECR (o workflow do GitHub Actions preenche automaticamente quando roda o deploy).

## GitHub Actions

O workflow `.github/workflows/deploy.yml` executa automaticamente em `push` ou `pull_request` para `main`:

1. Instala dependências, roda `npm run lint` e `npm test`.
2. Faz login no ECR, gera a imagem Docker e publica com a tag `SHA`.
3. Executa Terraform (`init`, `fmt`, `validate`, `plan`, `apply`) informando a nova imagem.

Também existe uma execução manual (`workflow_dispatch`) com o input `action=destroy`. Ao rodar esse modo, apenas o job `destroy_infra` é executado, chamando `terraform destroy` para remover todos os recursos (mantendo apenas o state S3/Dynamo). Use essa opção quando quiser derrubar o ambiente e economizar custos.

### Secrets necessários

Configure os seguintes secrets no repositório:

- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`: credenciais com permissão para ECR, ECS, IAM e VPC.
- `AWS_ACCOUNT_ID`: conta usada para montar a URL do ECR.
- `TF_STATE_BUCKET`, `TF_STATE_KEY`, `TF_STATE_DYNAMODB_TABLE`: backend remoto usado pelo Terraform (crie o bucket/Dynamo previamente).

Opcionalmente ajuste `AWS_REGION`, `ECR_REPOSITORY` e `TF_WORKING_DIR` nas variáveis do workflow.

### Rotas de veículos

- `GET /api/vehicles` lista todos os veículos cadastrados. Aceita o query param `status=available|sold` para filtrar e ordenar (por preço ascendente) apenas os veículos à venda ou vendidos.
- `GET /api/vehicles/:id` busca um veículo específico.
- `POST /api/vehicles` cadastra um novo veículo (`brand`, `model`, `year`, `color`, `price`, `isSold` - padrão `false`).
- `PUT /api/vehicles/:id` atualiza dados de um veículo existente.
- `DELETE /api/vehicles/:id` remove um veículo.

Os dados ficam em memória durante a execução para fins de demonstração.
