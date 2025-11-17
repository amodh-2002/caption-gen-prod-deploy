# Infrastructure

This directory contains infrastructure-as-code, configuration files, and deployment manifests for the Caption Generator application.

## Directory Structure

```
infrastructure/
├── db/                    # Database schema and migrations
│   ├── init.sql          # Initial database schema
│   └── README.md         # Database documentation
├── kubernetes/            # Kubernetes/EKS manifests (future)
│   ├── namespaces/       # Namespace definitions
│   ├── deployments/      # Deployment manifests
│   ├── services/         # Service definitions (ClusterIP, etc.)
│   ├── configmaps/       # ConfigMap definitions
│   ├── secrets/          # Secret templates (no actual secrets!)
│   ├── ingress/          # Ingress/ALB configurations
│   ├── statefulsets/     # StatefulSet for PostgreSQL
│   ├── persistentvolumes/ # PVC definitions
│   └── networkpolicies/  # Network policy rules
├── terraform/            # Terraform IaC (optional, future)
│   ├── eks/             # EKS cluster configuration
│   ├── networking/       # VPC, subnets, etc.
│   └── rds/              # RDS configuration (if not using containerized DB)
└── helm/                 # Helm charts (optional, future)
    └── caption-gen/      # Main application chart
```

## Current Contents

### `db/`

- **init.sql**: PostgreSQL database schema with tables, triggers, views, and initial data
- Used by Docker Compose and will be used by Kubernetes StatefulSet init containers

## Future Additions

### `kubernetes/` (For EKS Deployment)

This folder will contain all Kubernetes manifests organized by resource type:

- **namespaces/**: Application namespace definitions
- **deployments/**: Pod deployment configurations for:
  - Frontend (Next.js)
  - Backend (Flask)
  - Auth Service (FastAPI)
- **services/**: Kubernetes Service definitions:
  - ClusterIP services for internal communication
  - Headless service for PostgreSQL StatefulSet
  - LoadBalancer/Ingress for external access
- **configmaps/**: Non-sensitive configuration
- **secrets/**: Secret templates (actual secrets stored in AWS Secrets Manager or sealed-secrets)
- **ingress/**: ALB Ingress Controller configurations
- **statefulsets/**: PostgreSQL StatefulSet with persistent volumes
- **persistentvolumes/**: PVC definitions for database storage
- **networkpolicies/**: Network security policies

### `terraform/` (Optional)

If using Terraform for infrastructure provisioning:

- EKS cluster creation
- VPC and networking setup
- IAM roles and policies
- ECR repositories

### `helm/` (Optional)

If using Helm for package management:

- Chart definitions
- Values files for different environments

## Usage

### Local Development

The `db/init.sql` is automatically used by Docker Compose when initializing the PostgreSQL container.

### Kubernetes Deployment

Manifests in `kubernetes/` will be applied using `kubectl`:

```bash
# Apply all manifests
kubectl apply -f infrastructure/kubernetes/

# Or apply specific resources
kubectl apply -f infrastructure/kubernetes/deployments/
kubectl apply -f infrastructure/kubernetes/services/
```

## Best Practices

1. **Never commit secrets**: Use Kubernetes Secrets, AWS Secrets Manager, or sealed-secrets
2. **Version control**: All infrastructure changes should be tracked in git
3. **Environment separation**: Use different values/configs for dev, staging, prod
4. **Documentation**: Keep README files updated as structure evolves
