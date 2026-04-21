# Backend config is passed via -backend-config flag at terraform init time.
# See backend-dev.hcl, backend-staging.hcl, backend-prod.hcl.
terraform {
  backend "s3" {}
}
