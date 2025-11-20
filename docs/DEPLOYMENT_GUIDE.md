# EKS Deployment Guide

Complete step-by-step guide for deploying Caption Generator to Amazon EKS.

## Prerequisites Checklist

- [ ] AWS Account with appropriate permissions
- [ ] EKS Cluster (1.31) created
- [ ] kubectl configured (`aws eks update-kubeconfig --name <cluster-name> --region <region>`)
- [ ] AWS ALB Ingress Controller installed
- [ ] ECR repositories created for all services
- [ ] ACM SSL certificate created for your domain
- [ ] Domain DNS configured (or ready to configure)

## Step 1: Create ECR Repositories

```bash
# Set variables
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create repositories
aws ecr create-repository --repository-name auth-service --region $REGION
aws ecr create-repository --repository-name backend-service --region $REGION
aws ecr create-repository --repository-name frontend-service --region $REGION
```

## Step 2: Build and Push Docker Images

```bash
# Authenticate Docker with ECR
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build images
docker build -t $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/auth-service:latest ./services/auth
docker build -t $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/backend-service:latest ./backend
docker build -t $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/frontend-service:latest ./frontend

# Push images
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/auth-service:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/backend-service:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/frontend-service:latest
```

## Step 3: Update Kubernetes Manifests

### 3.1 Update Image References

Edit these files and replace `your-ecr-repo`:

- `deployments/auth-deployment.yaml`: Line with image
- `deployments/backend-deployment.yaml`: Line with image  
- `deployments/frontend-deployment.yaml`: Line with image

Replace with: `<account-id>.dkr.ecr.<region>.amazonaws.com/<service-name>:latest`

### 3.2 Update Domain Configuration

Edit `configmaps/frontend-config.yaml`:
```yaml
NEXT_PUBLIC_API_URL: "https://yourdomain.com/api/backend"
NEXT_PUBLIC_AUTH_URL: "https://yourdomain.com/api/auth"
```

Edit `configmaps/auth-service-config.yaml`:
```yaml
CORS_ORIGINS: "https://yourdomain.com,https://www.yourdomain.com"
```

Edit `ingress/alb-ingress.yaml`:
- Update `host` fields with your domain
- Update `certificate-arn` with your ACM certificate ARN

### 3.3 Update Storage Class (if needed)

If your EKS cluster doesn't use `gp3`, update `statefulsets/postgres-statefulset.yaml`:
```yaml
storageClassName: gp3  # Change to your storage class
```

## Step 4: Create Secrets

```bash
# Create namespace first
kubectl apply -f infrastructure/kubernetes/namespaces/

# Create database secret
kubectl create secret generic database-secrets \
  --from-literal=POSTGRES_PASSWORD='GenerateSecurePassword123!' \
  --from-literal=DB_PASSWORD='GenerateSecurePassword123!' \
  --namespace=caption-gen

# Create auth secret (generate random 32+ char string)
kubectl create secret generic auth-secrets \
  --from-literal=JWT_SECRET='$(openssl rand -base64 32)' \
  --namespace=caption-gen

# Create backend secret
kubectl create secret generic backend-secrets \
  --from-literal=GOOGLE_API_KEY='your-actual-google-api-key' \
  --namespace=caption-gen
```

## Step 5: Deploy Application

### Option A: Deploy All at Once (Recommended)

```bash
# Apply all manifests
kubectl apply -k infrastructure/kubernetes/

# Or apply individually:
kubectl apply -f infrastructure/kubernetes/
```

### Option B: Deploy Step by Step

```bash
# 1. Namespace
kubectl apply -f infrastructure/kubernetes/namespaces/

# 2. ConfigMaps
kubectl apply -f infrastructure/kubernetes/configmaps/

# 3. Database (StatefulSet + Service)
kubectl apply -f infrastructure/kubernetes/statefulsets/
kubectl apply -f infrastructure/kubernetes/services/postgres-headless-service.yaml

# Wait for database to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n caption-gen --timeout=300s

# 4. Auth Service
kubectl apply -f infrastructure/kubernetes/deployments/auth-deployment.yaml
kubectl apply -f infrastructure/kubernetes/services/auth-service.yaml

# 5. Backend Service
kubectl apply -f infrastructure/kubernetes/deployments/backend-deployment.yaml
kubectl apply -f infrastructure/kubernetes/services/backend-service.yaml

# 6. Frontend Service
kubectl apply -f infrastructure/kubernetes/deployments/frontend-deployment.yaml
kubectl apply -f infrastructure/kubernetes/services/frontend-service.yaml

# 7. Ingress
kubectl apply -f infrastructure/kubernetes/ingress/

# 8. Network Policies (optional)
kubectl apply -f infrastructure/kubernetes/networkpolicies/
```

## Step 6: Verify Deployment

```bash
# Check all pods
kubectl get pods -n caption-gen

# Check services
kubectl get svc -n caption-gen

# Check ingress (will show ALB address)
kubectl get ingress -n caption-gen

# Check pod logs
kubectl logs -f deployment/auth-service -n caption-gen
kubectl logs -f deployment/backend-service -n caption-gen
kubectl logs -f deployment/frontend-service -n caption-gen
```

## Step 7: Configure DNS

After Ingress is created, get the ALB address:

```bash
kubectl get ingress caption-gen-ingress -n caption-gen
```

Update your DNS to point to the ALB address:
- Create A record: `yourdomain.com` → ALB address
- Create A record: `www.yourdomain.com` → ALB address

## Step 8: Test Application

1. Wait for DNS propagation (5-30 minutes)
2. Visit `https://yourdomain.com`
3. Test signup/login
4. Test caption generation

## Troubleshooting

### Pods in CrashLoopBackOff

```bash
# Check pod status
kubectl describe pod <pod-name> -n caption-gen

# Check logs
kubectl logs <pod-name> -n caption-gen --previous  # Previous container if restarted
```

### Database Connection Errors

```bash
# Verify database is running
kubectl get pods -l app=postgres -n caption-gen

# Check database logs
kubectl logs -l app=postgres -n caption-gen

# Test connectivity
kubectl run postgres-client --rm -it --restart=Never --image=postgres:18-alpine -- \
  psql -h postgres-headless -U postgres -d caption_gen
```

### Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints -n caption-gen

# Test service from within cluster
kubectl run curl-test --image=curlimages/curl -it --rm --restart=Never -- \
  curl http://auth-service:4000/health
```

### Ingress Not Working

```bash
# Check ALB Ingress Controller logs
kubectl logs -n kube-system deployment/aws-load-balancer-controller

# Check ingress status
kubectl describe ingress caption-gen-ingress -n caption-gen
```

## Scaling

```bash
# Scale services
kubectl scale deployment auth-service --replicas=3 -n caption-gen
kubectl scale deployment backend-service --replicas=3 -n caption-gen
kubectl scale deployment frontend-service --replicas=3 -n caption-gen
```

## Updates and Rollbacks

```bash
# Update image
kubectl set image deployment/auth-service \
  auth=<new-image-tag> -n caption-gen

# Monitor rollout
kubectl rollout status deployment/auth-service -n caption-gen

# Rollback if needed
kubectl rollout undo deployment/auth-service -n caption-gen
```

## Cleanup

To remove everything:

```bash
# Delete all resources
kubectl delete -k infrastructure/kubernetes/

# Delete namespace (will delete everything in it)
kubectl delete namespace caption-gen

# Delete secrets manually if needed
kubectl delete secret database-secrets auth-secrets backend-secrets -n caption-gen
```

## Next Steps

After successful deployment:

1. Set up monitoring (CloudWatch, Prometheus)
2. Configure log aggregation
3. Set up automated backups
4. Configure auto-scaling
5. Set up CI/CD pipeline
6. Configure alerting

