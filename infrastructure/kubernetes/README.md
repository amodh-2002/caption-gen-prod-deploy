# Kubernetes Manifests for Caption Generator

This directory contains all Kubernetes manifests needed to deploy the Caption Generator application to Amazon EKS.

## Directory Structure

```
kubernetes/
├── namespaces/          # Namespace definitions
├── configmaps/          # Non-sensitive configuration
├── secrets/             # Secret templates (DO NOT commit actual secrets!)
├── statefulsets/        # PostgreSQL StatefulSet
├── deployments/         # Application deployments
├── services/            # Kubernetes Services (ClusterIP, Headless)
├── ingress/             # ALB Ingress configuration
├── networkpolicies/     # Network security policies
└── persistentvolumes/   # PVC definitions (in StatefulSet)
```

## Prerequisites

Before deploying, ensure you have:

1. **EKS Cluster** - Running Kubernetes 1.24+
2. **kubectl** - Configured to connect to your EKS cluster
3. **AWS ALB Ingress Controller** - Installed in your cluster
4. **ECR Repository** - For storing Docker images
5. **ACM Certificate** - SSL certificate for your domain
6. **Storage Class** - `gp3` storage class for EBS volumes

## Deployment Steps

### 1. Build and Push Docker Images

```bash
# Authenticate with ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag images
docker build -t <account-id>.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest ./services/auth
docker build -t <account-id>.dkr.ecr.us-east-1.amazonaws.com/backend-service:latest ./backend
docker build -t <account-id>.dkr.ecr.us-east-1.amazonaws.com/frontend-service:latest ./frontend

# Push images
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/backend-service:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/frontend-service:latest
```

### 2. Create Secrets

**IMPORTANT**: Never commit actual secrets to git!

```bash
# Create database secrets
kubectl create secret generic database-secrets \
  --from-literal=POSTGRES_PASSWORD='your-secure-password' \
  --from-literal=DB_PASSWORD='your-secure-password' \
  --namespace=caption-gen

# Create auth secrets
kubectl create secret generic auth-secrets \
  --from-literal=JWT_SECRET='your-random-jwt-secret-min-32-chars' \
  --namespace=caption-gen

# Create backend secrets
kubectl create secret generic backend-secrets \
  --from-literal=GOOGLE_API_KEY='your-google-api-key' \
  --namespace=caption-gen
```

### 3. Update Configuration Files

Before applying, update these files with your values:

1. **Update image references** in deployment files:
   - `deployments/auth-deployment.yaml`
   - `deployments/backend-deployment.yaml`
   - `deployments/frontend-deployment.yaml`
   - Replace `your-ecr-repo` with your actual ECR repository URL

2. **Update domain names** in:
   - `configmaps/frontend-config.yaml` - Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_AUTH_URL`
   - `configmaps/auth-service-config.yaml` - Set `CORS_ORIGINS`
   - `ingress/alb-ingress.yaml` - Set `host` and `certificate-arn`

3. **Update storage class** in `statefulsets/postgres-statefulset.yaml` if not using `gp3`

### 4. Deploy in Order

```bash
# 1. Create namespace
kubectl apply -f namespaces/

# 2. Create ConfigMaps
kubectl apply -f configmaps/

# 3. Create Secrets (already done in step 2)

# 4. Deploy PostgreSQL StatefulSet
kubectl apply -f statefulsets/
kubectl apply -f services/postgres-headless-service.yaml

# 5. Wait for database to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n caption-gen --timeout=300s

# 6. Deploy Auth Service
kubectl apply -f deployments/auth-deployment.yaml
kubectl apply -f services/auth-service.yaml

# 7. Deploy Backend Service
kubectl apply -f deployments/backend-deployment.yaml
kubectl apply -f services/backend-service.yaml

# 8. Deploy Frontend Service
kubectl apply -f deployments/frontend-deployment.yaml
kubectl apply -f services/frontend-service.yaml

# 9. Deploy Ingress
kubectl apply -f ingress/

# 10. Deploy Network Policies (optional but recommended)
kubectl apply -f networkpolicies/
```

### 5. Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n caption-gen

# Check services
kubectl get svc -n caption-gen

# Check ingress
kubectl get ingress -n caption-gen

# View logs
kubectl logs -f deployment/auth-service -n caption-gen
kubectl logs -f deployment/backend-service -n caption-gen
kubectl logs -f deployment/frontend-service -n caption-gen
```

## Service Communication

### Internal Communication (ClusterIP)

- **Frontend → Auth**: `http://auth-service:4000`
- **Frontend → Backend**: `http://backend-service:5000`
- **Backend → Auth**: `http://auth-service:4000`
- **Auth → Database**: `postgres-headless:5432`

### External Access (via Ingress)

- **Frontend**: `https://yourdomain.com`
- **Auth API**: `https://yourdomain.com/api/auth`
- **Backend API**: `https://yourdomain.com/api/backend`

## Security Features

1. **Network Policies**: Restrict pod-to-pod communication
2. **Secrets**: Sensitive data stored in Kubernetes Secrets
3. **ClusterIP Services**: Internal services not exposed externally
4. **Headless Database**: Database only accessible within cluster
5. **Resource Limits**: CPU and memory limits on all pods

## Scaling

To scale services:

```bash
# Scale auth service
kubectl scale deployment auth-service --replicas=3 -n caption-gen

# Scale backend service
kubectl scale deployment backend-service --replicas=3 -n caption-gen

# Scale frontend service
kubectl scale deployment frontend-service --replicas=3 -n caption-gen
```

## Troubleshooting

### Pods not starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n caption-gen

# Check logs
kubectl logs <pod-name> -n caption-gen

# Check events
kubectl get events -n caption-gen --sort-by='.lastTimestamp'
```

### Database connection issues

```bash
# Check database pod
kubectl get pods -l app=postgres -n caption-gen

# Check database logs
kubectl logs -l app=postgres -n caption-gen

# Test database connectivity from auth pod
kubectl exec -it deployment/auth-service -n caption-gen -- ping postgres-headless
```

### Service connectivity

```bash
# Test service endpoints
kubectl run curl-test --image=curlimages/curl -it --rm --restart=Never -- \
  curl http://auth-service:4000/health

# Check service endpoints
kubectl get endpoints -n caption-gen
```

## Maintenance

### Database Backup

```bash
# Create backup
kubectl exec -it postgres-0 -n caption-gen -- \
  pg_dump -U postgres caption_gen > backup.sql

# Restore backup
kubectl exec -i postgres-0 -n caption-gen -- \
  psql -U postgres caption_gen < backup.sql
```

### Update Application

```bash
# Update image tag in deployment
kubectl set image deployment/auth-service auth=your-ecr-repo/auth-service:v1.1.0 -n caption-gen

# Rollout update
kubectl rollout status deployment/auth-service -n caption-gen

# Rollback if needed
kubectl rollout undo deployment/auth-service -n caption-gen
```

## Production Checklist

- [ ] All secrets created and secured
- [ ] ECR images pushed and tagged
- [ ] Domain configured and DNS pointing to ALB
- [ ] SSL certificate configured in ACM
- [ ] Storage class configured for PVCs
- [ ] Resource limits appropriate for workload
- [ ] Network policies applied
- [ ] Monitoring and logging configured
- [ ] Backup strategy in place
- [ ] Disaster recovery plan documented

